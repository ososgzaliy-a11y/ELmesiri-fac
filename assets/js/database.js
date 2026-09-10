/**
 * =========================================================================
 * Al-Mesiri Core Database Layer (ملف قاعدة البيانات المركزي الموحد)
 * Responsible for all Inbound & Outbound Data (البيانات الصادرة والواردة)
 * Supports Real-Time Multi-Tab Synchronization & Server DB Sync
 * =========================================================================
 */

(function(window) {
    'use strict';

    // Broadcast channel for instantaneous cross-tab synchronization
    const DB_CHANNEL = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mesiri_database_bus') : null;

    // Default Seed Products (Men's Casual Wear)
    const DEFAULT_PRODUCTS = [
        {
            id: 'polo-classic-black',
            name: 'تيشيرت بولو كاجوال أسود فاخر (Polo Shirt)',
            category: 'tshirts',
            categoryName: 'تيشرتات وبولو',
            price: 390,
            originalPrice: 490,
            rating: 4.9,
            reviewsCount: 320,
            badge: 'الأكثر مبيعاً',
            badgeType: 'bestseller',
            badges: ['الأكثر مبيعاً', 'قطن 100%'],
            image: 'assets/images/product_polo_black.jpg',
            gallery: [
                'assets/images/product_polo_black.jpg',
                'assets/images/fabrics_rolls.jpg'
            ],
            colors: [
                { name: 'أسود كلاسيك', hex: '#111113', inStock: true },
                { name: 'أبيض ناصع', hex: '#ffffff', inStock: true },
                { name: 'كحلي داكن', hex: '#1c2841', inStock: true }
            ],
            sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
            stock: 350,
            fabric: '100% قطن بيكيه مصري ممتاز مسامي وعالي الجودة مريح للبشرة',
            details: [
                'ياقة بولو كلاسيكية مضلعة متماسكة تحافظ على شكلها الأنيق',
                'قصة Slim-Fit مريحة ملائمة للإطلالات اليومية وأوقات العمل الكاجوال',
                'أزرار صدفية متينة وخياطة مزدوجة ناعمة عند الأكتاف',
                'معالج ضد الانكماش والبهتان بعد تكرار الغسيل'
            ],
            careInstructions: 'غسيل آلي بماء بارد، الكي بحرارة معتدلة',
            b2b: {
                moq: 100,
                tiers: [
                    { min: 100, max: 499, price: 210, discount: '46%' },
                    { min: 500, max: 999, price: 180, discount: '53%' },
                    { min: 1000, max: 5000, price: 155, discount: '60%' }
                ],
                productionTime: '7 - 12 يوم عمل',
                customizationOptions: ['تطريز شعار البراند', 'ألوان مخصصة']
            }
        },
        {
            id: 'shirt-linen-white',
            name: 'قميص كاجوال كتان أبيض بأكمام طويلة (Linen Shirt)',
            category: 'shirts',
            categoryName: 'قمصان وتيشرتات بكم',
            price: 540,
            originalPrice: 680,
            rating: 4.8,
            reviewsCount: 245,
            badge: 'تصميم مميز',
            badgeType: 'featured',
            badges: ['تصميم مميز', 'كتان طبيعي'],
            image: 'assets/images/product_shirt_white.jpg',
            gallery: [
                'assets/images/product_shirt_white.jpg',
                'assets/images/fabrics_rolls.jpg'
            ],
            colors: [
                { name: 'أبيض عاجي', hex: '#ffffff', inStock: true },
                { name: 'سماوي كاجوال', hex: '#87ceeb', inStock: true },
                { name: 'رمادي فاتح', hex: '#d1d5db', inStock: true }
            ],
            sizes: ['M', 'L', 'XL', '2XL', '3XL'],
            stock: 280,
            fabric: 'مزيج الكتان الطبيعي الفاخر مع القطن المصري للتهوية والانسيابية',
            details: [
                'أكمام طويلة أنيقة مع إمكانية طيها بسهولة بستايل كاجوال عصري',
                'ياقة فرنسية كاجوال مريحة تناسب الإطلالات المفتوحة والمغلقة',
                'نسيج خفيف يمنحك الانتعاش طوال اليوم مع مقاومة التجعد'
            ],
            careInstructions: 'غسيل خفيف بالماء البارد، الكي بالبخار',
            b2b: {
                moq: 100,
                tiers: [
                    { min: 100, max: 499, price: 290, discount: '46%' },
                    { min: 500, max: 999, price: 250, discount: '53%' }
                ],
                productionTime: '10 - 15 يوم عمل',
                customizationOptions: ['طباعة أو تطريز العلامة التجارية']
            }
        },
        {
            id: 'chino-pants-beige',
            name: 'بنطلون كاجوال تشينو أنيق بيج (Slim Chino Pants)',
            category: 'pants',
            categoryName: 'بناطيل وجينز',
            price: 480,
            originalPrice: 620,
            rating: 4.9,
            reviewsCount: 390,
            badge: 'الأعلى تقييماً',
            badgeType: 'bestseller',
            badges: ['الأعلى تقييماً', 'مرونة عالية'],
            image: 'assets/images/product_trousers_beige.jpg',
            gallery: [
                'assets/images/product_trousers_beige.jpg',
                'assets/images/fabrics_rolls.jpg'
            ],
            colors: [
                { name: 'بيج رملي', hex: '#d2b48c', inStock: true },
                { name: 'أسود فحمي', hex: '#111113', inStock: true },
                { name: 'زيتي كاجوال', hex: '#4b5320', inStock: true }
            ],
            sizes: ['30', '32', '34', '36', '38', '40'],
            stock: 310,
            fabric: '98% قطن تويل جبردين مصري عالي المتانة + 2% إيلاستين لمرونة الحركة',
            details: [
                'قصة مريحة تمنحك حرية الحركة مع مظهر انسيابي متناسق ومتقن',
                'جيوب أمامية وخلفية عملية ومبطنة بأقمشة قطنية قوية',
                'ثبات كامل للألوان ضد الغسيل المتكرر دون أي انكماش'
            ],
            careInstructions: 'غسيل مقلوباً في الغسالة بماء بارد',
            b2b: {
                moq: 100,
                tiers: [
                    { min: 100, max: 499, price: 260, discount: '45%' },
                    { min: 500, max: 999, price: 225, discount: '53%' }
                ],
                productionTime: '10 - 15 يوم عمل',
                customizationOptions: ['علامة جلدية مخصصة على الخصر']
            }
        },
        {
            id: 'blazer-casual-grey',
            name: 'بليزر كاجوال عصري رمادي إيطالي (Casual Blazer)',
            category: 'shirts',
            categoryName: 'قمصان وتيشرتات بكم',
            price: 850,
            originalPrice: 1100,
            rating: 4.9,
            reviewsCount: 165,
            badge: 'قطعة فاخرة',
            badgeType: 'sale',
            badges: ['قطعة فاخرة', 'عرض محدود'],
            image: 'assets/images/product_blazer_grey.jpg',
            gallery: [
                'assets/images/product_blazer_grey.jpg',
                'assets/images/fabrics_rolls.jpg'
            ],
            colors: [
                { name: 'رمادي ميلانج', hex: '#8c92ac', inStock: true },
                { name: 'كحلي داكن', hex: '#1c2841', inStock: true }
            ],
            sizes: ['48', '50', '52', '54', '56'],
            stock: 110,
            fabric: 'مزيج صوف ناعم وقطن عالي الجودة مع بطانة مسامية خفيفة ومريحة',
            details: [
                'قصة كاجوال نصف مبطنة تمنحك إطلالة سمارت كاجوال عصرية وأنيقة',
                'يمكن ارتداؤه فوق التيشيرت أو القميص لإطلالة شبابية راقية',
                'جيوب رقعة خارجية وخياطة دقيقة وتشطيب إيطالي فاخر'
            ],
            careInstructions: 'تنظيف جاف فقط (Dry Clean)',
            b2b: {
                moq: 50,
                tiers: [
                    { min: 50, max: 199, price: 490, discount: '42%' },
                    { min: 200, max: 499, price: 420, discount: '50%' }
                ],
                productionTime: '12 - 18 يوم عمل',
                customizationOptions: ['أزرار مخصصة بشعارك']
            }
        }
    ];

    const DB = {
        subscribers: [],

        // Initialize Local Storage & Server DB
        init() {
            const stored = localStorage.getItem('mesiri_products');
            let needReset = !stored;
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.some(p => p.category === 'boxers' || p.category === 'briefs' || (p.id && p.id.includes('boxer')))) {
                        needReset = true;
                    }
                } catch(e) {
                    needReset = true;
                }
            }

            if (needReset) {
                localStorage.setItem('mesiri_products', JSON.stringify(DEFAULT_PRODUCTS));
                localStorage.setItem('mesiri_db_version', 'v2_casual_wear');
            }
            if (!localStorage.getItem('mesiri_orders')) {
                localStorage.setItem('mesiri_orders', JSON.stringify([]));
            }
            if (!localStorage.getItem('mesiri_rfqs')) {
                localStorage.setItem('mesiri_rfqs', JSON.stringify([]));
            }

            // Listen for cross-tab updates
            if (DB_CHANNEL) {
                DB_CHANNEL.onmessage = (event) => {
                    this.notifySubscribers(event.data);
                };
            }

            window.addEventListener('storage', (e) => {
                if (e.key && e.key.startsWith('mesiri_')) {
                    this.notifySubscribers({ type: 'STORAGE_CHANGE', key: e.key });
                }
            });

            // Initial fetch from Server API if available
            this.syncWithServer();
        },

        async syncWithServer() {
            try {
                const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const apiUrl = isLocalHost ? '/api' : 'http://localhost:8000/api';

                const [prodsRes, ordsRes, rfqsRes] = await Promise.all([
                    fetch(`${apiUrl}/products`).then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch(`${apiUrl}/orders`).then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch(`${apiUrl}/rfqs`).then(r => r.ok ? r.json() : null).catch(() => null)
                ]);

                if (prodsRes && prodsRes.success && prodsRes.data?.length > 0) {
                    localStorage.setItem('mesiri_products', JSON.stringify(prodsRes.data));
                }
                if (ordsRes && ordsRes.success && ordsRes.data) {
                    localStorage.setItem('mesiri_orders', JSON.stringify(ordsRes.data));
                }
                if (rfqsRes && rfqsRes.success && rfqsRes.data) {
                    localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqsRes.data));
                }
                this.notifySubscribers({ type: 'SERVER_SYNC_COMPLETE' });
            } catch (err) {
                // Ignore if offline
            }
        },

        subscribe(callback) {
            if (typeof callback === 'function') {
                this.subscribers.push(callback);
            }
        },

        notifySubscribers(payload) {
            this.subscribers.forEach(cb => {
                try { cb(payload); } catch(e) { console.error('Subscriber error:', e); }
            });
        },

        broadcast(actionType, data) {
            const payload = { actionType, data, timestamp: Date.now() };
            if (DB_CHANNEL) {
                DB_CHANNEL.postMessage(payload);
            }
            this.notifySubscribers(payload);
        },

        // -------------------------------------------------------------
        // 1. PRODUCTS API
        // -------------------------------------------------------------
        async getProducts() {
            try {
                const res = await fetch('/api/products').then(r => r.json());
                if (res && res.success && res.data) {
                    localStorage.setItem('mesiri_products', JSON.stringify(res.data));
                    return res.data;
                }
            } catch (e) {}

            try {
                const stored = localStorage.getItem('mesiri_products');
                if (stored) return JSON.parse(stored);
            } catch(e) {}
            return DEFAULT_PRODUCTS;
        },

        async saveProduct(product) {
            product.id = product.id || 'prod-' + Date.now();
            let products = await this.getProducts();
            const index = products.findIndex(p => p.id === product.id);
            if (index > -1) {
                products[index] = { ...products[index], ...product };
            } else {
                products.push(product);
            }
            localStorage.setItem('mesiri_products', JSON.stringify(products));

            // Sync to server
            try {
                await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });
            } catch(e) {}

            this.broadcast('PRODUCT_SAVED', product);
            return product;
        },

        async deleteProduct(productId) {
            let products = await this.getProducts();
            products = products.filter(p => p.id !== productId);
            localStorage.setItem('mesiri_products', JSON.stringify(products));

            try {
                await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            } catch(e) {}

            this.broadcast('PRODUCT_DELETED', { id: productId });
            return true;
        },

        // -------------------------------------------------------------
        // 2. ORDERS API (إدارة الطلبات الواردة)
        // -------------------------------------------------------------
        async getOrders() {
            try {
                const res = await fetch('/api/orders').then(r => r.json());
                if (res && res.success && res.data) {
                    localStorage.setItem('mesiri_orders', JSON.stringify(res.data));
                    return res.data;
                }
            } catch (e) {}

            try {
                const stored = localStorage.getItem('mesiri_orders');
                if (stored) return JSON.parse(stored);
            } catch(e) {}
            return [];
        },

        async createOrder(orderData) {
            const order = {
                id: orderData.id || 'MESIRI-' + Math.floor(100000 + Math.random() * 900000),
                date: orderData.date || new Date().toISOString(),
                customer: orderData.customer || { name: 'غير محدد', phone: '', city: '', address: '' },
                items: orderData.items || [],
                summary: orderData.summary || { subtotal: 0, discount: 0, shipping: 0, total: 0 },
                paymentMethod: orderData.paymentMethod || 'paymob',
                status: orderData.status || 'قيد التحضير'
            };

            let orders = await this.getOrders();
            orders.push(order);
            localStorage.setItem('mesiri_orders', JSON.stringify(orders));

            // Sync with backend API
            try {
                await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });
            } catch(e) {
                console.warn('[DB] Backend offline, order saved to local database storage');
            }

            this.broadcast('NEW_ORDER', order);
            return order;
        },

        async updateOrderStatus(orderId, newStatus) {
            let orders = await this.getOrders();
            const ord = orders.find(o => o.id === orderId);
            if (ord) {
                ord.status = newStatus;
                localStorage.setItem('mesiri_orders', JSON.stringify(orders));
            }

            try {
                await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
            } catch(e) {}

            this.broadcast('ORDER_STATUS_UPDATED', { id: orderId, status: newStatus });
            return ord;
        },

        // -------------------------------------------------------------
        // 3. RFQS API (طلبات الجملة B2B)
        // -------------------------------------------------------------
        async getRFQs() {
            try {
                const res = await fetch('/api/rfqs').then(r => r.json());
                if (res && res.success && res.data) {
                    localStorage.setItem('mesiri_rfqs', JSON.stringify(res.data));
                    return res.data;
                }
            } catch (e) {}

            try {
                const stored = localStorage.getItem('mesiri_rfqs');
                if (stored) return JSON.parse(stored);
            } catch(e) {}
            return [];
        },

        async createRFQ(rfqData) {
            const rfq = {
                id: rfqData.id || 'RFQ-' + Math.floor(1000 + Math.random() * 9000),
                date: rfqData.date || new Date().toISOString(),
                company: rfqData.company || '',
                contactName: rfqData.contactName || '',
                phone: rfqData.phone || '',
                email: rfqData.email || '',
                product: rfqData.product || '',
                qty: rfqData.qty || '',
                notes: rfqData.notes || '',
                status: rfqData.status || 'جديد'
            };

            let rfqs = await this.getRFQs();
            rfqs.push(rfq);
            localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqs));

            try {
                await fetch('/api/rfqs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rfq)
                });
            } catch(e) {}

            this.broadcast('NEW_RFQ', rfq);
            return rfq;
        },

        async updateRFQStatus(rfqId, newStatus) {
            let rfqs = await this.getRFQs();
            const rfq = rfqs.find(r => r.id === rfqId);
            if (rfq) {
                rfq.status = newStatus;
                localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqs));
            }

            try {
                await fetch(`/api/rfqs/${rfqId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
            } catch(e) {}

            this.broadcast('RFQ_STATUS_UPDATED', { id: rfqId, status: newStatus });
            return rfq;
        }
    };

    // Auto initialize DB layer immediately
    DB.init();

    // Export globally
    window.DB = DB;
    window.API = DB; // Backwards compatible alias
})(window);
