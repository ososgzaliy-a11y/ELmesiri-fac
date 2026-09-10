export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // Prevent browser and proxy caching for HTML, JS, and CSS so code updates apply immediately
    if (pathname.endsWith('.html') || pathname.endsWith('.js') || pathname.endsWith('.css') || pathname === '/' || pathname === '') {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      newHeaders.set('Pragma', 'no-cache');
      newHeaders.set('Expires', '0');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return response;
  }
};
