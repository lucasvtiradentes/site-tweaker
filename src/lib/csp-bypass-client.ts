// Client-side code injected into page scripts to use CSP bypass proxy
// This gets prepended to userscripts that need fetch capabilities

export function generateCspBypassCode(cspBypassDomains: string[] = []): string {
  return `
(function() {
  if (window.__ST_FETCH_PROXY_INSTALLED) return;
  window.__ST_FETCH_PROXY_INSTALLED = true;

  const LOG = '[site-tweaker:fetch-proxy]';
  const pendingRequests = new Map();
  let requestCounter = 0;

  // Listen for responses from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const msg = event.data;
    if (msg?.type !== 'ST_FETCH_PROXY_RESPONSE') return;

    const pending = pendingRequests.get(msg.requestId);
    if (!pending) return;

    pendingRequests.delete(msg.requestId);

    if (msg.error) {
      pending.reject(new Error(msg.error));
    } else {
      pending.resolve({
        ok: msg.ok,
        status: msg.status,
        statusText: msg.statusText,
        text: async () => msg.text,
        json: async () => msg.json || JSON.parse(msg.text),
      });
    }
  });

  // Proxy fetch via content script (no CSP errors logged)
  function proxyFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestId = ++requestCounter;

      pendingRequests.set(requestId, { resolve, reject });

      // Timeout after 30s
      setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          reject(new Error('Fetch proxy timeout'));
        }
      }, 30000);

      window.postMessage({
        type: 'ST_FETCH_PROXY_REQUEST',
        requestId,
        url: typeof url === 'string' ? url : url.toString(),
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body,
      }, '*');
    });
  }

  // Store original fetch
  const originalFetch = window.fetch;

  // CSP bypass domains injected from script configuration
  const CSP_PROXY_DOMAINS = ${JSON.stringify(cspBypassDomains)};

  // Override fetch to use proxy for specific domains (avoids CSP console errors)
  window.fetch = async function(url, options) {
    const urlStr = typeof url === 'string' ? url : url.toString();

    // Check if this URL should use proxy
    const shouldProxy = CSP_PROXY_DOMAINS.some(domain => urlStr.includes(domain));

    if (shouldProxy) {
      return await proxyFetch(urlStr, options);
    }

    // For all other requests, use original fetch
    return await originalFetch.call(this, url, options);
  };
})();
`.trim()
}

// Helper to match domain patterns (supports wildcards like *.example.com)
export function matchesCspBypassPattern(url: string, patterns: string[]): boolean {
  if (patterns.length === 0) return false

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    return patterns.some((pattern) => {
      // Wildcard subdomain: *.example.com matches api.example.com, foo.example.com, etc
      if (pattern.startsWith('*.')) {
        const domain = pattern.slice(2)
        return hostname === domain || hostname.endsWith(`.${domain}`)
      }

      // Exact match or substring
      return hostname === pattern || hostname.includes(pattern)
    })
  } catch {
    return false
  }
}
