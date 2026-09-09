const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Load environment variables from .env file
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#') && line.includes('=')) {
                const idx = line.indexOf('=');
                const key = line.substring(0, idx).trim();
                const val = line.substring(idx + 1).trim();
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            }
        });
    }
}
loadEnv();

const PORT = process.env.PORT || 8000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory and DB file exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed products
const INITIAL_PRODUCTS = [
    {
        id: 'boxer-premium-black',
        name: 'بوكسر رجالي قطن مصري فاخر أسود',
        category: 'boxers',
        categoryName: 'بوكسرات قطنية',
        price: 250,
        originalPrice: 320,
        rating: 4.9,
        reviewsCount: 345,
        badge: 'الأكثر مبيعاً',
        badgeType: 'bestseller',
        image: 'assets/images/product_boxer.jpg',
        gallery: [
            'assets/images/product_boxer.jpg',
            'assets/images/fabrics_rolls.jpg'
        ],
        colors: [
            { name: 'أسود كلاسيك', hex: '#111113', inStock: true },
            { name: 'كحلي داكن', hex: '#1c2841', inStock: true },
            { name: 'رمادي ميلانج', hex: '#8c92ac', inStock: true }
        ],
        sizes: ['M', 'L', 'XL', '2XL', '3XL', '4XL'],
        stock: 450,
        fabric: '95% قطن مصري ممشط (Combed Cotton) + 5% إيلاستين لمرونة استثنائية',
        details: [
            'حزام خصر مرن ومريح لا يترك علامات على الجلد',
            'تصميم داعم ومانع للاحتكاك للاستخدام اليومي المريح',
            'نسيج يسمح بالتهوية ويمتص الرطوبة بكفاءة عالية',
            'معالج ضد الانكماش والبهتان بعد الغسيل المتكرر'
        ],
        careInstructions: 'غسيل آلي بدرجة حرارة 40° مئوية كحد أقصى، يمكن استخدام التجفيف الآلي بدرجة حرارة منخفضة',
        b2b: {
            moq: 100,
            tiers: [
                { min: 100, max: 499, price: 145, discount: '42%' },
                { min: 500, max: 999, price: 125, discount: '50%' },
                { min: 1000, max: 5000, price: 110, discount: '56%' }
            ],
            productionTime: '7 - 14 يوم عمل',
            customizationOptions: ['تطريز شعار الماركة على الكمر', 'ألوان مخصصة', 'تغليف خاص بالبراند (Private Label)']
        }
    },
    {
        id: 'undershirt-vneck-white',
        name: 'فانلة داخلية نصف كم ياقة سبعة (V-Neck) بيضاء',
        category: 'undershirts',
        categoryName: 'فانلات داخلية',
        price: 180,
        originalPrice: 220,
        rating: 4.8,
        reviewsCount: 215,
        badge: 'قطن 100%',
        badgeType: 'featured',
        image: 'assets/images/product_undershirt.jpg',
        gallery: [
            'assets/images/product_undershirt.jpg',
            'assets/images/hero_mesiri.jpg'
        ],
        colors: [
            { name: 'أبيض ناصع', hex: '#ffffff', inStock: true },
            { name: 'أسود', hex: '#111113', inStock: true }
        ],
        sizes: ['M', 'L', 'XL', '2XL', '3XL'],
        stock: 320,
        fabric: '100% قطن مصري جيزة فائق النعومة واللمعان',
        details: [
            'ياقة V-Neck مثالية للارتداء أسفل القمصان المفتوحة دون أن تظهر',
            'خياطة مزدوجة ناعمة عند الأكتاف لتجنب أي احتكاك',
            'قصة (Slim Fit) مريحة تأخذ شكل الجسم',
            'يمتص العرق بكفاءة للحفاظ على جفاف الجسم طوال اليوم'
        ],
        careInstructions: 'غسيل بالماء الدافئ، يمكن كيّه بدرجة حرارة متوسطة، لا تستخدم المبيضات بكثرة',
        b2b: {
            moq: 200,
            tiers: [
                { min: 200, max: 999, price: 95, discount: '47%' },
                { min: 1000, max: 2999, price: 80, discount: '55%' },
                { min: 3000, max: 10000, price: 72, discount: '60%' }
            ],
            productionTime: '10 - 15 يوم عمل',
            customizationOptions: ['تعديل شكل الياقة', 'طباعة الشعار حرارياً من الداخل', 'تصنيع لحساب الغير']
        }
    },
    {
        id: 'briefs-classic-white',
        name: 'سروال داخلي كلاسيك (Briefs) أبيض مريح',
        category: 'briefs',
        categoryName: 'سراويل كلاسيك',
        price: 120,
        originalPrice: 150,
        rating: 4.6,
        reviewsCount: 189,
        badge: 'خصم خاص',
        badgeType: 'sale',
        image: 'assets/images/product_briefs.jpg',
        gallery: [
            'assets/images/product_briefs.jpg',
            'assets/images/factory_production.jpg'
        ],
        colors: [
            { name: 'أبيض', hex: '#ffffff', inStock: true },
            { name: 'رمادي فاتح', hex: '#d1d5db', inStock: true }
        ],
        sizes: ['M', 'L', 'XL', '2XL', '3XL'],
        stock: 280,
        fabric: '100% قطن مصري عالي الامتصاص',
        details: [
            'قصة كلاسيكية تقليدية مريحة لأقصى درجات حرية الحركة',
            'أستك داخلي مغطى بالقماش لحماية البشرة الحساسة',
            'ثبات تام للألوان ومقاومة عالية للاهتراء',
            'مناسب للاستخدام اليومي والرياضي'
        ],
        careInstructions: 'غسيل عادي، غسيل مع ألوان مماثلة',
        b2b: {
            moq: 300,
            tiers: [
                { min: 300, max: 999, price: 65, discount: '45%' },
                { min: 1000, max: 4999, price: 55, discount: '54%' },
                { min: 5000, max: 20000, price: 48, discount: '60%' }
            ],
            productionTime: '7 - 12 يوم عمل',
            customizationOptions: ['تغليف علب كرتونية متعددة (3 قطع / 6 قطع)', 'طباعة الباركود']
        }
    }
];

function readDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initial = {
                products: INITIAL_PRODUCTS,
                orders: [],
                rfqs: []
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
            return initial;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.products || parsed.products.length === 0) {
            parsed.products = INITIAL_PRODUCTS;
            writeDB(parsed);
        }
        if (!parsed.orders) parsed.orders = [];
        if (!parsed.rfqs) parsed.rfqs = [];
        return parsed;
    } catch (e) {
        console.error('Error reading DB:', e);
        return { products: INITIAL_PRODUCTS, orders: [], rfqs: [] };
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error writing DB:', e);
        return false;
    }
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

function sendJSON(res, data, statusCode = 200) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-cashier-signature, x-signature'
    });
    res.end(JSON.stringify(data));
}

/**
 * Syncs an order with Firebase Cloud Database (Realtime DB or Firestore) asynchronously
 */
function syncOrderWithFirebaseServer(order) {
    const firebaseDbUrl = process.env.FIREBASE_DB_URL || process.env.FIREBASE_URL;
    if (!firebaseDbUrl) {
        // Firebase Cloud DB URL not set in .env yet
        return;
    }

    try {
        const cleanUrl = firebaseDbUrl.replace(/\/$/, '');
        const targetUrl = new URL(`${cleanUrl}/orders/${order.id}.json`);
        const postData = JSON.stringify(order);

        const req = https.request({
            hostname: targetUrl.hostname,
            path: targetUrl.pathname + (targetUrl.search || ''),
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`[Firebase Cloud] ☁️ Order #${order.id} automatically synced to Firebase Realtime Database!`);
            } else {
                console.warn(`[Firebase Cloud] Warning: Server response code ${res.statusCode} from Firebase`);
            }
        });

        req.on('error', (e) => {
            console.warn('[Firebase Cloud] Notice: Cloud sync network note:', e.message);
        });

        req.write(postData);
        req.end();
    } catch(err) {
        console.warn('[Firebase Cloud] Error preparing request:', err.message);
    }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-cashier-signature, x-signature'
        });
        res.end();
        return;
    }

    // =========================================================================
    // 💳 KASHIER CHECKOUT SESSIONS INTEGRATION
    // =========================================================================

    /**
     * 1. KASHIER CHECKOUT INTEGRATION (HOSTED CHECKOUT)
     * POST /api/payment/kashier/checkout
     * Securely generates the HMAC SHA256 hash required by Kashier
     */
    if (pathname === '/api/payment/kashier/checkout' && method === 'POST') {
        const body = await parseBody(req);
        const db = readDB();

        const orderId = body.merchant_order_id || body.orderId || `KSH-${Date.now()}`;
        const rawAmount = Number(body.amount) || Number(body.summary?.total) || 100;
        const currency = (body.currency || 'EGP').toUpperCase();

        const customer = {
            name: (body.customer?.name || 'عميل زيرو ون').trim(),
            email: (body.customer?.email || 'zeronegroup0@gmail.com').trim(),
            phone: (body.customer?.phone || '+201000000000').trim(),
            governorate: (body.customer?.governorate || body.customer?.gov || 'القاهرة').trim(),
            city: (body.customer?.city || 'القاهرة').trim(),
            address: (body.customer?.address || 'شارع النيل').trim(),
            notes: (body.customer?.notes || '').trim()
        };

        const localBaseUrl = `http://${req.headers.host || 'localhost:8000'}`;
        const webhookDomain = process.env.WEBHOOK_PUBLIC_URL || process.env.BASE_URL || localBaseUrl;
        const successUrl = body.callbackUrl || body.success_url || `${localBaseUrl}/store.html?payment_status=success&order_id=${orderId}&gateway=kashier`;
        const cancelUrl = `${localBaseUrl}/store.html?payment_status=cancelled&order_id=${orderId}`;
        const webhookUrl = `${webhookDomain}/api/webhooks/kashier`;

        const merchantId = process.env.KASHIER_MERCHANT_ID || 'MID-12345-67890';
        const apiKey = process.env.KASHIER_API_KEY || 'API-KEY-12345-67890';
        const mode = process.env.KASHIER_MODE || 'test';
        const baseUrl = process.env.KASHIER_URL || 'https://checkout.kashier.io';

        // 1.1 Save Initial Order in DB
        const newOrder = {
            id: orderId,
            merchant_order_id: orderId,
            date: new Date().toISOString(),
            customer: customer,
            items: body.items || [],
            summary: body.summary || { subtotal: rawAmount, discount: 0, shipping: 0, total: rawAmount },
            paymentMethod: body.paymentMethod || 'kashier',
            paymentGateway: body.paymentMethod === 'cod' ? 'الدفع نقداً عند الاستلام' : 'Kashier Hosted Checkout',
            status: body.paymentMethod === 'cod' ? 'قيد التجهيز (دفع عند الاستلام)' : 'معلق (بانتظار الدفع عبر Kashier)',
            transaction: {
                amount: rawAmount,
                currency: currency,
                created_at: new Date().toISOString()
            }
        };
        db.orders = db.orders.filter(o => o.id !== orderId);
        db.orders.push(newOrder);
        writeDB(db);

        // 1.2 Determine if using Live/Official Kashier URL or Test Simulator
        const isPlaceholderMerchant = !merchantId || merchantId === 'MID-12345-67890' || merchantId.startsWith('MID-12345');
        
        let targetCheckoutUrl = '';
        let hash = '';

        if (isPlaceholderMerchant) {
            // Use dedicated interactive test simulator until live credentials are configured in .env
            targetCheckoutUrl = `${localBaseUrl}/kashier-simulator.html?merchantId=${merchantId}&orderId=${orderId}&amount=${rawAmount}&currency=${currency}&customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone)}&customerEmail=${encodeURIComponent(customer.email)}&redirectUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`;
        } else {
            // Generate official Kashier HMAC SHA256 Hash
            const pathStr = `/?payment=${merchantId}.${orderId}.${rawAmount}.${currency}`;
            hash = crypto.createHmac('sha256', apiKey).update(pathStr).digest('hex');
            targetCheckoutUrl = `${baseUrl}/?merchantId=${merchantId}&orderId=${orderId}&amount=${rawAmount}&currency=${currency}&hash=${hash}&mode=${mode}&redirectUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}&customerName=${encodeURIComponent(customer.name)}&customerEmail=${encodeURIComponent(customer.email)}&customerPhone=${encodeURIComponent(customer.phone)}`;
        }

        console.log(`\n=========================================================================`);
        console.log(`💳 [KASHIER CHECKOUT] ---> GENERATING SECURE CHECKOUT SESSION`);
        console.log(`• Merchant ID: ${merchantId} ${isPlaceholderMerchant ? '(Test Sandbox Simulator Mode)' : '(Production/Live Sandbox)'}`);
        console.log(`• Order ID: ${orderId}`);
        console.log(`• Amount: ${rawAmount} ${currency}`);
        console.log(`• Customer: ${customer.name} | ${customer.phone} | ${customer.governorate} - ${customer.city}`);
        console.log(`• Checkout URL:\n  ${targetCheckoutUrl}`);
        console.log(`=========================================================================\n`);

        return sendJSON(res, {
            success: true,
            orderId: orderId,
            merchant_order_id: orderId,
            amount: rawAmount,
            currency: currency,
            url: targetCheckoutUrl,
            kashier_url: targetCheckoutUrl,
            hash: hash
        }, 201);
    }

    /**
     * 2. KASHIER WEBHOOK LISTENER
     * POST /api/webhooks/kashier
     */
    if (pathname === '/api/webhooks/kashier' && method === 'POST') {
        const body = await parseBody(req);

        console.log(`\n=========================================================================`);
        console.log(`🔔 [KASHIER WEBHOOK] <--- RECEIVED INCOMING WEBHOOK EVENT`);
        console.log(`• Timestamp: ${new Date().toISOString()}`);
        console.log(`• Payload:\n`, JSON.stringify(body, null, 2));
        console.log(`=========================================================================\n`);

        const orderId = body.merchantOrderId || body.orderId || body.client_reference_id || (body.data && body.data.merchantOrderId);
        const transactionId = body.transactionId || (body.data && body.data.transactionId) || 'TXN-' + Date.now();
        const statusStr = (body.paymentStatus || body.status || (body.data && body.data.status) || '').toUpperCase();
        const isCompleted = statusStr === 'SUCCESS' || statusStr === 'PAID';

        const db = readDB();
        const order = db.orders.find(o => o.id === orderId || o.merchant_order_id === orderId);

        if (order) {
            if (isCompleted) {
                order.status = 'مكتمل (تم الدفع عبر Kashier)';
                order.paymentStatus = 'PAID';
                order.transaction = {
                    ...(order.transaction || {}),
                    transaction_id: transactionId,
                    gateway: 'Kashier',
                    paid_at: new Date().toISOString(),
                    status: 'SUCCESS',
                    maskedCard: (body.data && body.data.maskedCard) || body.maskedCard || '**** **** **** 4444'
                };
                console.log(`[Kashier Webhook] ✅ Order ${orderId} successfully marked as PAID in database!`);
            } else {
                order.status = 'فشل الدفع (Kashier Failed)';
                order.paymentStatus = 'FAILED';
            }
            writeDB(db);
        } else {
            console.warn(`[Kashier Webhook] Notice: Order ${orderId} not found in database.`);
        }

        return sendJSON(res, {
            success: true,
            message: 'Kashier Webhook processed successfully',
            orderId: orderId,
            status: isCompleted ? 'SUCCESS' : 'FAILED'
        }, 200);
    }

    // =========================================================================
    // REST API ROUTES
    // =========================================================================

    // 1. PRODUCTS
    if (pathname === '/api/products' && method === 'GET') {
        const db = readDB();
        return sendJSON(res, { success: true, data: db.products });
    }

    if (pathname === '/api/products' && method === 'POST') {
        const body = await parseBody(req);
        const db = readDB();
        
        const newProduct = {
            id: body.id || 'prod-' + Date.now(),
            name: body.name || 'منتج جديد',
            category: body.category || 'boxers',
            categoryName: body.categoryName || 'بوكسرات قطنية',
            price: Number(body.price) || 100,
            originalPrice: Number(body.originalPrice) || (Number(body.price) ? Number(body.price) + 50 : 150),
            rating: body.rating || 5.0,
            reviewsCount: body.reviewsCount || 1,
            badge: body.badge || '',
            badgeType: body.badgeType || 'featured',
            image: body.image || 'assets/images/product_boxer.jpg',
            gallery: body.gallery && body.gallery.length > 0 ? body.gallery : [body.image || 'assets/images/product_boxer.jpg'],
            colors: body.colors || [{ name: 'أسود كلاسيك', hex: '#111113', inStock: true }],
            sizes: body.sizes || ['M', 'L', 'XL', '2XL'],
            stock: Number(body.stock) || 100,
            fabric: body.fabric || '100% قطن مصري فاخر',
            details: body.details || ['جودة تصنيع فائقة ومعالجة ضد الانكماش'],
            careInstructions: body.careInstructions || 'غسيل آلي بدرجة حرارة معتدلة',
            b2b: body.b2b || {
                moq: 50,
                tiers: [{ min: 50, max: 500, price: Math.round(Number(body.price || 100) * 0.6), discount: '40%' }],
                productionTime: '7 - 10 أيام عمل',
                customizationOptions: ['تطريز شعار خاص', 'تغليف مخصص']
            }
        };

        db.products.push(newProduct);
        writeDB(db);
        return sendJSON(res, { success: true, data: newProduct }, 201);
    }

    if (pathname.startsWith('/api/products/') && method === 'PUT') {
        const id = pathname.replace('/api/products/', '');
        const body = await parseBody(req);
        const db = readDB();
        const index = db.products.findIndex(p => p.id === id);

        if (index === -1) {
            return sendJSON(res, { success: false, error: 'Product not found' }, 404);
        }

        db.products[index] = { ...db.products[index], ...body };
        writeDB(db);
        return sendJSON(res, { success: true, data: db.products[index] });
    }

    if (pathname.startsWith('/api/products/') && method === 'DELETE') {
        const id = pathname.replace('/api/products/', '');
        const db = readDB();
        const initialLen = db.products.length;
        db.products = db.products.filter(p => p.id !== id);

        if (db.products.length === initialLen) {
            return sendJSON(res, { success: false, error: 'Product not found' }, 404);
        }

        writeDB(db);
        return sendJSON(res, { success: true, message: 'Product deleted' });
    }

    // 2. ORDERS
    if (pathname === '/api/orders' && method === 'GET') {
        const db = readDB();
        return sendJSON(res, { success: true, data: db.orders });
    }

    if (pathname === '/api/orders' && method === 'POST') {
        const body = await parseBody(req);
        const db = readDB();

        const orderId = body.id || 'MESIRI-' + Math.floor(100000 + Math.random() * 900000);
        const newOrder = {
            id: orderId,
            date: body.date || new Date().toISOString(),
            customer: body.customer || { name: 'غير محدد', phone: '', city: '', address: '' },
            items: body.items || [],
            summary: body.summary || { subtotal: 0, discount: 0, shipping: 0, total: 0 },
            paymentMethod: body.paymentMethod || 'cashier',
            status: body.status || 'قيد التحضير'
        };

        db.orders.push(newOrder);
        writeDB(db);

        // Server-side Cloud Sync with Firebase
        syncOrderWithFirebaseServer(newOrder);

        return sendJSON(res, { success: true, data: newOrder }, 201);
    }

    if (pathname.startsWith('/api/orders/') && (method === 'PATCH' || method === 'PUT')) {
        const id = pathname.replace('/api/orders/', '').replace('/status', '');
        const body = await parseBody(req);
        const db = readDB();
        const order = db.orders.find(o => o.id === id);

        if (!order) {
            return sendJSON(res, { success: false, error: 'Order not found' }, 404);
        }

        if (body.status) order.status = body.status;
        if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
        writeDB(db);

        // Sync update with Firebase
        syncOrderWithFirebaseServer(order);

        return sendJSON(res, { success: true, data: order });
    }

    // 3. RFQS (B2B)
    if (pathname === '/api/rfqs' && method === 'GET') {
        const db = readDB();
        return sendJSON(res, { success: true, data: db.rfqs });
    }

    if (pathname === '/api/rfqs' && method === 'POST') {
        const body = await parseBody(req);
        const db = readDB();

        const rfqId = body.id || 'RFQ-' + Math.floor(1000 + Math.random() * 9000);
        const newRFQ = {
            id: rfqId,
            date: body.date || new Date().toISOString(),
            company: body.company || '',
            contactName: body.contactName || '',
            phone: body.phone || '',
            email: body.email || '',
            product: body.product || '',
            qty: body.qty || '',
            notes: body.notes || '',
            status: body.status || 'جديد'
        };

        db.rfqs.push(newRFQ);
        writeDB(db);
        return sendJSON(res, { success: true, data: newRFQ }, 201);
    }

    if (pathname.startsWith('/api/rfqs/') && pathname.endsWith('/status') && (method === 'PATCH' || method === 'PUT')) {
        const id = pathname.split('/')[3];
        const body = await parseBody(req);
        const db = readDB();
        const rfq = db.rfqs.find(r => r.id === id);

        if (!rfq) {
            return sendJSON(res, { success: false, error: 'RFQ not found' }, 404);
        }

        rfq.status = body.status;
        writeDB(db);
        return sendJSON(res, { success: true, data: rfq });
    }

    // 4. STATS & ANALYTICS
    if (pathname === '/api/stats' && method === 'GET') {
        const db = readDB();
        const totalOrders = db.orders.length;
        const totalRevenue = db.orders.reduce((sum, o) => sum + (o.summary?.total || 0), 0);
        const totalRFQs = db.rfqs.length;
        const totalProducts = db.products.length;

        return sendJSON(res, {
            success: true,
            data: {
                totalOrders,
                totalRevenue,
                totalRFQs,
                totalProducts
            }
        });
    }

    // 5. DIRECT DATABASE FILE DOWNLOADS (.sql and .db)
    if (pathname === '/api/download/sql' && method === 'GET') {
        const sqlPath = path.join(DATA_DIR, 'almesiri_database.sql');
        if (fs.existsSync(sqlPath)) {
            const fileStream = fs.readFileSync(sqlPath);
            res.writeHead(200, {
                'Content-Type': 'application/sql; charset=utf-8',
                'Content-Disposition': 'attachment; filename="almesiri_database.sql"',
                'Access-Control-Allow-Origin': '*'
            });
            return res.end(fileStream);
        }
    }

    if (pathname === '/api/download/db' && method === 'GET') {
        const dbPath = path.join(DATA_DIR, 'almesiri_database.db');
        if (fs.existsSync(dbPath)) {
            const fileStream = fs.readFileSync(dbPath);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename="almesiri_database.db"',
                'Access-Control-Allow-Origin': '*'
            });
            return res.end(fileStream);
        }
    }

    // =========================================================================
    // STATIC FILE SERVING
    // =========================================================================
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));

    // Security check: stay within workspace
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Access Denied');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            if (stats && stats.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - الصفحة غير موجودة</h1>');
                return;
            }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Server Error');
                return;
            }

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        });
    });
});

server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 مصنع زيرو ون (ZERO ONE) - السيرفر وقاعدة البيانات تعمل بنجاح!`);
    console.log(`🌐 الموقع: http://localhost:${PORT}`);
    console.log(`💳 إنشاء طلب XPay: POST http://localhost:${PORT}/api/payment/xpay/checkout`);
    console.log(`🔔 Webhook XPay: POST http://localhost:${PORT}/api/webhooks/xpay`);
    console.log(`⚙️ لوحة الإدارة: http://localhost:${PORT}/admin.html`);
    console.log(`=================================================`);
});
