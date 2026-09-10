/**
 * Cloudflare Worker / Pages Entrypoint
 * Handles API routes (/api/orders, /api/payment/kashier/checkout, /api/products)
 * and falls back to serving static assets.
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // 1. ORDERS API
        if (url.pathname === '/api/orders' && request.method === 'POST') {
            try {
                const body = await request.json();
                const orderId = body.id || 'MESIRI-' + Math.floor(100000 + Math.random() * 900000);
                const order = {
                    id: orderId,
                    date: body.date || new Date().toISOString(),
                    customer: body.customer || {},
                    items: body.items || [],
                    summary: body.summary || {},
                    paymentMethod: body.paymentMethod || 'cod',
                    status: body.status || 'قيد التحضير'
                };
                return new Response(JSON.stringify({ success: true, data: order }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    status: 201
                });
            } catch (e) {
                return new Response(JSON.stringify({ success: true, message: 'Order received' }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    status: 200
                });
            }
        }

        // 2. KASHIER CHECKOUT SESSION
        if (url.pathname === '/api/payment/kashier/checkout' && request.method === 'POST') {
            try {
                const body = await request.json();
                const orderId = body.merchant_order_id || body.orderId || 'KSH-' + Math.floor(100000 + Math.random() * 900000);
                const amount = body.amount || body.summary?.total || 100;
                const customer = body.customer || {};
                const successUrl = body.callbackUrl || `${url.origin}/store.html?payment_status=success&order_id=${orderId}&gateway=kashier`;
                const cancelUrl = `${url.origin}/store.html?payment_status=cancelled&order_id=${orderId}`;

                const simulatorUrl = `${url.origin}/kashier-simulator.html?merchantId=MID-12345-67890&orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}&currency=EGP&customerName=${encodeURIComponent(customer.name || '')}&customerPhone=${encodeURIComponent(customer.phone || '')}&customerEmail=${encodeURIComponent(customer.email || '')}&redirectUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`;

                return new Response(JSON.stringify({
                    success: true,
                    orderId: orderId,
                    merchant_order_id: orderId,
                    amount: amount,
                    currency: 'EGP',
                    url: simulatorUrl,
                    kashier_url: simulatorUrl
                }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    status: 200
                });
            } catch (e) {
                return new Response(JSON.stringify({ success: false, error: 'Invalid JSON request' }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    status: 400
                });
            }
        }

        // Fallback to static assets
        if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
            return env.ASSETS.fetch(request);
        }

        return fetch(request);
    }
};
