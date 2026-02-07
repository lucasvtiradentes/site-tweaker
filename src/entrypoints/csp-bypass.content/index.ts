export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  world: 'ISOLATED',
  main() {
    window.addEventListener('message', async (event) => {
      if (event.source !== window) return

      const msg = event.data
      if (msg?.type !== 'ST_FETCH_PROXY_REQUEST') return

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'CSP_BYPASS_FETCH',
          url: msg.url,
          method: msg.method,
          headers: msg.headers,
          body: msg.body,
        })

        window.postMessage(
          {
            type: 'ST_FETCH_PROXY_RESPONSE',
            requestId: msg.requestId,
            ...response,
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
