/**
 * Al-Mesiri Unified Data & API Client
 * Connects frontend seamlessly with the Backend Database REST API
 */

const API = {
    baseUrl: '', // Same host (e.g. http://localhost:8000)

    // Helper fetch with timeout & fallback
    async request(endpoint, options = {}) {
        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                },
                ...options
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch (err) {
            console.warn(`[API] Call to ${endpoint} failed or offline, checking fallback:`, err.message);
            throw err;
        }
    },

    // PRODUCTS
    async getProducts() {
        try {
            const res = await this.request('/api/products');
            if (res && res.success) {
                // Sync to localStorage
                localStorage.setItem('mesiri_products', JSON.stringify(res.data));
                return res.data;
            }
        } catch (e) {
            // Fallback to localStorage or default
            const local = localStorage.getItem('mesiri_products');
            if (local) return JSON.parse(local);
            if (typeof PRODUCTS_DATA !== 'undefined') return PRODUCTS_DATA;
        }
        return [];
    },

    async createProduct(productData) {
        try {
            const res = await this.request('/api/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            if (res && res.success) {
                await this.getProducts(); // refresh local cache
                return res.data;
            }
        } catch (e) {
            // Fallback local append
            let prods = JSON.parse(localStorage.getItem('mesiri_products')) || [];
            productData.id = productData.id || 'prod-' + Date.now();
            prods.push(productData);
            localStorage.setItem('mesiri_products', JSON.stringify(prods));
            return productData;
        }
    },

    async updateProduct(id, updates) {
        try {
            const res = await this.request(`/api/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            if (res && res.success) {
                await this.getProducts();
                return res.data;
            }
        } catch (e) {
            let prods = JSON.parse(localStorage.getItem('mesiri_products')) || [];
            const idx = prods.findIndex(p => p.id === id);
            if (idx > -1) {
                prods[idx] = { ...prods[idx], ...updates };
                localStorage.setItem('mesiri_products', JSON.stringify(prods));
                return prods[idx];
            }
        }
    },

    async deleteProduct(id) {
        try {
            const res = await this.request(`/api/products/${id}`, {
                method: 'DELETE'
            });
            if (res && res.success) {
                await this.getProducts();
                return true;
            }
        } catch (e) {
            let prods = JSON.parse(localStorage.getItem('mesiri_products')) || [];
            prods = prods.filter(p => p.id !== id);
            localStorage.setItem('mesiri_products', JSON.stringify(prods));
            return true;
        }
    },

    // ORDERS
    async getOrders() {
        try {
            const res = await this.request('/api/orders');
            if (res && res.success) {
                localStorage.setItem('mesiri_orders', JSON.stringify(res.data));
                return res.data;
            }
        } catch (e) {
            return JSON.parse(localStorage.getItem('mesiri_orders')) || [];
        }
        return [];
    },

    async createOrder(orderData) {
        try {
            const res = await this.request('/api/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            if (res && res.success) {
                // Sync to local
                const orders = JSON.parse(localStorage.getItem('mesiri_orders')) || [];
                orders.push(res.data);
                localStorage.setItem('mesiri_orders', JSON.stringify(orders));
                return res.data;
            }
        } catch (e) {
            const orders = JSON.parse(localStorage.getItem('mesiri_orders')) || [];
            orders.push(orderData);
            localStorage.setItem('mesiri_orders', JSON.stringify(orders));
            return orderData;
        }
    },

    async updateOrderStatus(id, newStatus) {
        try {
            const res = await this.request(`/api/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            if (res && res.success) {
                return res.data;
            }
        } catch (e) {
            let orders = JSON.parse(localStorage.getItem('mesiri_orders')) || [];
            const ord = orders.find(o => o.id === id);
            if (ord) {
                ord.status = newStatus;
                localStorage.setItem('mesiri_orders', JSON.stringify(orders));
                return ord;
            }
        }
    },

    // RFQS
    async getRFQs() {
        try {
            const res = await this.request('/api/rfqs');
            if (res && res.success) {
                localStorage.setItem('mesiri_rfqs', JSON.stringify(res.data));
                return res.data;
            }
        } catch (e) {
            return JSON.parse(localStorage.getItem('mesiri_rfqs')) || [];
        }
        return [];
    },

    async createRFQ(rfqData) {
        try {
            const res = await this.request('/api/rfqs', {
                method: 'POST',
                body: JSON.stringify(rfqData)
            });
            if (res && res.success) {
                const rfqs = JSON.parse(localStorage.getItem('mesiri_rfqs')) || [];
                rfqs.push(res.data);
                localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqs));
                return res.data;
            }
        } catch (e) {
            const rfqs = JSON.parse(localStorage.getItem('mesiri_rfqs')) || [];
            rfqs.push(rfqData);
            localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqs));
            return rfqData;
        }
    },

    async updateRFQStatus(id, newStatus) {
        try {
            const res = await this.request(`/api/rfqs/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            if (res && res.success) {
                return res.data;
            }
        } catch (e) {
            let rfqs = JSON.parse(localStorage.getItem('mesiri_rfqs')) || [];
            const rfq = rfqs.find(r => r.id === id);
            if (rfq) {
                rfq.status = newStatus;
                localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqs));
                return rfq;
            }
        }
    }
};

window.API = API;
