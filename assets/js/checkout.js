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
    // Listen for payment method card clicks
    const methodCards = document.querySelectorAll('.payment-option-card');
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            methodCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedPaymentMethod = card.getAttribute('data-method') || 'kashier';
            updatePaymentButtonUI();
        });
    });
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
        updatePaymentButtonUI();
        checkoutModal.classList.add('active');
    }
}

function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
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

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                // Sync with Firebase Cloud
                if (window.FirebaseManager) {
                    window.FirebaseManager.syncOrderToFirebase(orderData);
                }

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
            } else {
                throw new Error('فشل تسجيل الطلب في الخادم');
            }
        } catch (error) {
            console.error('COD Error:', error);
            if (typeof showToast === 'function') showToast(error.message || 'حدث خطأ أثناء حفظ الطلب', 'error');
            if (btn) {
                btn.disabled = false;
                updatePaymentButtonUI();
            }
        }
        return;
    }

    // 2. KASHIER ONLINE PAYMENT FLOW
    try {
        const response = await fetch('/api/payment/kashier/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                merchant_order_id: orderId,
                orderId: orderId,
                amount: total,
                currency: 'EGP',
                customer: customerInfo,
                items: cartItems,
                paymentMethod: 'kashier',
                summary: { subtotal, discount, shipping, total },
                callbackUrl: `${window.location.origin}/store.html?payment_status=success&order_id=${orderId}&gateway=kashier`
            })
        });

        const data = await response.json();
        const targetUrl = data.kashier_url || data.url || data.checkout_url || data.payment_url;

        if (data && data.success && targetUrl) {
            // Direct Redirect to Kashier Hosted Checkout (or Test Simulator)
            window.location.href = targetUrl;
        } else {
            throw new Error(data.error || data.message || 'فشل الاتصال ببوابة Kashier');
        }
    } catch (error) {
        console.error('[Kashier Error]:', error);
        if (typeof showToast === 'function') {
            showToast(error.message || 'فشل الاتصال بالخادم، يرجى المحاولة لاحقاً', 'error');
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
