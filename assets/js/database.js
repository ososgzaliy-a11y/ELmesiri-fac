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

    // Default Seed Products
    const DEFAULT_PRODUCTS = [
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
            fabric: '95% قطن مصري ممشط + 5% إيلاستين لمرونة استثنائية',
            details: [
                'حزام خصر مرن ومريح لا يترك علامات على الجلد',
                'تصميم داعم ومانع للاحتكاك للاستخدام اليومي',
                'معالج ضد الانكماش والبهتان'
            ],
            careInstructions: 'غسيل آلي بدرجة حرارة 40° مئوية كحد أقصى',
            b2b: {
                moq: 100,
                tiers: [
                    { min: 100, max: 499, price: 145, discount: '42%' },
                    { min: 500, max: 999, price: 125, discount: '50%' },
                    { min: 1000, max: 5000, price: 110, discount: '56%' }
                ],
                productionTime: '7 - 14 يوم عمل',
                customizationOptions: ['تطريز شعار الماركة على الكمر', 'ألوان مخصصة']
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
                'ياقة V-Neck مثالية للارتداء أسفل القمصان المفتوحة',
                'قصة (Slim Fit) مريحة تأخذ شكل الجسم'
            ],
            careInstructions: 'غسيل بالماء الدافئ، يمكن كيّه بدرجة حرارة متوسطة',
            b2b: {
                moq: 200,
                tiers: [
                    { min: 200, max: 999, price: 95, discount: '47%' },
                    { min: 1000, max: 2999, price: 80, discount: '55%' }
                ],
                productionTime: '10 - 15 يوم عمل',
                customizationOptions: ['تعديل شكل الياقة', 'طباعة الشعار حرارياً']
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
                'أستك داخلي مغطى بالقماش'
            ],
            careInstructions: 'غسيل عادي مع ألوان مماثلة',
            b2b: {
                moq: 300,
                tiers: [
                    { min: 300, max: 999, price: 65, discount: '45%' },
                    { min: 1000, max: 4999, price: 55, discount: '54%' }
                ],
                productionTime: '7 - 12 يوم عمل',
                customizationOptions: ['تغليف علب متعددة']
            }
        }
    ];

    const DB = {
        subscribers: [],

        // Initialize Local Storage & Server DB
        init() {
            if (!localStorage.getItem('mesiri_products')) {
                localStorage.setItem('mesiri_products', JSON.stringify(DEFAULT_PRODUCTS));
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
