/**
 * B2B Wholesale & Corporate Portal Functionality
 * Manages Tiered Pricing Calculator & Advanced RFQ Form with WhatsApp dispatch
 */

document.addEventListener('DOMContentLoaded', () => {
    initB2BCalculator();
    initRFQForm();
});

// Initialize B2B Bulk Cost Calculator
function initB2BCalculator() {
    const productSelect = document.getElementById('rfq-product');
    const qtyInput = document.getElementById('rfq-qty');
    const moqNotice = document.getElementById('b2b-moq-notice');
    const unitPriceEl = document.getElementById('b2b-unit-price');
    const discountTierEl = document.getElementById('b2b-discount-tier');
    const totalPriceEl = document.getElementById('b2b-total-price');
    const totalSavingsEl = document.getElementById('b2b-total-savings');
    const leadTimeEl = document.getElementById('b2b-lead-time');

    if (!productSelect || !qtyInput) return;

    // Populate B2B Products Dropdown
    productSelect.innerHTML = `
        <option value="all">تشكيلة منوعة / خط إنتاج مخصص</option>
        ${PRODUCTS_DATA.map(p => `<option value="${p.id}">${p.name} (الحد الأدنى: ${p.b2b.moq} قطعة)</option>`).join('')}
    `;

    function updateCalculator() {
        const selectedId = productSelect.value;
        const product = PRODUCTS_DATA.find(p => p.id === selectedId);

        if (!product) {
            // Handle 'all' option
            qtyInput.min = 1;
            if (moqNotice) moqNotice.innerText = '';
            if (unitPriceEl) unitPriceEl.innerText = '-';
            if (discountTierEl) discountTierEl.innerText = '-';
            if (totalPriceEl) totalPriceEl.innerText = 'يتم تحديده بواسطة المبيعات';
            if (totalSavingsEl) totalSavingsEl.innerText = '';
            if (leadTimeEl) leadTimeEl.innerText = 'حسب المواصفات';
            return;
        }

        qtyInput.min = product.b2b.moq;
        let qty = parseInt(qtyInput.value) || 0;

        // If they enter nothing or 0, just use 0 for display, the browser validation will catch it on submit
        if (qty < 0) qty = 0;

        // Find applicable tier
        let activeTier = product.b2b.tiers[0];
        for (const tier of product.b2b.tiers) {
            if (qty >= tier.min) {
                activeTier = tier;
            }
        }

        const b2bUnitPrice = activeTier.price;
        const retailUnitPrice = product.price;
        const totalB2B = b2bUnitPrice * qty;
        const totalRetail = retailUnitPrice * qty;
        const totalSavings = totalRetail - totalB2B;

        // We use EGP (CURRENCY)
        if (moqNotice) moqNotice.innerText = `الحد الأدنى لطلب هذا المنتج: ${product.b2b.moq} قطعة`;
        if (unitPriceEl) unitPriceEl.innerText = `${b2bUnitPrice.toLocaleString()} ${CURRENCY.symbol}`;
        if (discountTierEl) discountTierEl.innerText = `خصم تجاري ${activeTier.discount}`;
        if (totalPriceEl) totalPriceEl.innerText = `${totalB2B.toLocaleString()} ${CURRENCY.symbol}`;
        if (totalSavingsEl) totalSavingsEl.innerText = `وفرت ${totalSavings.toLocaleString()} ${CURRENCY.symbol} مقارنة بسعر التجزئة`;
        if (leadTimeEl) leadTimeEl.innerText = product.b2b.productionTime;
    }

    productSelect.addEventListener('change', updateCalculator);
    qtyInput.addEventListener('input', updateCalculator);

    updateCalculator();
}

// Initialize RFQ Form & Direct WhatsApp Quotation
function initRFQForm() {
    const rfqForm = document.getElementById('b2b-rfq-form');
    const rfqProductSelect = document.getElementById('rfq-product');
    const whatsappRFQBtn = document.getElementById('btn-whatsapp-rfq');
    const submitBtn = document.getElementById('btn-submit-rfq-form');

    if (rfqForm && submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            if (!rfqForm.checkValidity()) {
                rfqForm.reportValidity();
                return;
            }
            e.preventDefault();

            const company = document.getElementById('rfq-company').value.trim();
            const contactName = document.getElementById('rfq-name').value.trim();
            const phone = document.getElementById('rfq-phone').value.trim();
            const email = document.getElementById('rfq-email').value.trim();

            let product = 'طلب مخصص';
            if (rfqProductSelect) {
                const selectedObj = PRODUCTS_DATA.find(p => p.id === rfqProductSelect.value);
                product = selectedObj ? selectedObj.name : 'تشكيلة منوعة / خط إنتاج مخصص';
            }

            const qty = document.getElementById('rfq-qty').value;
            const notes = document.getElementById('rfq-notes').value.trim();

            if (!company || !contactName || !phone) {
                showToast('يرجى ملء جميع الحقول الإلزامية لطلب التسعيرة', 'error');
                return;
            }

            // Simulate form submission
            showToast('جاري إرسال طلب عرض السعر إلى إدارة المبيعات...', 'info');

            setTimeout(async () => {
                // Save RFQ to Database / LocalStorage
                const rfqId = 'RFQ-' + Math.floor(1000 + Math.random() * 9000);
                const rfqData = {
                    id: rfqId,
                    date: new Date().toISOString(),
                    company,
                    contactName,
                    phone,
                    email,
                    product,
                    qty,
                    notes,
                    status: 'جديد' // New
                };

                if (typeof DB !== 'undefined' && DB.createRFQ) {
                    try {
                        await DB.createRFQ(rfqData);
                    } catch (err) {
                        console.error('DB createRFQ error:', err);
                    }
                } else if (typeof API !== 'undefined' && API.createRFQ) {
                    try {
                        await API.createRFQ(rfqData);
                    } catch (err) {
                        console.error('API createRFQ error:', err);
                    }
                } else {
                    let rfqs = [];
                    try {
                        rfqs = JSON.parse(localStorage.getItem('mesiri_rfqs')) || [];
                    } catch (e) { }
                    rfqs.push(rfqData);
                    localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqs));
                }

                showToast('تم استلام طلبكم بنجاح وتسجيله في لوحة الإدارة! سيتواصل معكم المستشار التجاري قريباً.', 'success');
                rfqForm.reset();

                // Open Quote Confirmation Modal with WhatsApp Dispatch Option
                openQuoteSuccessModal({
                    company,
                    contactName,
                    phone,
                    email,
                    product,
                    qty,
                    notes
                });
            }, 1200);
        });
    }

    // Direct WhatsApp Button click handler
    if (whatsappRFQBtn) {
        whatsappRFQBtn.addEventListener('click', () => {
            dispatchWhatsAppRFQ();
        });
    }
}

function dispatchWhatsAppRFQ() {
    const company = document.getElementById('rfq-company')?.value.trim() || 'شركة تجارية';
    const contactName = document.getElementById('rfq-name')?.value.trim() || 'عميل جملة';
    const product = document.getElementById('rfq-product')?.value || 'ملابس داخلية رجالية';
    const qty = document.getElementById('rfq-qty')?.value || '100+ قطعة';

    const message = `مرحباً مصنع المسيري للملابس الداخلية،\nأنا ${contactName} من شركة: ${company}.\nأرغب في الاستفسار وطلب عرض سعر لكمية: ${qty} من: ${product}.\nيرجى تزويدي بالكتالوج التجاري والأسعار.`;

    const factoryWhatsAppNumber = '201010645449'; // Target WhatsApp Factory Line
    const encodedUrl = `https://api.whatsapp.com/send?phone=${factoryWhatsAppNumber}&text=${encodeURIComponent(message)}`;
    window.open(encodedUrl, '_blank');
}

function openQuoteSuccessModal(data) {
    const message = `مرحباً مصنع المسيري للملابس الداخلية،\nأنا ${data.contactName} من شركة: ${data.company}.\nأرغب في الاستفسار وطلب عرض سعر لكمية: ${data.qty} من: ${data.product}.\nيرجى تزويدي بالكتالوج التجاري والأسعار.`;
    const factoryWhatsAppNumber = '201010645449'; // Target WhatsApp Factory Line
    const encodedUrl = `https://api.whatsapp.com/send?phone=${factoryWhatsAppNumber}&text=${encodeURIComponent(message)}`;

    const modalHTML = `
        <div class="modal-overlay active" id="rfq-success-modal">
            <div class="modal-content-box" style="max-width: 550px; padding: 36px; text-align: center;">
                <div class="success-icon-box">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 10px; color: var(--text-primary);">تم تسجيل طلب عرض السعر بنجاح</h3>
                <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 24px;">
                    رقم الطلب التجاري: <strong style="color: var(--accent-gold);">#RFQ-${Math.floor(100000 + Math.random() * 900000)}</strong>
                </p>
                <div style="background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 18px; text-align: right; margin-bottom: 24px; font-size: 0.88rem; line-height: 1.8;">
                    <div>🏢 <strong>المنشأة:</strong> ${data.company}</div>
                    <div>👤 <strong>المسؤول:</strong> ${data.contactName}</div>
                    <div>📦 <strong>المنتج والكمية:</strong> ${data.product} (${data.qty} قطعة)</div>
                </div>
                <div style="display: flex; gap: 12px; flex-direction: column;">
                    <button class="btn-whatsapp-direct" onclick="window.open('${encodedUrl}', '_blank')">
                        <i class="fa-brands fa-whatsapp"></i> تأكيد الطلب فوراً عبر محادثة واتساب
                    </button>
                    <button class="btn-luxury-outline" onclick="document.getElementById('rfq-success-modal').remove(); if(typeof unlockScroll==='function') unlockScroll();">
                        إغلاق النافذة
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (typeof lockScroll === 'function') lockScroll();
}
