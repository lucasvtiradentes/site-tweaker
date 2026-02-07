// CSP Bypass Proxy - Runs in isolated world (not subject to page CSP)
// Intercepts fetch calls from page scripts when CSP blocks them

const LOG = '[site-tweaker:csp-bypass]'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  world: 'ISOLATED', // Critical: runs in isolated world, bypasses page CSP
  main() {
    // Listen for fetch proxy requests from page scripts
    window.addEventListener('message', async (event) => {
      // Only accept messages from same origin
      if (event.source !== window) return

      const msg = event.data
      if (msg?.type !== 'ST_FETCH_PROXY_REQUEST') return

      try {
        const response = await fetch(msg.url, {
          method: msg.method || 'GET',
          headers: msg.headers || {},
          body: msg.body,
        })

        const text = await response.text()
        let json = null
        try {
          json = JSON.parse(text)
        } catch {
          // not JSON
        }

        window.postMessage(
          {
            type: 'ST_FETCH_PROXY_RESPONSE',
            requestId: msg.requestId,
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            text,
            json,
          },
          '*',
        )
      } catch (err) {
        window.postMessage(
          {
            type: 'ST_FETCH_PROXY_RESPONSE',
            requestId: msg.requestId,
            ok: false,
            status: 0,
            error: err instanceof Error ? err.message : String(err),
          },
          '*',
        )
      }
    })
  },
})
