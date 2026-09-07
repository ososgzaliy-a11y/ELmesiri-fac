/**
 * =========================================================================
 * Al-Mesiri E-Commerce - Luxury Admin Dashboard & Cloud Database System
 * Fully Integrated with Live Server, JSON Database, and Google Firebase Cloud
 * =========================================================================
 */

let adminData = {
    products: [],
    orders: [],
    rfqs: []
};

let currentTab = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    initAdminPanel();
});

async function initAdminPanel() {
    await loadData();
    setupNavigation();
    renderTab(currentTab);
    
    // Subscribe to instantaneous Database events across all open tabs
    if (typeof DB !== 'undefined' && DB.subscribe) {
        DB.subscribe(async (event) => {
            console.log('[Admin] Received live database event:', event);
            await loadData(false);
            renderTab(currentTab, false);
        });
    }

    // Setup Sidebar Toggle for mobile
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('admin-sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Auto-poll for new orders every 3 seconds
    setInterval(async () => {
        await loadData(false);
        renderTab(currentTab, false);
    }, 3000);
}

async function loadData(showToastNotice = false) {
    try {
        const [ordersRes, prodsRes, rfqsRes] = await Promise.all([
            fetch('/api/orders?t=' + Date.now()).then(r => r.json()).catch(() => null),
            fetch('/api/products?t=' + Date.now()).then(r => r.json()).catch(() => null),
            fetch('/api/rfqs?t=' + Date.now()).then(r => r.json()).catch(() => null)
        ]);

        if (ordersRes && ordersRes.success && Array.isArray(ordersRes.data)) {
            adminData.orders = ordersRes.data;
            localStorage.setItem('mesiri_orders', JSON.stringify(ordersRes.data));
        } else {
            adminData.orders = JSON.parse(localStorage.getItem('mesiri_orders')) || [];
        }

        if (prodsRes && prodsRes.success && Array.isArray(prodsRes.data)) {
            adminData.products = prodsRes.data;
            localStorage.setItem('mesiri_products', JSON.stringify(prodsRes.data));
        } else {
            adminData.products = JSON.parse(localStorage.getItem('mesiri_products')) || [];
        }

        if (rfqsRes && rfqsRes.success && Array.isArray(rfqsRes.data)) {
            adminData.rfqs = rfqsRes.data;
            localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqsRes.data));
        } else {
            adminData.rfqs = JSON.parse(localStorage.getItem('mesiri_rfqs')) || [];
        }

        if (showToastNotice && typeof showToast === 'function') {
            showToast('تم تحديث البيانات من قاعدة البيانات بنجاح', 'success');
        }
    } catch(e) {
        console.error("Error loading data from API / Database", e);
        adminData.orders = JSON.parse(localStorage.getItem('mesiri_orders')) || [];
    }
}

async function refreshAdminData(manual = true) {
    await loadData(manual);
    renderTab(currentTab);
    if (manual) {
        alert('تم تحديث البيانات مع قاعدة البيانات بنجاح!');
    }
}

function setupNavigation() {
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            currentTab = e.currentTarget.getAttribute('data-tab') || 'dashboard';
            
            const titleEl = document.getElementById('topbar-title');
            if (titleEl) {
                titleEl.innerText = e.currentTarget.innerText.trim();
            }
            
            renderTab(currentTab);
            
            const sidebar = document.getElementById('admin-sidebar');
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });
}

function renderTab(tab, shouldScroll = true) {
    const container = document.getElementById('admin-content-area');
    if (!container) return;
    
    switch(tab) {
        case 'dashboard':
            container.innerHTML = renderDashboard();
            break;
        case 'orders':
            container.innerHTML = renderOrders();
            break;
        case 'rfqs':
            container.innerHTML = renderRFQs();
            break;
        case 'products':
            container.innerHTML = renderProducts();
            break;
        case 'customers':
            container.innerHTML = renderCustomers();
            break;
        case 'db-viewer':
            container.innerHTML = renderDatabaseViewer();
            break;
        case 'finance':
            container.innerHTML = renderFinance();
            break;
        default:
            container.innerHTML = renderDashboard();
    }
}

// ----------------------------------------------------
// Tab Renderers
// ----------------------------------------------------

function renderDashboard() {
    const totalOrders = adminData.orders.length;
    const totalRevenue = adminData.orders.reduce((sum, order) => sum + (order.summary?.total || 0), 0);
    const totalRFQs = adminData.rfqs.length;
    const recentOrders = [...adminData.orders].slice(-10).reverse();
    
    return `
        <div class="dashboard-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div class="stat-widget" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 16px;">
                <div class="stat-icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(197, 168, 128, 0.15); color: var(--accent-gold); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fa-solid fa-money-bill-wave"></i></div>
                <div class="stat-info">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">إجمالي المبيعات (B2C)</p>
                    <h3 style="font-size: 1.4rem; font-weight: 900; color: var(--accent-gold); font-family: var(--font-latin);">${totalRevenue.toLocaleString()} ج.م</h3>
                </div>
            </div>
            <div class="stat-widget" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 16px;">
                <div class="stat-icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fa-solid fa-cart-shopping"></i></div>
                <div class="stat-info">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">طلبات الأفراد (B2C)</p>
                    <h3 style="font-size: 1.4rem; font-weight: 900; color: #f8fafc;">${totalOrders} طلب</h3>
                </div>
            </div>
            <div class="stat-widget" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 16px;">
                <div class="stat-icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fa-solid fa-handshake"></i></div>
                <div class="stat-info">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">عقود الجملة (B2B)</p>
                    <h3 style="font-size: 1.4rem; font-weight: 900; color: #f8fafc;">${totalRFQs} طلب</h3>
                </div>
            </div>
            <div class="stat-widget" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 16px;">
                <div class="stat-icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fa-solid fa-box-open"></i></div>
                <div class="stat-info">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">المنتجات بالمخزون</p>
                    <h3 style="font-size: 1.4rem; font-weight: 900; color: #f8fafc;">${adminData.products.length} منتج</h3>
                </div>
            </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary);">
                <i class="fa-solid fa-clock-rotate-left" style="color: var(--accent-gold); margin-left: 8px;"></i> أحدث الطلبات المستلمة (B2C)
            </h3>
            <div style="display: flex; gap: 8px;">
                <button class="btn-small" onclick="exportOrdersToExcel()" style="background: #15803d; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer;">
                    <i class="fa-solid fa-file-excel"></i> تصدير Excel
                </button>
            </div>
        </div>
        ${renderOrdersTable(recentOrders)}
    `;
}

function renderOrders() {
    const allOrders = [...adminData.orders].reverse();
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
                <h3 style="font-size: 1.3rem; font-weight: 800;">سجل طلبات الأفراد الكامل (B2C)</h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">إجمالي الطلبات المسجلة: <strong>${adminData.orders.length} طلب</strong></p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn-small" onclick="exportOrdersToExcel()" style="background: #15803d; color: white; border: none; padding: 7px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-file-excel"></i> تصدير Excel (.xls)
                </button>
                <button class="btn-small" onclick="exportOrdersToGoogleSheetsCSV()" style="background: #0284c7; color: white; border: none; padding: 7px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-table"></i> Google Sheets
                </button>
                <button class="btn-small btn-edit" onclick="refreshAdminData(true)">
                    <i class="fa-solid fa-arrows-rotate"></i> تحديث
                </button>
            </div>
        </div>
        ${renderOrdersTable(allOrders)}
    `;
}

function renderOrdersTable(ordersList) {
    if (!ordersList || ordersList.length === 0) {
        return `
            <div class="admin-table-container" style="padding: 50px 20px; text-align: center; color: var(--text-secondary); background: var(--bg-surface-elevated); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                <i class="fa-solid fa-cart-arrow-down" style="font-size: 3rem; margin-bottom: 14px; color: var(--accent-gold);"></i>
                <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">لا توجد طلبات مسجلة حتى الآن</h4>
                <p style="font-size: 0.9rem;">عند إتمام أي عملية شراء من المتجر، ستظهر بيانات الطلب هنا فوراً ومباشرة.</p>
            </div>
        `;
    }
    
    let html = `
    <div class="admin-table-container" style="overflow-x: auto; background: var(--bg-surface-elevated); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: right;">
            <thead>
                <tr style="background: rgba(15, 23, 42, 0.7); border-bottom: 1px solid var(--border-subtle);">
                    <th style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold);">رقم الطلب</th>
                    <th class="hide-on-mobile" style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold);">التاريخ</th>
                    <th class="hide-on-mobile" style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold);">العميل والتواصل</th>
                    <th class="hide-on-mobile" style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold);">المحافظة والعنوان</th>
                    <th class="hide-on-mobile" style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold);">وسيلة السداد</th>
                    <th class="hide-on-mobile" style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold);">الإجمالي</th>
                    <th style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold); text-align: center;">الحالة</th>
                    <th style="padding: 14px 16px; font-size: 0.88rem; color: var(--accent-gold); text-align: center;">إجراء</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    ordersList.forEach((order) => {
        const date = new Date(order.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        let paymentBadge = '';
        if (order.paymentMethod === 'cod') {
            paymentBadge = `<span style="font-size: 0.78rem; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 8px; border-radius: 6px; display: inline-block;">
                <i class="fa-solid fa-hand-holding-dollar"></i> دفع عند الاستلام
            </span>`;
        } else {
            const txn = order.transaction?.transaction_id || '';
            paymentBadge = `<span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 6px; display: inline-block;">
                <i class="fa-solid fa-credit-card"></i> Kashier إلكتروني
            </span>${txn ? `<br><small style="color:var(--text-muted); font-size:0.72rem; font-family:monospace;">${txn}</small>` : ''}`;
        }
        
        const gov = order.customer?.governorate || order.customer?.gov || '';
        const city = order.customer?.city || '';
        const locationText = gov ? `${gov} - ${city}` : (city || '-');
        const isPaid = order.paymentStatus === 'PAID' || (order.status && order.status.includes('تم الدفع'));

        html += `
            <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 12px 16px;"><strong style="color: var(--accent-gold); font-family: monospace; font-size: 0.95rem;">#${order.id}</strong></td>
                <td class="hide-on-mobile" style="padding: 12px 16px; font-size: 0.85rem; color: var(--text-secondary);">${date}</td>
                <td class="hide-on-mobile" style="padding: 12px 16px;">
                    <strong style="color: var(--text-primary);">${order.customer?.name || 'عميل'}</strong>
                    <br><a href="tel:${order.customer?.phone || ''}" style="font-size:0.82rem; color:#38bdf8; text-decoration:none;" dir="ltr"><i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${order.customer?.phone || ''}</a>
                </td>
                <td class="hide-on-mobile" style="padding: 12px 16px; font-size: 0.85rem;">
                    <strong>${locationText}</strong>
                    <br><span style="color:var(--text-secondary); font-size:0.78rem;">${order.customer?.address || ''}</span>
                </td>
                <td class="hide-on-mobile" style="padding: 12px 16px;">${paymentBadge}</td>
                <td class="hide-on-mobile" style="padding: 12px 16px; font-weight: 900; color: var(--accent-gold); font-family: var(--font-latin); font-size:1.05rem;">${(order.summary?.total || 0).toLocaleString()} ج.م</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <select class="status-select" style="background:var(--bg-main); color:${isPaid ? '#10b981' : 'var(--text-primary)'}; border:1px solid var(--border-subtle); padding:6px 8px; border-radius:8px; font-weight:700; font-size: 0.8rem; max-width: 110px; text-overflow: ellipsis;" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="مكتمل (تم الدفع عبر Kashier)" ${order.status === 'مكتمل (تم الدفع عبر Kashier)' || order.status === 'مكتمل' ? 'selected' : ''}>✅ تم الدفع والتأكيد</option>
                        <option value="قيد التحضير" ${order.status === 'قيد التحضير' || order.status === 'قيد التجهيز (دفع عند الاستلام)' ? 'selected' : ''}>⏳ قيد التحضير</option>
                        <option value="جاري التوصيل" ${order.status === 'جاري التوصيل' ? 'selected' : ''}>🚚 جاري التوصيل</option>
                        <option value="معلق (بانتظار الدفع)" ${order.status && order.status.includes('بانتظار') ? 'selected' : ''}>⚠️ معلق بانتظار الدفع</option>
                        <option value="مرتجع" ${order.status === 'مرتجع' ? 'selected' : ''}>❌ ملغي / مرتجع</option>
                    </select>
                </td>
                <td style="padding: 12px 8px; text-align: center;">
                    <button class="btn-small btn-view-mobile-full" onclick="openOrderDetailsModal('${order.id}')" style="background: var(--bg-main); border: 1px solid var(--border-gold); color: var(--accent-gold); padding: 5px 8px; border-radius: 6px; cursor:pointer; font-weight: bold; white-space: nowrap;">
                        <i class="fa-solid fa-eye"></i> التفاصيل
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    return html;
}

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
    } catch(e) {}

    const order = adminData.orders.find(o => o.id === orderId);
    if (order) order.status = newStatus;
    localStorage.setItem('mesiri_orders', JSON.stringify(adminData.orders));
    
    await loadData();
    renderTab(currentTab);
};

window.openOrderDetailsModal = function(orderId) {
    const order = adminData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const body = document.getElementById('order-details-body');
    if (!body) return;
    
    const date = new Date(order.date).toLocaleString('ar-EG');
    const itemsHtml = (order.items || []).map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-subtle);">
            <div>
                <strong>${item.name || item.title || 'منتج'}</strong>
                <div style="font-size:0.82rem; color:var(--text-secondary);">
                    اللون: ${item.color || '-'} | المقاس: ${item.size || '-'} | الكمية: ${item.qty || item.quantity || 1}
                </div>
            </div>
            <div style="font-weight:bold; color:var(--accent-gold);">
                ${((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString()} ج.م
            </div>
        </div>
    `).join('');
    
    body.innerHTML = `
        <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                <span>رقم الطلب: <strong style="color:var(--accent-gold);">#${order.id}</strong></span>
                <span>التاريخ: <strong>${date}</strong></span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>حالة الطلب: <strong style="color: #10b981;">${order.status}</strong></span>
                <span>طريقة الدفع: <strong>${order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}</strong></span>
            </div>
        </div>

        <h4 style="margin-bottom: 12px; font-size: 1rem; color: var(--accent-gold);"><i class="fa-solid fa-user" style="margin-left: 6px;"></i>بيانات العميل والتوصيل</h4>
        <div style="background: var(--bg-surface-card); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 20px; font-size: 0.9rem; line-height: 1.8;">
            <div>👤 <strong>الاسم:</strong> ${order.customer?.name || 'غير محدد'}</div>
            <div>📱 <strong>الهاتف:</strong> <a href="tel:${order.customer?.phone || ''}" style="color:#38bdf8; text-decoration:none;" dir="ltr">${order.customer?.phone || 'غير محدد'}</a></div>
            <div>✉️ <strong>البريد:</strong> ${order.customer?.email || '-'}</div>
            <div>🏛️ <strong>المحافظة:</strong> ${order.customer?.governorate || order.customer?.gov || '-'}</div>
            <div>🏙️ <strong>المدينة / المركز:</strong> ${order.customer?.city || 'غير محدد'}</div>
            <div>🏠 <strong>العنوان التفصيلي:</strong> ${order.customer?.address || 'غير محدد'}</div>
            ${order.customer?.notes ? `<div>📝 <strong>ملاحظات:</strong> ${order.customer.notes}</div>` : ''}
            ${order.transaction?.transaction_id ? `<div>💳 <strong>رقم المعاملة (Kashier TXN):</strong> <span style="font-family:monospace; color:#10b981;">${order.transaction.transaction_id}</span></div>` : ''}
        </div>

        <h4 style="margin-bottom: 12px; font-size: 1rem; color: var(--accent-gold);"><i class="fa-solid fa-box" style="margin-left: 6px;"></i>المنتجات المطلوبة</h4>
        <div style="background: var(--bg-surface-card); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 20px;">
            ${itemsHtml || '<p>لا توجد تفاصيل عناصر.</p>'}
        </div>

        <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); font-size: 0.95rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>المجموع الفرعي:</span>
                <span>${(order.summary?.subtotal || 0).toLocaleString()} ج.م</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:var(--text-secondary);">
                <span>الشحن:</span>
                <span>${(order.summary?.shipping || 0) === 0 ? 'مجاني' : (order.summary?.shipping || 0) + ' ج.م'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:bold; color:var(--accent-gold); border-top:1px solid var(--border-subtle); padding-top:8px;">
                <span>الإجمالي النهائي:</span>
                <span>${(order.summary?.total || 0).toLocaleString()} ج.م</span>
            </div>
        </div>
    `;

    const modal = document.getElementById('order-details-modal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
};

window.closeOrderDetailsModal = function() {
    const modal = document.getElementById('order-details-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

// ----------------------------------------------------
// RFQs Tab (B2B)
// ----------------------------------------------------
function renderRFQs() {
    const rfqs = [...adminData.rfqs].reverse();
    if (!rfqs || rfqs.length === 0) {
        return `
            <div class="admin-table-container" style="padding: 50px 20px; text-align: center; color: var(--text-secondary); background: var(--bg-surface-elevated); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                <i class="fa-solid fa-handshake" style="font-size: 3rem; margin-bottom: 14px; color: var(--accent-gold);"></i>
                <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">لا توجد طلبات عروض أسعار جملة (B2B)</h4>
                <p style="font-size: 0.9rem;">عند إرسال التجار والمصانع طلبات تسعير، ستظهر هنا مباشرة.</p>
            </div>
        `;
    }

    let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <h3>طلبات عروض أسعار الجملة والتوريدات (B2B)</h3>
        <span>إجمالي الطلبات: ${rfqs.length}</span>
    </div>
    <div class="admin-table-container" style="overflow-x:auto; background:var(--bg-surface-elevated); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right;">
            <thead>
                <tr style="background:rgba(15,23,42,0.7); border-bottom:1px solid var(--border-subtle);">
                    <th style="padding:14px; color:var(--accent-gold);">رقم الطلب</th>
                    <th style="padding:14px; color:var(--accent-gold);">اسم التاجر / الشركة</th>
                    <th class="hide-on-mobile" style="padding:14px; color:var(--accent-gold);">الهاتف</th>
                    <th class="hide-on-mobile" style="padding:14px; color:var(--accent-gold);">المنتج والكمية</th>
                    <th style="padding:14px; color:var(--accent-gold);">الحالة</th>
                </tr>
            </thead>
            <tbody>
    `;

    rfqs.forEach(rfq => {
        html += `
            <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:12px 14px;"><strong style="color:var(--accent-gold);">#${rfq.id || 'RFQ-001'}</strong></td>
                <td style="padding:12px 14px;"><strong>${rfq.company || rfq.name || 'شركة'}</strong></td>
                <td class="hide-on-mobile" style="padding:12px 14px;" dir="ltr"><a href="tel:${rfq.phone || ''}" style="color:#38bdf8; text-decoration:none;">${rfq.phone || ''}</a></td>
                <td class="hide-on-mobile" style="padding:12px 14px;">${rfq.productName || 'منتج جملة'} (${rfq.quantity || rfq.qty || 100} قطعة)</td>
                <td style="padding:12px 14px;"><span style="background:rgba(16,185,129,0.15); color:#10b981; padding:4px 8px; border-radius:6px; font-size:0.8rem;">جديد</span></td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    return html;
}

// ----------------------------------------------------
// Products Tab
// ----------------------------------------------------
function renderProducts() {
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <div>
                <h3 style="font-size: 1.3rem; font-weight: 800;">إدارة المنتجات والمخزون</h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">إجمالي المنتجات: ${adminData.products.length} منتج</p>
            </div>
            <button class="btn-luxury-gold" onclick="openAddModal()" style="padding: 8px 16px;">
                <i class="fa-solid fa-plus-circle"></i> إضافة منتج جديد
            </button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px;">
            ${adminData.products.map(p => {
                const badges = (Array.isArray(p.badges) && p.badges.length > 0) ? p.badges : (p.badge ? [p.badge] : []);
                const galleryCount = (Array.isArray(p.gallery) && p.gallery.length) || (p.image ? 1 : 0);
                return `
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 16px; display: flex; gap: 14px; position: relative;">
                    <div style="position: relative; width: 85px; height: 85px; flex-shrink: 0;">
                        <img src="${p.image || 'assets/images/product_boxer.jpg'}" alt="${p.name}" style="width: 100%; height: 100%; border-radius: 10px; object-fit: cover; border: 1px solid var(--border-subtle);">
                        <span style="position: absolute; bottom: 3px; right: 3px; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.65rem; padding: 1px 5px; border-radius: 4px; font-weight: 700;">
                            <i class="fa-solid fa-images"></i> ${galleryCount}
                        </span>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.name}">${p.name}</h4>
                        <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
                            <span style="font-size: 1.15rem; font-weight: 900; color: var(--accent-gold);">${p.price} ج.م</span>
                            ${p.originalPrice ? `<span style="font-size: 0.82rem; color: var(--text-muted); text-decoration: line-through;">${p.originalPrice} ج.م</span>` : ''}
                        </div>
                        
                        <!-- Badges preview -->
                        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                            ${badges.length > 0 
                                ? badges.map(b => `<span style="background: rgba(201, 169, 102, 0.15); color: var(--accent-gold); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(201, 169, 102, 0.3);">${b}</span>`).join('')
                                : `<span style="color: var(--text-muted); font-size: 0.72rem;">بدون شارة</span>`
                            }
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <button class="btn-small" onclick="openEditModal('${p.id}')" style="background: var(--bg-main); border: 1px solid var(--border-subtle); color: #38bdf8; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-pen"></i> تعديل
                            </button>
                            <button class="btn-small" onclick="deleteProduct('${p.id}')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 5px 10px; border-radius: 6px; cursor: pointer;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

window.openAddModal = function() {
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
};

window.closeAddModal = function() {
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

window.handleAddNewProduct = async function(e) {
    e.preventDefault();
    const name = document.getElementById('add-product-name').value.trim();
    const category = document.getElementById('add-product-category').value;
    const price = Number(document.getElementById('add-product-price').value);
    const origPrice = Number(document.getElementById('add-product-orig-price').value) || price + 50;
    const stock = Number(document.getElementById('add-product-stock').value) || 100;
    const badge = document.getElementById('add-product-badge').value;
    const image = document.getElementById('add-product-image').value;

    const newProduct = {
        id: 'prod-' + Date.now(),
        name,
        category,
        categoryName: category === 'boxers' ? 'بوكسرات قطنية' : 'فانلات داخلية',
        price,
        originalPrice: origPrice,
        stock,
        badge,
        image
    };

    try {
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
    } catch(e) {}

    closeAddModal();
    document.getElementById('add-product-form')?.reset();
    await loadData();
    renderTab('products');
    alert(`تمت إضافة منتج "${name}" بنجاح!`);
};

// -------------------------------------------------------------
// Edit Product Modal State & Handlers
// -------------------------------------------------------------
let editProductGallery = [];
let editPrimaryImageIdx = 0;
let editSelectedBadges = [];
const PRESET_BADGES = [
    'الأكثر مبيعاً',
    'وصل حديثاً',
    'خصم خاص',
    'قطن 100%',
    'شحن مجاني',
    'عرض محدود',
    'نفذت الكمية'
];

/**
 * Client-Side Image Compressor (Transforms dropped/uploaded photos to compact JPEGs)
 */
function compressImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            return resolve(null);
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

window.triggerEditFileInput = function() {
    if (editProductGallery.length >= 5) {
        alert('تم الوصول للحد الأقصى لمعرض الصور (5 صور كحد أقصى)');
        return;
    }
    const input = document.getElementById('edit-product-file-input');
    if (input) input.click();
};

window.handleFileInputChange = async function(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processUploadedFiles(files);
    e.target.value = ''; // Reset input to allow re-selecting same file
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('edit-dropzone');
    if (dropzone) dropzone.classList.add('drag-over');
};

window.handleDragLeave = function(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('edit-dropzone');
    if (dropzone) dropzone.classList.remove('drag-over');
};

window.handleDrop = async function(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('edit-dropzone');
    if (dropzone) dropzone.classList.remove('drag-over');

    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (files && files.length > 0) {
        await processUploadedFiles(files);
    }
};

async function processUploadedFiles(fileList) {
    const availableSlots = 5 - editProductGallery.length;
    if (availableSlots <= 0) {
        alert('تم الوصول للحد الأقصى لمعرض الصور (5 صور كحد أقصى)');
        return;
    }

    const filesToProcess = Array.from(fileList).slice(0, availableSlots);
    for (const file of filesToProcess) {
        try {
            const compressed = await compressImageFile(file);
            if (compressed && editProductGallery.length < 5) {
                editProductGallery.push(compressed);
            }
        } catch (err) {
            console.error('Error reading image:', err);
        }
    }
    renderEditGalleryUI();
}

window.addDirectImageUrl = function() {
    const input = document.getElementById('edit-direct-img-url');
    if (!input) return;
    const url = input.value.trim();
    if (!url) {
        alert('الرجاء إدخال رابط أو مسار صورة صحيح');
        return;
    }
    if (editProductGallery.length >= 5) {
        alert('تم الوصول للحد الأقصى لمعرض الصور (5 صور كحد أقصى)');
        return;
    }
    editProductGallery.push(url);
    input.value = '';
    renderEditGalleryUI();
};

window.setEditPrimaryImage = function(idx) {
    if (idx >= 0 && idx < editProductGallery.length) {
        editPrimaryImageIdx = idx;
        renderEditGalleryUI();
    }
};

window.removeEditGalleryImage = function(idx) {
    if (editProductGallery.length <= 1) {
        if (!confirm('هل تريد حذف هذه الصورة؟ يفضل وجود صورة واحدة على الأقل للمنتج.')) return;
    }
    editProductGallery.splice(idx, 1);
    if (editPrimaryImageIdx >= editProductGallery.length) {
        editPrimaryImageIdx = Math.max(0, editProductGallery.length - 1);
    }
    renderEditGalleryUI();
};

function renderEditGalleryUI() {
    const container = document.getElementById('edit-gallery-preview-container');
    const badge = document.getElementById('edit-gallery-count-badge');
    const dropzone = document.getElementById('edit-dropzone');

    if (badge) {
        badge.textContent = `${editProductGallery.length} / 5 صور`;
    }

    if (dropzone) {
        if (editProductGallery.length >= 5) {
            dropzone.classList.add('disabled');
        } else {
            dropzone.classList.remove('disabled');
        }
    }

    if (!container) return;

    if (editProductGallery.length === 0) {
        container.innerHTML = `
            <div style="width: 100%; text-align: center; padding: 12px; color: var(--text-muted); font-size: 0.85rem; border: 1px dashed var(--border-subtle); border-radius: 8px;">
                <i class="fa-solid fa-triangle-exclamation" style="margin-left: 6px; color: #f59e0b;"></i> لا توجد صور مرفوعة حالياً، يرجى رفع صورة أو إضافة رابط.
            </div>
        `;
        return;
    }

    container.innerHTML = editProductGallery.map((imgUrl, idx) => {
        const isPrimary = (idx === editPrimaryImageIdx);
        return `
            <div class="gallery-thumb-item ${isPrimary ? 'is-primary' : ''}">
                <img src="${imgUrl}" alt="صورة ${idx + 1}" class="thumb-img">
                <div class="thumb-overlay-actions">
                    ${isPrimary 
                        ? `<span class="primary-tag" title="هذه هي الصورة الأساسية للواجهة"><i class="fa-solid fa-star"></i> رئيسية</span>`
                        : `<button type="button" class="btn-thumb-action" onclick="setEditPrimaryImage(${idx})" title="تعيين كصورة رئيسية للواجهة"><i class="fa-regular fa-star"></i> رئيسية</button>`
                    }
                    <button type="button" class="btn-thumb-action btn-remove-img" onclick="removeEditGalleryImage(${idx})" title="حذف الصورة من المعرض"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <span class="thumb-index-num">#${idx + 1}</span>
            </div>
        `;
    }).join('');
}

// -------------------------------------------------------------
// Badges UI & State Management
// -------------------------------------------------------------
function renderEditBadgesUI() {
    const presetContainer = document.getElementById('edit-preset-badges-container');
    const activeStrip = document.getElementById('edit-active-badges-strip');

    if (presetContainer) {
        presetContainer.innerHTML = PRESET_BADGES.map(badgeText => {
            const isActive = editSelectedBadges.includes(badgeText);
            return `
                <button type="button" class="badge-chip-btn ${isActive ? 'active' : ''}" onclick="toggleEditBadge('${badgeText}')">
                    <i class="${isActive ? 'fa-solid fa-check' : 'fa-solid fa-tag'}"></i>
                    ${badgeText}
                </button>
            `;
        }).join('');
    }

    if (activeStrip) {
        if (editSelectedBadges.length === 0) {
            activeStrip.innerHTML = `
                <span style="color: var(--text-muted); font-size: 0.8rem;">
                    لا توجد شارات مفعلة حالياً (يظهر المنتج كمتوفر قياسي بدون شارة)
                </span>
            `;
        } else {
            activeStrip.innerHTML = editSelectedBadges.map(b => `
                <span class="selected-badge-pill">
                    <i class="fa-solid fa-tag" style="font-size: 0.7rem;"></i>
                    ${b}
                    <button type="button" class="remove-badge-btn" onclick="removeEditBadge('${b}')" title="إزالة هذه الشارة">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </span>
            `).join('');
        }
    }
}

window.toggleEditBadge = function(badgeName) {
    const idx = editSelectedBadges.indexOf(badgeName);
    if (idx > -1) {
        editSelectedBadges.splice(idx, 1);
    } else {
        editSelectedBadges.push(badgeName);
    }
    renderEditBadgesUI();
};

window.addCustomBadge = function() {
    const input = document.getElementById('edit-custom-badge-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;

    if (!editSelectedBadges.includes(val)) {
        editSelectedBadges.push(val);
    }
    input.value = '';
    renderEditBadgesUI();
};

window.removeEditBadge = function(badgeName) {
    const idx = editSelectedBadges.indexOf(badgeName);
    if (idx > -1) {
        editSelectedBadges.splice(idx, 1);
        renderEditBadgesUI();
    }
};

// -------------------------------------------------------------
// Real-time Pricing & Compare-at Discount Calculator
// -------------------------------------------------------------
window.calculateEditDiscount = function() {
    const priceInput = document.getElementById('edit-product-price');
    const origInput = document.getElementById('edit-product-orig-price');
    const indicator = document.getElementById('edit-discount-indicator');
    const textSpan = document.getElementById('edit-discount-text');
    const badgeSpan = document.getElementById('edit-discount-badge-pct');

    if (!priceInput || !origInput || !indicator) return;

    const price = Number(priceInput.value);
    const orig = Number(origInput.value);

    if (orig && price && orig > price) {
        const pct = Math.round(((orig - price) / orig) * 100);
        const diff = Math.round(orig - price);
        textSpan.innerHTML = `<i class="fa-solid fa-fire" style="color: #f59e0b; margin-left: 6px;"></i> وفرت <strong>${diff} ج.م</strong> للعميل بدلاً من ${orig} ج.م`;
        badgeSpan.textContent = `خصم ${pct}%`;
        indicator.style.display = 'flex';
    } else {
        indicator.style.display = 'none';
    }
};

// -------------------------------------------------------------
// Modal Open / Close / Submit
// -------------------------------------------------------------
window.openEditModal = function(productId) {
    const p = adminData.products.find(item => item.id === productId);
    if (!p) {
        alert('لم يتم العثور على المنتج المطلوب!');
        return;
    }

    // 1. Basic Fields
    document.getElementById('edit-product-id').value = p.id;
    document.getElementById('edit-product-name').value = p.name || '';
    document.getElementById('edit-product-price').value = p.price || '';
    document.getElementById('edit-product-orig-price').value = p.originalPrice || '';
    document.getElementById('edit-product-category').value = p.category || 'boxers';
    document.getElementById('edit-product-stock').value = (p.stock !== undefined) ? p.stock : 100;
    
    // Sizes
    const sizesVal = Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || 'M, L, XL, 2XL, 3XL');
    document.getElementById('edit-product-sizes').value = sizesVal;

    // Fabric
    document.getElementById('edit-product-fabric').value = p.fabric || '100% قطن مصري فاخر فائق النعومة';

    // Subtitle
    const subtitle = document.getElementById('edit-modal-subtitle');
    if (subtitle) {
        subtitle.textContent = `تعديل: ${p.name}`;
    }

    // 2. Initialize Gallery (up to 5 images)
    editProductGallery = [];
    if (Array.isArray(p.gallery) && p.gallery.length > 0) {
        editProductGallery = [...p.gallery].slice(0, 5);
    }
    if (p.image && !editProductGallery.includes(p.image)) {
        editProductGallery.unshift(p.image);
    }
    if (editProductGallery.length === 0) {
        if (p.image) editProductGallery.push(p.image);
        else editProductGallery.push('assets/images/product_boxer.jpg');
    }
    editProductGallery = editProductGallery.slice(0, 5);

    // Primary index
    const foundIdx = p.image ? editProductGallery.indexOf(p.image) : 0;
    editPrimaryImageIdx = (foundIdx >= 0) ? foundIdx : 0;

    // 3. Initialize Badges
    editSelectedBadges = [];
    if (Array.isArray(p.badges) && p.badges.length > 0) {
        editSelectedBadges = [...p.badges];
    } else if (p.badge && p.badge.trim()) {
        editSelectedBadges = [p.badge.trim()];
    }

    // 4. Render Dynamic Sub-components
    renderEditGalleryUI();
    renderEditBadgesUI();
    calculateEditDiscount();

    // 5. Open Modal
    const modal = document.getElementById('edit-product-modal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
};

window.closeEditModal = function() {
    const modal = document.getElementById('edit-product-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

window.handleEditProductSubmit = async function(e) {
    e.preventDefault();
    const productId = document.getElementById('edit-product-id').value;
    if (!productId) return;

    const name = document.getElementById('edit-product-name').value.trim();
    const price = Number(document.getElementById('edit-product-price').value);
    const origPriceVal = document.getElementById('edit-product-orig-price').value;
    const origPrice = origPriceVal ? Number(origPriceVal) : null;
    const category = document.getElementById('edit-product-category').value;
    const stock = Number(document.getElementById('edit-product-stock').value);
    const fabric = document.getElementById('edit-product-fabric').value.trim();
    const sizesStr = document.getElementById('edit-product-sizes').value;
    const sizes = sizesStr.split(',').map(s => s.trim()).filter(Boolean);

    // Gallery & Primary Image
    if (editProductGallery.length === 0) {
        editProductGallery.push('assets/images/product_boxer.jpg');
    }
    const primaryImage = editProductGallery[editPrimaryImageIdx] || editProductGallery[0];

    // Reorder gallery so primary image is at position 0
    const finalGallery = [primaryImage, ...editProductGallery.filter((_, i) => i !== editPrimaryImageIdx)];

    // Category name in Arabic
    let categoryName = 'بوكسرات قطنية';
    if (category === 'undershirts') categoryName = 'فانلات داخلية';
    if (category === 'briefs') categoryName = 'سراويل كلاسيك';

    // Badge Type determination
    let badgeType = 'featured';
    if (editSelectedBadges.some(b => /خصم|sale/i.test(b))) {
        badgeType = 'sale';
    } else if (editSelectedBadges.some(b => /جديد|new/i.test(b))) {
        badgeType = 'new';
    } else if (editSelectedBadges.some(b => /الأكثر مبيعاً|أكثر مبيعاً/i.test(b))) {
        badgeType = 'bestseller';
    }

    const updatedProduct = {
        name,
        category,
        categoryName,
        price,
        originalPrice: origPrice,
        stock: isNaN(stock) ? 100 : stock,
        fabric: fabric || '100% قطن مصري فاخر',
        sizes: sizes.length > 0 ? sizes : ['M', 'L', 'XL', '2XL'],
        badges: editSelectedBadges,
        badge: editSelectedBadges[0] || '',
        badgeType: badgeType,
        image: primaryImage,
        gallery: finalGallery
    };

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct)
        });
        const resData = await response.json();
        if (!response.ok || !resData.success) {
            throw new Error(resData.error || 'فشل التحديث على السيرفر');
        }
    } catch(err) {
        console.warn('[Admin] Sync note:', err.message);
    }

    // Sync to window.DB if exists
    if (typeof DB !== 'undefined' && DB.saveProduct) {
        try {
            await DB.saveProduct({ id: productId, ...updatedProduct });
        } catch(e) {}
    }

    closeEditModal();
    await loadData();
    renderTab('products');
    alert(`تم حفظ وتحديث منتج "${name}" بنجاح!`);
};

window.deleteProduct = async function(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;
    try {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    } catch(e) {}
    await loadData();
    renderTab('products');
};

// ----------------------------------------------------
// Customers Tab
// ----------------------------------------------------
function renderCustomers() {
    const customerMap = {};
    adminData.orders.forEach(order => {
        const phone = order.customer?.phone || 'غير مسجل';
        if (!customerMap[phone]) {
            customerMap[phone] = {
                name: order.customer?.name || 'عميل',
                phone: phone,
                email: order.customer?.email || '-',
                gov: order.customer?.governorate || order.customer?.gov || '-',
                city: order.customer?.city || '-',
                ordersCount: 0,
                totalSpent: 0
            };
        }
        customerMap[phone].ordersCount += 1;
        customerMap[phone].totalSpent += (order.summary?.total || 0);
    });

    const customers = Object.values(customerMap);

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>قاعدة بيانات العملاء المسجلين</h3>
            <span>إجمالي العملاء: ${customers.length} عميل</span>
        </div>
        <div class="admin-table-container" style="overflow-x:auto; background:var(--bg-surface-elevated); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
            <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right;">
                <thead>
                    <tr style="background:rgba(15,23,42,0.7); border-bottom:1px solid var(--border-subtle);">
                        <th style="padding:14px; color:var(--accent-gold);">اسم العميل</th>
                        <th style="padding:14px; color:var(--accent-gold);">الهاتف</th>
                        <th class="hide-on-mobile" style="padding:14px; color:var(--accent-gold);">البريد</th>
                        <th class="hide-on-mobile" style="padding:14px; color:var(--accent-gold);">المحافظة / المدينة</th>
                        <th class="hide-on-mobile" style="padding:14px; color:var(--accent-gold);">عدد الطلبات</th>
                        <th style="padding:14px; color:var(--accent-gold);">إجمالي المشتريات</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(c => `
                        <tr style="border-bottom:1px solid var(--border-subtle);">
                            <td style="padding:12px 14px;"><strong>${c.name}</strong></td>
                            <td style="padding:12px 14px;" dir="ltr"><a href="tel:${c.phone}" style="color:#38bdf8; text-decoration:none;">${c.phone}</a></td>
                            <td class="hide-on-mobile" style="padding:12px 14px;">${c.email}</td>
                            <td class="hide-on-mobile" style="padding:12px 14px;">${c.gov} - ${c.city}</td>
                            <td class="hide-on-mobile" style="padding:12px 14px; font-weight:bold;">${c.ordersCount} طلبات</td>
                            <td style="padding:12px 14px; font-weight:bold; color:var(--accent-gold);">${c.totalSpent.toLocaleString()} ج.م</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ----------------------------------------------------
// 🗄️ Interactive Database Viewer Tab
// ----------------------------------------------------
let activeDbTable = 'orders';

function renderDatabaseViewer() {
    const tableOptions = [
        { id: 'orders', name: '📦 جدول الطلبات (orders)', count: adminData.orders.length },
        { id: 'products', name: '👕 جدول المنتجات (products)', count: adminData.products.length },
        { id: 'customers', name: '👥 جدول العملاء (customers)', count: adminData.orders.length },
        { id: 'rfqs', name: '🤝 جدول عقود الجملة (b2b_rfqs)', count: adminData.rfqs.length }
    ];

    let contentHtml = '';

    if (activeDbTable === 'orders') {
        contentHtml = `
            <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right; font-size:0.85rem;">
                <thead>
                    <tr style="background:rgba(15,23,42,0.7); color:var(--accent-gold); border-bottom:1px solid var(--border-subtle);">
                        <th style="padding:10px;">id (PK)</th>
                        <th style="padding:10px;">order_date</th>
                        <th style="padding:10px;">customer_name</th>
                        <th style="padding:10px;">customer_phone</th>
                        <th style="padding:10px;">governorate</th>
                        <th style="padding:10px;">payment_method</th>
                        <th style="padding:10px;">txn_id</th>
                        <th style="padding:10px;">total_amount</th>
                        <th style="padding:10px;">order_status</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminData.orders.slice().reverse().map(o => `
                        <tr style="border-bottom:1px solid var(--border-subtle);">
                            <td style="padding:10px; font-family:monospace; color:#38bdf8;">${o.id}</td>
                            <td style="padding:10px;">${new Date(o.date).toLocaleDateString('ar-EG')}</td>
                            <td style="padding:10px;"><strong>${o.customer?.name || ''}</strong></td>
                            <td style="padding:10px;" dir="ltr">${o.customer?.phone || ''}</td>
                            <td style="padding:10px;">${o.customer?.governorate || o.customer?.gov || ''}</td>
                            <td style="padding:10px;">${o.paymentMethod || 'cod'}</td>
                            <td style="padding:10px; font-family:monospace; color:#10b981;">${o.transaction?.transaction_id || '-'}</td>
                            <td style="padding:10px; font-weight:bold; color:var(--accent-gold);">${(o.summary?.total || 0).toLocaleString()} ج.م</td>
                            <td style="padding:10px;"><span style="background:rgba(16,185,129,0.15); color:#10b981; padding:3px 8px; border-radius:4px; font-size:0.75rem;">${o.status || 'قيد التحضير'}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (activeDbTable === 'products') {
        contentHtml = `
            <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right; font-size:0.85rem;">
                <thead>
                    <tr style="background:rgba(15,23,42,0.7); color:var(--accent-gold); border-bottom:1px solid var(--border-subtle);">
                        <th style="padding:10px;">id (PK)</th>
                        <th style="padding:10px;">name</th>
                        <th style="padding:10px;">category</th>
                        <th style="padding:10px;">price</th>
                        <th style="padding:10px;">stock</th>
                        <th style="padding:10px;">rating</th>
                        <th style="padding:10px;">fabric</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminData.products.map(p => `
                        <tr style="border-bottom:1px solid var(--border-subtle);">
                            <td style="padding:10px; font-family:monospace; color:#38bdf8;">${p.id}</td>
                            <td style="padding:10px;"><strong>${p.name}</strong></td>
                            <td style="padding:10px;">${p.categoryName || p.category}</td>
                            <td style="padding:10px; font-weight:bold; color:var(--accent-gold);">${p.price} ج.م</td>
                            <td style="padding:10px;">${p.stock} قطعة</td>
                            <td style="padding:10px;">⭐ ${p.rating || 5.0}</td>
                            <td style="padding:10px; font-size:0.8rem; color:var(--text-secondary);">${p.fabric || 'قطن مصري'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (activeDbTable === 'customers') {
        contentHtml = `
            <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right; font-size:0.85rem;">
                <thead>
                    <tr style="background:rgba(15,23,42,0.7); color:var(--accent-gold); border-bottom:1px solid var(--border-subtle);">
                        <th style="padding:10px;">customer_name</th>
                        <th style="padding:10px;">customer_phone (UNIQUE)</th>
                        <th style="padding:10px;">email</th>
                        <th style="padding:10px;">governorate</th>
                        <th style="padding:10px;">city</th>
                        <th style="padding:10px;">address</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminData.orders.map(o => `
                        <tr style="border-bottom:1px solid var(--border-subtle);">
                            <td style="padding:10px;"><strong>${o.customer?.name || 'عميل'}</strong></td>
                            <td style="padding:10px;" dir="ltr"><a href="tel:${o.customer?.phone || ''}" style="color:#38bdf8; text-decoration:none;">${o.customer?.phone || ''}</a></td>
                            <td style="padding:10px;">${o.customer?.email || '-'}</td>
                            <td style="padding:10px;">${o.customer?.governorate || o.customer?.gov || '-'}</td>
                            <td style="padding:10px;">${o.customer?.city || '-'}</td>
                            <td style="padding:10px; font-size:0.8rem; color:var(--text-secondary);">${o.customer?.address || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (activeDbTable === 'rfqs') {
        contentHtml = `
            <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right; font-size:0.85rem;">
                <thead>
                    <tr style="background:rgba(15,23,42,0.7); color:var(--accent-gold); border-bottom:1px solid var(--border-subtle);">
                        <th style="padding:10px;">id (PK)</th>
                        <th style="padding:10px;">company_name</th>
                        <th style="padding:10px;">contact_name</th>
                        <th style="padding:10px;">phone</th>
                        <th style="padding:10px;">product_name</th>
                        <th style="padding:10px;">quantity</th>
                        <th style="padding:10px;">status</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminData.rfqs.map(r => `
                        <tr style="border-bottom:1px solid var(--border-subtle);">
                            <td style="padding:10px; font-family:monospace; color:#38bdf8;">${r.id}</td>
                            <td style="padding:10px;"><strong>${r.company || '-'}</strong></td>
                            <td style="padding:10px;">${r.contactName || '-'}</td>
                            <td style="padding:10px;" dir="ltr">${r.phone || ''}</td>
                            <td style="padding:10px;">${r.product || r.productName || 'منتج جملة'}</td>
                            <td style="padding:10px;">${r.quantity || r.qty || 100} قطعة</td>
                            <td style="padding:10px;"><span style="background:rgba(16,185,129,0.15); color:#10b981; padding:3px 8px; border-radius:4px; font-size:0.75rem;">${r.status || 'جديد'}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    return `
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <div>
                    <h3 style="font-size:1.3rem; font-weight:800; color:var(--text-primary);">
                        <i class="fa-solid fa-database" style="color:var(--accent-gold); margin-left:8px;"></i> مستعرض قاعدة البيانات Relational SQL
                    </h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
                        المحرك: <strong>SQLite 3 / MySQL Compatible</strong> | المسار: <code>data/almesiri_database.db</code>
                    </p>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-small" onclick="exportDatabaseToSQL()" style="background:#4f46e5; color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:700; cursor:pointer;">
                        <i class="fa-solid fa-file-code"></i> تحميل SQL (.sql)
                    </button>
                    <a href="/api/download/db" class="btn-small" style="background:#0284c7; color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:6px;">
                        <i class="fa-solid fa-hard-drive"></i> تحميل DB (.db)
                    </a>
                </div>
            </div>

            <!-- Table Navigation Tabs -->
            <div style="display:flex; gap:8px; flex-wrap:wrap; border-bottom:1px solid var(--border-subtle); padding-bottom:12px; margin-bottom:16px;">
                ${tableOptions.map(t => `
                    <button onclick="switchDbTable('${t.id}')" style="background:${activeDbTable === t.id ? 'var(--accent-gold)' : 'var(--bg-main)'}; color:${activeDbTable === t.id ? '#0f172a' : 'var(--text-primary)'}; border:1px solid var(--border-subtle); padding:8px 16px; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.85rem;">
                        ${t.name} <span style="opacity:0.8; font-size:0.75rem;">(${t.count})</span>
                    </button>
                `).join('')}
            </div>

            <div style="overflow-x:auto; background:var(--bg-main); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                ${contentHtml}
            </div>
        </div>
    `;
}

window.switchDbTable = function(tableId) {
    activeDbTable = tableId;
    renderTab('db-viewer');
};

// ----------------------------------------------------
// Finance Tab
// ----------------------------------------------------
function renderFinance() {
    const totalRev = adminData.orders.reduce((sum, o) => sum + (o.summary?.total || 0), 0);
    const paidRev = adminData.orders.filter(o => o.paymentStatus === 'PAID' || (o.status && o.status.includes('تم الدفع'))).reduce((sum, o) => sum + (o.summary?.total || 0), 0);
    const codRev = totalRev - paidRev;

    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-lg);">
                <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 6px;">إجمالي الإيرادات الكلية</div>
                <h3 style="font-size: 1.6rem; font-weight: 900; color: var(--accent-gold);">${totalRev.toLocaleString()} ج.م</h3>
            </div>
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-lg);">
                <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 6px;">مدفوعات إلكترونية مؤكدة (Kashier)</div>
                <h3 style="font-size: 1.6rem; font-weight: 900; color: #10b981;">${paidRev.toLocaleString()} ج.م</h3>
            </div>
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-lg);">
                <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 6px;">مبالغ قيد التحصيل (دفع عند الاستلام)</div>
                <h3 style="font-size: 1.6rem; font-weight: 900; color: #f59e0b;">${codRev.toLocaleString()} ج.م</h3>
            </div>
        </div>
    `;
}

/**
 * =========================================================================
 * 📊 EXPORT ORDERS TO EXCEL (.xls) & GOOGLE SHEETS
 * Generates an authentic Excel XML/HTML Workbook that opens with 100% separate columns
 * =========================================================================
 */
window.exportOrdersToExcel = function() {
    if (!adminData.orders || adminData.orders.length === 0) {
        alert('لا توجد طلبات مسجلة لتصديرها حالياً!');
        return;
    }

    let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
            <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                        <x:Name>طلبات مصنع المسيري</x:Name>
                        <x:WorksheetOptions>
                            <x:DisplayRightToLeft/>
                        </x:WorksheetOptions>
                    </x:ExcelWorksheet>
                </x:ExcelWorksheets>
            </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
            table { border-collapse: collapse; width: 100%; direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
            th { background-color: #0f172a; color: #f8fafc; font-weight: bold; padding: 12px 14px; border: 1px solid #334155; text-align: center; font-size: 13px; }
            td { padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center; font-size: 12px; }
            .num-text { mso-number-format: "\\@"; font-family: 'Segoe UI', monospace; }
            .currency { font-weight: bold; color: #967d5b; }
            .paid { color: #16a34a; font-weight: bold; background-color: #dcfce7; }
            .pending { color: #d97706; font-weight: bold; background-color: #fef3c7; }
            .items-col { text-align: right; font-size: 11px; }
        </style>
    </head>
    <body>
        <table>
            <thead>
                <tr>
                    <th>رقم الطلب (Order ID)</th>
                    <th>تاريخ ووقت الطلب</th>
                    <th>اسم العميل</th>
                    <th>رقم الهاتف / الموبايل</th>
                    <th>البريد الإلكتروني</th>
                    <th>المحافظة</th>
                    <th>المدينة / المركز</th>
                    <th>العنوان بالتفصيل</th>
                    <th>وسيلة السداد</th>
                    <th>رقم العملية البنكية (TXN)</th>
                    <th>حالة الدفع</th>
                    <th>المنتجات المطلوبة والمقاسات</th>
                    <th>المجموع الفرعي (ج.م)</th>
                    <th>تكلفة الشحن (ج.م)</th>
                    <th>الخصم المطبق (ج.م)</th>
                    <th>الإجمالي النهائي (ج.م)</th>
                    <th>حالة الطلب</th>
                    <th>ملاحظات التوصيل</th>
                </tr>
            </thead>
            <tbody>
    `;

    adminData.orders.forEach(order => {
        const dateStr = new Date(order.date).toLocaleString('ar-EG');
        const itemsSummary = (order.items || []).map(i => `${i.name || i.title || 'منتج'} [الكمية: ${i.qty || i.quantity || 1} | المقاس: ${i.size || '-'} | اللون: ${i.color || '-'}]`).join(' + ');
        const paymentMethod = order.paymentMethod === 'cod' ? 'الدفع عند الاستلام (COD)' : 'دفع إلكتروني (Kashier)';
        const txnId = order.transaction?.transaction_id || '-';
        const isPaid = order.paymentStatus === 'PAID' || (order.status && order.status.includes('تم الدفع'));
        const paymentStatusText = isPaid ? 'مدفوع ومؤكد ✅' : 'معلق ⏳';
        const phone = order.customer?.phone || '';

        tableHtml += `
            <tr>
                <td class="num-text" style="font-weight:bold; color:#0284c7;">#${order.id}</td>
                <td>${dateStr}</td>
                <td style="font-weight:bold;">${order.customer?.name || ''}</td>
                <td class="num-text">${phone}</td>
                <td>${order.customer?.email || '-'}</td>
                <td>${order.customer?.governorate || order.customer?.gov || ''}</td>
                <td>${order.customer?.city || ''}</td>
                <td>${order.customer?.address || ''}</td>
                <td>${paymentMethod}</td>
                <td class="num-text">${txnId}</td>
                <td class="${isPaid ? 'paid' : 'pending'}">${paymentStatusText}</td>
                <td class="items-col">${itemsSummary}</td>
                <td>${order.summary?.subtotal || 0}</td>
                <td>${order.summary?.shipping || 0}</td>
                <td>${order.summary?.discount || 0}</td>
                <td class="currency">${(order.summary?.total || 0).toLocaleString()} ج.م</td>
                <td>${order.status || 'قيد التحضير'}</td>
                <td>${order.customer?.notes || '-'}</td>
            </tr>
        `;
    });

    tableHtml += `
            </tbody>
        </table>
    </body>
    </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `طلبات_مصنع_المسيري_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * 📊 2. Export Google Sheets CSV with Tab delimiter & proper UTF-8
 */
window.exportOrdersToGoogleSheetsCSV = function() {
    if (!adminData.orders || adminData.orders.length === 0) {
        alert('لا توجد طلبات مسجلة لتصديرها حالياً!');
        return;
    }

    const headers = [
        'رقم الطلب',
        'تاريخ الطلب',
        'اسم العميل',
        'رقم الهاتف',
        'البريد الإلكتروني',
        'المحافظة',
        'المدينة',
        'العنوان بالتفصيل',
        'وسيلة السداد',
        'رقم العملية TXN',
        'حالة الدفع',
        'المنتجات والكميات',
        'المجموع',
        'الشحن',
        'الخصم',
        'الإجمالي النهائي',
        'حالة الطلب',
        'ملاحظات'
    ];

    const rows = adminData.orders.map(order => {
        const dateStr = new Date(order.date).toLocaleString('ar-EG');
        const itemsSummary = (order.items || []).map(i => `${i.name || 'منتج'} (${i.qty || 1})`).join(' + ');
        const paymentMethod = order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني (Kashier)';
        const txnId = order.transaction?.transaction_id || '-';
        const isPaid = order.paymentStatus === 'PAID' || (order.status && order.status.includes('تم الدفع'));
        const paymentStatusText = isPaid ? 'مدفوع ومؤكد' : 'معلق';

        return [
            order.id,
            dateStr,
            order.customer?.name || '',
            `'${order.customer?.phone || ''}`,
            order.customer?.email || '',
            order.customer?.governorate || order.customer?.gov || '',
            order.customer?.city || '',
            order.customer?.address || '',
            paymentMethod,
            txnId,
            paymentStatusText,
            itemsSummary,
            order.summary?.subtotal || 0,
            order.summary?.shipping || 0,
            order.summary?.discount || 0,
            order.summary?.total || 0,
            order.status || 'قيد التحضير',
            order.customer?.notes || ''
        ];
    });

    const csvContent = 'sep=\t\r\n\uFEFF' + [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Google_Sheets_طلبات_المسيري_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * 🗄️ 3. Export Full SQL Database Dump (.sql)
 * Generates an authentic SQL schema and data dump file ready to import into MySQL / PostgreSQL / phpMyAdmin
 */
window.exportDatabaseToSQL = function() {
    let sql = `-- =========================================================================\n`;
    sql += `-- AL-MESIRI FACTORY E-COMMERCE DATABASE (SQL)\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Compatible with: MySQL 5.7+, MySQL 8+, MariaDB, PostgreSQL, SQLite, phpMyAdmin\n`;
    sql += `-- =========================================================================\n\n`;
    sql += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // 1. Products Table
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `-- 1. Table structure for: products (المنتجات والمخزون)\n`;
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`products\` (\n`;
    sql += `  \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`name\` VARCHAR(255) NOT NULL,\n`;
    sql += `  \`category\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`category_name\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,\n`;
    sql += `  \`original_price\` DECIMAL(10,2) DEFAULT NULL,\n`;
    sql += `  \`stock\` INT NOT NULL DEFAULT 100,\n`;
    sql += `  \`rating\` DECIMAL(3,2) DEFAULT 5.00,\n`;
    sql += `  \`reviews_count\` INT DEFAULT 0,\n`;
    sql += `  \`badge\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`image\` VARCHAR(500) DEFAULT NULL,\n`;
    sql += `  \`fabric\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    if (adminData.products && adminData.products.length > 0) {
        sql += `-- Dumping data for table: products\n`;
        adminData.products.forEach(p => {
            const id = (p.id || '').replace(/'/g, "''");
            const name = (p.name || '').replace(/'/g, "''");
            const category = (p.category || 'boxers').replace(/'/g, "''");
            const categoryName = (p.categoryName || 'بوكسرات قطنية').replace(/'/g, "''");
            const price = Number(p.price) || 0;
            const origPrice = p.originalPrice ? Number(p.originalPrice) : 'NULL';
            const stock = Number(p.stock) || 100;
            const rating = Number(p.rating) || 5.0;
            const reviews = Number(p.reviewsCount) || 0;
            const badge = p.badge ? `'${p.badge.replace(/'/g, "''")}'` : 'NULL';
            const image = (p.image || '').replace(/'/g, "''");
            const fabric = (p.fabric || 'قطن مصري 100%').replace(/'/g, "''");

            sql += `INSERT INTO \`products\` (\`id\`, \`name\`, \`category\`, \`category_name\`, \`price\`, \`original_price\`, \`stock\`, \`rating\`, \`reviews_count\`, \`badge\`, \`image\`, \`fabric\`) VALUES ('${id}', '${name}', '${category}', '${categoryName}', ${price}, ${origPrice}, ${stock}, ${rating}, ${reviews}, ${badge}, '${image}', '${fabric}') ON DUPLICATE KEY UPDATE \`price\`=${price}, \`stock\`=${stock};\n`;
        });
        sql += '\n';
    }

    // 2. Customers Table
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `-- 2. Table structure for: customers (قاعدة بيانات العملاء)\n`;
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`customers\` (\n`;
    sql += `  \`id\` INT AUTO_INCREMENT PRIMARY KEY,\n`;
    sql += `  \`name\` VARCHAR(255) NOT NULL,\n`;
    sql += `  \`phone\` VARCHAR(50) NOT NULL UNIQUE,\n`;
    sql += `  \`email\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  \`governorate\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`city\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`address\` TEXT DEFAULT NULL,\n`;
    sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // 3. Orders Table
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `-- 3. Table structure for: orders (طلبات الأفراد B2C)\n`;
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`orders\` (\n`;
    sql += `  \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`order_date\` DATETIME NOT NULL,\n`;
    sql += `  \`customer_name\` VARCHAR(255) NOT NULL,\n`;
    sql += `  \`customer_phone\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`customer_email\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  \`governorate\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`city\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`address\` TEXT DEFAULT NULL,\n`;
    sql += `  \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'cod',\n`;
    sql += `  \`txn_id\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`payment_status\` VARCHAR(50) NOT NULL DEFAULT 'PENDING',\n`;
    sql += `  \`subtotal\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,\n`;
    sql += `  \`shipping_cost\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,\n`;
    sql += `  \`discount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,\n`;
    sql += `  \`total_amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,\n`;
    sql += `  \`order_status\` VARCHAR(100) NOT NULL DEFAULT 'قيد التحضير',\n`;
    sql += `  \`notes\` TEXT DEFAULT NULL,\n`;
    sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // 4. Order Items Table
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `-- 4. Table structure for: order_items (تفاصيل منتجات الطلب)\n`;
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`order_items\` (\n`;
    sql += `  \`id\` INT AUTO_INCREMENT PRIMARY KEY,\n`;
    sql += `  \`order_id\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`product_name\` VARCHAR(255) NOT NULL,\n`;
    sql += `  \`size\` VARCHAR(50) DEFAULT NULL,\n`;
    sql += `  \`color\` VARCHAR(50) DEFAULT NULL,\n`;
    sql += `  \`quantity\` INT NOT NULL DEFAULT 1,\n`;
    sql += `  \`unit_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,\n`;
    sql += `  \`total_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // 5. B2B RFQs Table
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `-- 5. Table structure for: b2b_rfqs (عقود وطلبات الجملة والتوريدات)\n`;
    sql += `-- -------------------------------------------------------------------------\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`b2b_rfqs\` (\n`;
    sql += `  \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`company_name\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  \`contact_name\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  \`phone\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`email\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  \`product_name\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  \`quantity\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`notes\` TEXT DEFAULT NULL,\n`;
    sql += `  \`status\` VARCHAR(50) DEFAULT 'جديد',\n`;
    sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // Dump Orders
    if (adminData.orders && adminData.orders.length > 0) {
        sql += `-- Dumping data for table: orders and order_items\n`;
        adminData.orders.forEach(o => {
            const orderId = (o.id || '').replace(/'/g, "''");
            let orderDate = 'NOW()';
            try {
                orderDate = `'${new Date(o.date).toISOString().slice(0, 19).replace('T', ' ')}'`;
            } catch(e) {}
            const custName = (o.customer?.name || 'عميل').replace(/'/g, "''");
            const custPhone = (o.customer?.phone || '').replace(/'/g, "''");
            const custEmail = (o.customer?.email || '').replace(/'/g, "''");
            const gov = (o.customer?.governorate || o.customer?.gov || '').replace(/'/g, "''");
            const city = (o.customer?.city || '').replace(/'/g, "''");
            const addr = (o.customer?.address || '').replace(/'/g, "''");
            const payMethod = (o.paymentMethod || 'cod').replace(/'/g, "''");
            const txn = o.transaction?.transaction_id ? `'${o.transaction.transaction_id.replace(/'/g, "''")}'` : 'NULL';
            const isPaid = o.paymentStatus === 'PAID' || (o.status && o.status.includes('تم الدفع'));
            const payStatus = isPaid ? 'PAID' : 'PENDING';
            const subtotal = Number(o.summary?.subtotal) || 0;
            const shipping = Number(o.summary?.shipping) || 0;
            const discount = Number(o.summary?.discount) || 0;
            const total = Number(o.summary?.total) || 0;
            const status = (o.status || 'قيد التحضير').replace(/'/g, "''");
            const notes = (o.customer?.notes || '').replace(/'/g, "''");

            sql += `INSERT INTO \`orders\` (\`id\`, \`order_date\`, \`customer_name\`, \`customer_phone\`, \`customer_email\`, \`governorate\`, \`city\`, \`address\`, \`payment_method\`, \`txn_id\`, \`payment_status\`, \`subtotal\`, \`shipping_cost\`, \`discount\`, \`total_amount\`, \`order_status\`, \`notes\`) VALUES ('${orderId}', ${orderDate}, '${custName}', '${custPhone}', '${custEmail}', '${gov}', '${city}', '${addr}', '${payMethod}', ${txn}, '${payStatus}', ${subtotal}, ${shipping}, ${discount}, ${total}, '${status}', '${notes}') ON DUPLICATE KEY UPDATE \`order_status\`='${status}';\n`;

            if (o.items && o.items.length > 0) {
                o.items.forEach(item => {
                    const prodName = (item.name || item.title || 'منتج').replace(/'/g, "''");
                    const size = (item.size || '-').replace(/'/g, "''");
                    const color = (item.color || '-').replace(/'/g, "''");
                    const qty = Number(item.qty || item.quantity) || 1;
                    const price = Number(item.price) || 0;
                    const totalItem = price * qty;
                    sql += `INSERT INTO \`order_items\` (\`order_id\`, \`product_name\`, \`size\`, \`color\`, \`quantity\`, \`unit_price\`, \`total_price\`) VALUES ('${orderId}', '${prodName}', '${size}', '${color}', ${qty}, ${price}, ${totalItem});\n`;
                });
            }
        });
        sql += '\n';
    }

    // Dump RFQs
    if (adminData.rfqs && adminData.rfqs.length > 0) {
        sql += `-- Dumping data for table: b2b_rfqs\n`;
        adminData.rfqs.forEach(r => {
            const id = (r.id || 'RFQ-001').replace(/'/g, "''");
            const comp = (r.company || '').replace(/'/g, "''");
            const contact = (r.contactName || r.name || '').replace(/'/g, "''");
            const phone = (r.phone || '').replace(/'/g, "''");
            const email = (r.email || '').replace(/'/g, "''");
            const prod = (r.product || r.productName || '').replace(/'/g, "''");
            const qty = (r.qty || r.quantity || '').replace(/'/g, "''");
            const notes = (r.notes || '').replace(/'/g, "''");
            const status = (r.status || 'جديد').replace(/'/g, "''");

            sql += `INSERT INTO \`b2b_rfqs\` (\`id\`, \`company_name\`, \`contact_name\`, \`phone\`, \`email\`, \`product_name\`, \`quantity\`, \`notes\`, \`status\`) VALUES ('${id}', '${comp}', '${contact}', '${phone}', '${email}', '${prod}', '${qty}', '${notes}', '${status}');\n`;
        });
        sql += '\n';
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n-- ======================== END OF DATABASE DUMP =========================\n`;

    const blob = new Blob([sql], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `almesiri_database_backup_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.openFirebaseModal = function() {
    const modal = document.getElementById('firebase-modal');
    if (modal) {
        document.getElementById('fb-project-id').value = localStorage.getItem('mesiri_fb_projectid') || '';
        document.getElementById('fb-db-url').value = localStorage.getItem('mesiri_fb_dburl') || '';
        document.getElementById('fb-api-key').value = localStorage.getItem('mesiri_fb_apikey') || '';
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
};

window.closeFirebaseModal = function() {
    const modal = document.getElementById('firebase-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

window.saveFirebaseSettings = function(e) {
    e.preventDefault();
    const projectId = document.getElementById('fb-project-id').value.trim();
    const dbUrl = document.getElementById('fb-db-url').value.trim();
    const apiKey = document.getElementById('fb-api-key').value.trim();

    if (!projectId && !dbUrl) {
        alert('يرجى إدخال Project ID أو Database URL للمتابعة');
        return;
    }

    localStorage.setItem('mesiri_fb_projectid', projectId);
    localStorage.setItem('mesiri_fb_dburl', dbUrl);
    localStorage.setItem('mesiri_fb_apikey', apiKey);

    if (window.FirebaseManager) {
        window.FirebaseManager.saveConfig({ projectId, databaseURL: dbUrl, apiKey });
    }

    closeFirebaseModal();
    alert('🎉 تم حفظ وتفعيل إعدادات ربط Firebase بنجاح! سيتم مزامنة أي طلبات جديدة تلقائياً مع السحابة.');
};
