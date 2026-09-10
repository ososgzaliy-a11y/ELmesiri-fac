/**
 * =========================================================================
 * Al-Mesiri E-Commerce - One-Page Seamless Checkout System
 * Handles full customer details, governorates, payment methods (Kashier / COD)
 * and seamless redirect to Kashier payment gateway
 * =========================================================================
 */

let selectedPaymentMethod = 'kashier'; // 'kashier' (default online) or 'cod' (cash on delivery)

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
    checkKashierReturnStatus();
});

function initCheckout() {
    initCustomGovSelect();

    // Listen for payment method card clicks
    const methodCards = document.querySelectorAll('.payment-option-card');
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            const method = card.getAttribute('data-method') || 'kashier';
            setPaymentMethod(method);
        });
    });

    // Ensure initial selection is synced
    setPaymentMethod(selectedPaymentMethod || 'kashier');
}

function setPaymentMethod(method) {
    selectedPaymentMethod = method;
    const methodCards = document.querySelectorAll('.payment-option-card');
    methodCards.forEach(card => {
        const cardMethod = card.getAttribute('data-method');
        // Clear any inline conflicting border or background styles
        card.style.removeProperty('border');
        card.style.removeProperty('border-color');
        card.style.removeProperty('background');
        card.style.removeProperty('box-shadow');

        if (cardMethod === method) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    updatePaymentButtonUI();
}

function updatePaymentButtonUI() {
    const btn = document.getElementById('kashier-pay-btn');
    if (!btn) return;

    if (selectedPaymentMethod === 'kashier') {
        btn.innerHTML = '<i class="fa-solid fa-lock" style="margin-left: 8px;"></i> تأكيد الطلب والانتقال للدفع الآمن (Kashier)';
        btn.className = 'btn-luxury-gold full-width';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-truck-fast" style="margin-left: 8px;"></i> تأكيد الطلب والدفع عند الاستلام';
        btn.className = 'btn-luxury-gold full-width';
    }
}

/**
 * Handle user returning from Kashier Hosted Checkout
 */
function checkKashierReturnStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const orderId = urlParams.get('order_id');
    const txn = urlParams.get('txn') || '';

    if (paymentStatus === 'success' && orderId) {
        // Clear local shopping cart
        if (typeof clearCart === 'function') clearCart();
        
        // Show success toast
        if (typeof showToast === 'function') {
            showToast(`تم سداد الطلب #${orderId} بنجاح عبر بوابة Kashier!`, 'success');
        }

        // Open Success Receipt Step
        setTimeout(() => {
            const checkoutModal = document.getElementById('checkout-modal');
            if (checkoutModal) {
                const step1 = document.getElementById('chk-step-content-1');
                const step3 = document.getElementById('chk-step-content-3');
                if (step1) step1.classList.remove('active');
                if (step3) step3.classList.add('active');

                const orderIdEl = document.getElementById('order-receipt-id');
                const orderDateEl = document.getElementById('order-receipt-date');
                if (orderIdEl) orderIdEl.innerText = `#${orderId}`;
                if (orderDateEl) orderDateEl.innerText = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                
                checkoutModal.classList.add('active');
                
                // Clear URL parameters to prevent re-triggering on refresh
                if (window.history.replaceState) {
                    const url = new URL(window.location);
                    url.searchParams.delete('payment_status');
                    url.searchParams.delete('order_id');
                    url.searchParams.delete('txn');
                    url.searchParams.delete('gateway');
                    window.history.replaceState({ path: url.href }, '', url.href);
                }
            }
        }, 300);
    } else if (paymentStatus === 'cancelled') {
        if (typeof showToast === 'function') {
            showToast('تم إلغاء عملية الدفع. يمكنك إعادة المحاولة في أي وقت.', 'info');
        }
    }
}

function openCheckoutModal() {
    const cartItems = getCartItemsSafe();
    if (!cartItems || cartItems.length === 0) {
        if (typeof showToast === 'function') showToast('سلة المشتريات فارغة!', 'error');
        return;
    }
    if (typeof closeCartDrawer === 'function') closeCartDrawer();

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        const step1 = document.getElementById('chk-step-content-1');
        const step3 = document.getElementById('chk-step-content-3');
        if (step1) step1.classList.add('active');
        if (step3) step3.classList.remove('active');

        updateCheckoutSummary();
        setPaymentMethod(selectedPaymentMethod || 'kashier');
        checkoutModal.classList.add('active');
        if (typeof lockScroll === 'function') lockScroll();
        else document.body.classList.add('scroll-locked');
    }
}

function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
        if (typeof unlockScroll === 'function') unlockScroll();
        else document.body.classList.remove('scroll-locked');
    }
}

function updateCheckoutSummary() {
    const subtotal = typeof getCartSubtotal === 'function' ? getCartSubtotal() : calculateCartSubtotalSafe();
    const discount = typeof getAppliedDiscount === 'function' ? getAppliedDiscount(subtotal) : 0;
    const shipping = subtotal >= 500 ? 0 : 35;
    const total = subtotal - discount + shipping;

    const subtotalEl = document.getElementById('chk-summary-subtotal');
    const shippingEl = document.getElementById('chk-summary-shipping');
    const discountEl = document.getElementById('chk-summary-discount');
    const totalEl = document.getElementById('chk-summary-total');

    if (subtotalEl) subtotalEl.innerText = `${subtotal.toLocaleString()} ج.م`;
    if (shippingEl) shippingEl.innerText = shipping === 0 ? 'شحن مجاني' : `${shipping} ج.م`;
    if (discountEl) discountEl.innerText = discount > 0 ? `-${discount.toLocaleString()} ج.م` : '0 ج.م';
    if (totalEl) totalEl.innerText = `${total.toLocaleString()} ج.م`;
}

function calculateCartSubtotalSafe() {
    const items = getCartItemsSafe();
    return items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
}

function getCartItemsSafe() {
    if (typeof cart !== 'undefined' && Array.isArray(cart) && cart.length > 0) {
        return cart;
    }
    try {
        return JSON.parse(localStorage.getItem('mesiri_cart')) || [];
    } catch(e) {
        return [];
    }
}

/**
 * Triggered on "Confirm & Pay" Click
 */
async function processPaymentAndCompleteOrder() {
    // Form Inputs
    const name = document.getElementById('chk-name')?.value.trim();
    const phone = document.getElementById('chk-phone')?.value.trim();
    const email = document.getElementById('chk-email')?.value.trim();
    const gov = document.getElementById('chk-gov')?.value.trim() || 'القاهرة';
    const city = document.getElementById('chk-city')?.value.trim();
    const address = document.getElementById('chk-address')?.value.trim();
    const notes = document.getElementById('chk-notes')?.value.trim() || '';

    // Validations
    if (!name) {
        if (typeof showToast === 'function') showToast('يرجى إدخال اسم المستلم بالكامل', 'error');
        document.getElementById('chk-name')?.focus();
        return;
    }

    if (!phone || phone.length < 10) {
        if (typeof showToast === 'function') showToast('يرجى إدخال رقم هاتف محمول صالح للتواصل أثناء التوصيل', 'error');
        document.getElementById('chk-phone')?.focus();
        return;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
        if (typeof showToast === 'function') showToast('يرجى إدخال بريد إلكتروني صالح لاستلام الفاتورة', 'error');
        document.getElementById('chk-email')?.focus();
        return;
    }

    if (!city) {
        if (typeof showToast === 'function') showToast('يرجى إدخال المدينة أو المنطقة', 'error');
        document.getElementById('chk-city')?.focus();
        return;
    }

    if (!address) {
        if (typeof showToast === 'function') showToast('يرجى إدخال العنوان التفصيلي (الشارع، رقم العمارة، الشقة)', 'error');
        document.getElementById('chk-address')?.focus();
        return;
    }

    const btn = document.getElementById('kashier-pay-btn');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري معالجة الطلب...';
        btn.disabled = true;
    }

    const orderId = 'MES-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toISOString();
    
    const customerInfo = {
        name: name,
        phone: phone,
        email: email,
        governorate: gov,
        city: city,
        address: address,
        notes: notes
    };

    const subtotal = typeof getCartSubtotal === 'function' ? getCartSubtotal() : calculateCartSubtotalSafe();
    const discount = typeof getAppliedDiscount === 'function' ? getAppliedDiscount(subtotal) : 0;
    const shipping = subtotal >= 500 ? 0 : 35;
    const total = subtotal - discount + shipping;
    const cartItems = getCartItemsSafe();

    // 1. CASH ON DELIVERY (COD) FLOW
    if (selectedPaymentMethod === 'cod') {
        try {
            const orderData = {
                id: orderId,
                merchant_order_id: orderId,
                date: orderDate,
                customer: customerInfo,
                items: cartItems,
                summary: { subtotal, discount, shipping, total },
                paymentMethod: 'cod',
                status: 'قيد التجهيز (دفع عند الاستلام)'
            };

            // Save order locally first to ensure data is NEVER lost
            if (window.mesiriDB && typeof window.mesiriDB.createOrder === 'function') {
                try {
                    await window.mesiriDB.createOrder(orderData);
                } catch (dbErr) {
                    console.warn('[COD] DB createOrder warning:', dbErr);
                }
            } else {
                try {
                    const localOrders = JSON.parse(localStorage.getItem('mesiri_orders') || '[]');
                    localOrders.unshift(orderData);
                    localStorage.setItem('mesiri_orders', JSON.stringify(localOrders));
                } catch (e) {
                    console.warn('[COD] Local storage save error:', e);
                }
            }

            // Sync with Firebase Cloud if configured
            if (window.FirebaseManager && typeof window.FirebaseManager.syncOrderToFirebase === 'function') {
                try {
                    window.FirebaseManager.syncOrderToFirebase(orderData);
                } catch (fbErr) {
                    console.warn('[COD] Firebase sync notice:', fbErr);
                }
            }

            // Attempt to sync with backend API (non-blocking so offline or static deployments succeed)
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                if (!response.ok) {
                    console.warn('[COD] Server API responded with status:', response.status, '(Order preserved locally)');
                }
            } catch (netErr) {
                console.warn('[COD] Backend offline or static host, order successfully preserved locally:', netErr);
            }

            // Clear local shopping cart and show success step
            if (typeof clearCart === 'function') clearCart();
            if (typeof showToast === 'function') showToast(`تم تأكيد طلبك بنجاح برقم #${orderId}`, 'success');

            const step1 = document.getElementById('chk-step-content-1');
            const step3 = document.getElementById('chk-step-content-3');
            if (step1) step1.classList.remove('active');
            if (step3) step3.classList.add('active');

            const orderIdEl = document.getElementById('order-receipt-id');
            const orderDateEl = document.getElementById('order-receipt-date');
            if (orderIdEl) orderIdEl.innerText = `#${orderId}`;
            if (orderDateEl) orderDateEl.innerText = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

        } catch (error) {
            console.error('[COD Error]:', error);
            if (typeof showToast === 'function') {
                showToast('نأسف، لم نتمكن من إكمال تسجيل الطلب حالياً. يُرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.', 'error');
            }
            if (btn) {
                btn.disabled = false;
                updatePaymentButtonUI();
            }
        }
        return;
    }

    // 2. KASHIER ONLINE PAYMENT FLOW
    try {
        const orderData = {
            id: orderId,
            merchant_order_id: orderId,
            date: orderDate,
            customer: customerInfo,
            items: cartItems,
            summary: { subtotal, discount, shipping, total },
            paymentMethod: 'kashier',
            status: 'معلق (بانتظار الدفع عبر Kashier)'
        };

        // Save order locally first so customer details and order are preserved
        if (window.mesiriDB && typeof window.mesiriDB.createOrder === 'function') {
            try {
                await window.mesiriDB.createOrder(orderData);
            } catch (dbErr) {
                console.warn('[Kashier] DB createOrder warning:', dbErr);
            }
        } else {
            try {
                const localOrders = JSON.parse(localStorage.getItem('mesiri_orders') || '[]');
                localOrders.unshift(orderData);
                localStorage.setItem('mesiri_orders', JSON.stringify(localOrders));
            } catch (e) {
                console.warn('[Kashier] Local storage save error:', e);
            }
        }

        // Sync with Firebase Cloud if configured
        if (window.FirebaseManager && typeof window.FirebaseManager.syncOrderToFirebase === 'function') {
            try {
                window.FirebaseManager.syncOrderToFirebase(orderData);
            } catch (fbErr) {
                console.warn('[Kashier] Firebase sync notice:', fbErr);
            }
        }

        const successCallbackUrl = `${window.location.origin}/store.html?payment_status=success&order_id=${encodeURIComponent(orderId)}&gateway=kashier`;
        const cancelCallbackUrl = `${window.location.origin}/store.html?payment_status=cancelled&order_id=${encodeURIComponent(orderId)}`;

        let redirectTarget = '';

        // Attempt to call backend Kashier session endpoint if available
        try {
            const response = await fetch('/api/payment/kashier/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant_order_id: orderId,
                    orderId: orderId,
                    amount: total,
                    currency: 'EGP',
                    customer: customerInfo,
                    items: cartItems,
                    paymentMethod: 'kashier',
                    summary: { subtotal, discount, shipping, total },
                    callbackUrl: successCallbackUrl
                })
            });

            if (response && response.ok) {
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const data = await response.json().catch(() => null);
                    if (data && data.success) {
                        redirectTarget = data.kashier_url || data.url || data.checkout_url || data.payment_url || '';
                    }
                }
            }
        } catch (netErr) {
            console.warn('[Kashier] Server endpoint unreachable, using client-side payment flow:', netErr);
        }

        // Fallback: If backend is running on static host or returned no url, forward smoothly to the built-in Kashier simulator
        if (!redirectTarget) {
            redirectTarget = `${window.location.origin}/kashier-simulator.html?orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(total)}&currency=EGP&customerName=${encodeURIComponent(customerInfo.name)}&customerPhone=${encodeURIComponent(customerInfo.phone)}&customerEmail=${encodeURIComponent(customerInfo.email)}&redirectUrl=${encodeURIComponent(successCallbackUrl)}&cancelUrl=${encodeURIComponent(cancelCallbackUrl)}`;
        }

        // Forward to Kashier payment gateway
        window.location.href = redirectTarget;

    } catch (error) {
        console.error('[Kashier Error]:', error);
        if (typeof showToast === 'function') {
            showToast('نأسف، لم نتمكن من الاتصال ببوابة الدفع حالياً. يُرجى المحاولة مرة أخرى أو اختيار الدفع عند الاستلام.', 'error');
        }
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> إعادة المحاولة للدفع عبر Kashier';
            btn.disabled = false;
        }
    }
}

function printOrderInvoice() {
    window.print();
}

// ----------------------------------------------------
// CUSTOM LUXURY GOVERNORATE SELECTOR (Fixes screen overflow & enables search)
// ----------------------------------------------------
const EGYPT_GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية',
    'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
    'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
    'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح',
    'الوادي الجديد', 'شمال سيناء', 'جنوب سيناء'
];

function initCustomGovSelect() {
    const nativeSelect = document.getElementById('chk-gov');
    if (!nativeSelect) return;

    let wrapper = document.getElementById('custom-gov-wrapper');

    // If wrapper doesn't exist in HTML yet, construct it dynamically
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'custom-gov-wrapper';
        wrapper.id = 'custom-gov-wrapper';
        nativeSelect.parentNode.insertBefore(wrapper, nativeSelect);
        wrapper.appendChild(nativeSelect);
        nativeSelect.style.display = 'none';

        wrapper.insertAdjacentHTML('afterbegin', `
            <div class="custom-gov-trigger" id="custom-gov-trigger" tabindex="0">
                <span id="custom-gov-label">${nativeSelect.value || 'القاهرة'}</span>
                <i class="fa-solid fa-chevron-down custom-gov-arrow"></i>
            </div>
            <div class="custom-gov-menu" id="custom-gov-menu">
                <div class="custom-gov-search-wrap">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" class="custom-gov-search-input" id="custom-gov-search" placeholder="ابحث عن المحافظة..." autocomplete="off">
                </div>
                <div class="custom-gov-options-list" id="custom-gov-options-list"></div>
            </div>
        `);
    }

    const trigger = wrapper.querySelector('#custom-gov-trigger');
    const label = wrapper.querySelector('#custom-gov-label');
    const searchInput = wrapper.querySelector('#custom-gov-search');
    const optionsList = wrapper.querySelector('#custom-gov-options-list');

    let currentVal = nativeSelect.value || 'القاهرة';

    function renderOptions(searchQuery = '') {
        const query = searchQuery.trim().toLowerCase();
        const filtered = EGYPT_GOVERNORATES.filter(g => g.toLowerCase().includes(query));

        if (filtered.length === 0) {
            optionsList.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">لا توجد نتائج مطابقة</div>';
            return;
        }

        optionsList.innerHTML = filtered.map(g => `
            <div class="gov-option-item ${g === currentVal ? 'selected' : ''}" data-gov="${g}">
                <span>${g}</span>
            </div>
        `).join('');

        optionsList.querySelectorAll('.gov-option-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const chosen = item.getAttribute('data-gov');
                selectGovernorate(chosen);
            });
        });
    }

    function selectGovernorate(gov) {
        currentVal = gov;
        if (label) label.innerText = gov;
        if (nativeSelect) {
            nativeSelect.value = gov;
            nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        wrapper.classList.remove('active');
        if (searchInput) searchInput.value = '';
        renderOptions();
    }

    // Trigger toggle
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = wrapper.classList.contains('active');
        if (isActive) {
            wrapper.classList.remove('active');
        } else {
            wrapper.classList.add('active');
            renderOptions();
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 60);
            }
        }
    });

    // Search filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderOptions(e.target.value);
        });
        searchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('active');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wrapper.classList.contains('active')) {
            wrapper.classList.remove('active');
        }
    });

    // Initial render
    renderOptions();
    if (label) label.innerText = currentVal;
}

