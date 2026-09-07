/**
 * Contact & B2B Corporate Hub Interactivity
 * Handles Corporate Inquiries, Fast WhatsApp Dispatch, Department Routing, and Database Synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
    initCorporateContactForm();
});

// Factory WhatsApp Hotline Numbers & Coordinates
const FACTORY_CONTACT = {
    whatsapp: '201010645449', // Target WhatsApp Factory Line
    phone: '+201010645449',
    salesPhone: '+201000000000',
    email: 'b2b@almesiri-factory.com',
    locationName: 'المدينة الصناعية الثانية، العاشر من رمضان / القاهرة، مصر'
};

// Department WhatsApp Dispatcher
function contactDepartment(deptType) {
    let message = '';
    
    switch(deptType) {
        case 'wholesale':
            message = `مرحباً إدارة مبيعات مصنع زيرو ون (ZERO ONE) للملابس الداخلية،\nأود الاستفسار عن كشف أسعار الجملة، الخصومات التصاعدية، والحد الأدنى للطلبيات التجارية.`;
            break;
        case 'privatelabel':
            message = `مرحباً قسم البراند الخاص بمصنع زيرو ون (ZERO ONE)،\nأرغب في الاستفسار عن تصنيع تشكيلة ملابس داخلية بعلامتنا التجارية الخاصة (Private Label)، وطباعة وتطريز الشعار وخيارات التغليف الفاخر.`;
            break;
        case 'samples':
            message = `مرحباً قسم الجودة والعينات بمصنع زيرو ون (ZERO ONE)،\nأود طلب حقيبة عينات خامات وأقمشة قطنية للمعاينة قبل التعاقد على توريد كمية.`;
            break;
        case 'export':
            message = `مرحباً قسم التصدير واللوجستيات بمصنع زيرو ون (ZERO ONE)،\nأرغب في الاستفسار عن إمكانيات الشحن والتصدير الخارجي وتفاصيل بوالص الشحن الجوي والبحري.`;
            break;
        default:
            message = `مرحباً مصنع زيرو ون (ZERO ONE)، أود التواصل مع الإدارة بخصوص تعاقد تجاري.`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${FACTORY_CONTACT.whatsapp}&text=${encoded}`, '_blank');
}

// Direct Corporate Contact Form Initialization
function initCorporateContactForm() {
    const form = document.getElementById('b2b-contact-form');
    const submitBtn = document.getElementById('btn-submit-b2b-form');
    const waQuickBtn = document.getElementById('btn-wa-b2b-quick');

    if (!form) return;

    // Direct WhatsApp Dispatch from Form
    if (waQuickBtn) {
        waQuickBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dispatchFormViaWhatsApp();
        });
    }

    // Submit to Database & Admin Panel
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const company = document.getElementById('c-company').value.trim();
            const contactName = document.getElementById('c-name').value.trim();
            const phone = document.getElementById('c-phone').value.trim();
            const email = document.getElementById('c-email').value.trim();
            const businessType = document.getElementById('c-business-type').value;
            const category = document.getElementById('c-category').value;
            const qty = document.getElementById('c-qty').value;
            const requestType = document.getElementById('c-request-type').value;
            const notes = document.getElementById('c-notes').value.trim();

            if (!company || !contactName || !phone) {
                if (typeof showToast === 'function') {
                    showToast('يرجى ملء الحقول الأساسية (اسم المنشأة، المسؤول، ورقم الهاتف)', 'error');
                } else {
                    alert('يرجى ملء الحقول الأساسية');
                }
                return;
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تسجيل طلبكم...';

            const inquiryId = 'B2B-' + Math.floor(10000 + Math.random() * 90000);
            const inquiryData = {
                id: inquiryId,
                date: new Date().toISOString(),
                company: `${company} (${businessType})`,
                contactName: contactName,
                phone: phone,
                email: email,
                product: `[${requestType}] ${category}`,
                qty: qty,
                notes: notes,
                status: 'جديد'
            };

            try {
                if (typeof DB !== 'undefined' && DB.createRFQ) {
                    await DB.createRFQ(inquiryData);
                } else {
                    await fetch('/api/rfqs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(inquiryData)
                    });
                }
            } catch (err) {
                console.warn('Backend sync note:', err);
                // Save locally
                let rfqs = JSON.parse(localStorage.getItem('mesiri_rfqs')) || [];
                rfqs.push(inquiryData);
                localStorage.setItem('mesiri_rfqs', JSON.stringify(rfqs));
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;

            if (typeof showToast === 'function') {
                showToast(`تم استلام طلبكم بنجاح برقم مرجعي #${inquiryId}`, 'success');
            }

            form.reset();

            // Open Success Modal with direct WhatsApp option
            openCorporateSuccessModal(inquiryData);
        });
    }
}

// Generate & Dispatch WhatsApp message from current form inputs
function dispatchFormViaWhatsApp() {
    const company = document.getElementById('c-company')?.value.trim() || 'شركة تجارية';
    const contactName = document.getElementById('c-name')?.value.trim() || 'ممثل الشركة';
    const phone = document.getElementById('c-phone')?.value.trim() || '';
    const businessType = document.getElementById('c-business-type')?.value || 'نشاط تجاري';
    const category = document.getElementById('c-category')?.value || 'ملابس داخلية قطنية';
    const qty = document.getElementById('c-qty')?.value || '100+ قطعة';
    const requestType = document.getElementById('c-request-type')?.value || 'طلب تسعيرة';
    const notes = document.getElementById('c-notes')?.value.trim() || '';

    let text = `*طلب تواصل تجاري وعقد توريد - مصنع زيرو ون (ZERO ONE) للملابس الداخلية*\n`;
    text += `🏢 *المنشأة:* ${company}\n`;
    text += `👤 *المسؤول:* ${contactName}\n`;
    text += `📱 *رقم التواصل:* ${phone}\n`;
    text += `💼 *طبيعة النشاط:* ${businessType}\n`;
    text += `🎯 *نوع الطلب:* ${requestType}\n`;
    text += `📦 *المنتج المطلوب:* ${category}\n`;
    text += `🔢 *الكمية التقديرية:* ${qty}\n`;
    if (notes) {
        text += `📝 *ملاحظات خاصة:* ${notes}\n`;
    }
    text += `\nنرجو تزويدنا بكافة التفاصيل وعروض الأسعار في أقرب وقت.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=${FACTORY_CONTACT.whatsapp}&text=${encoded}`, '_blank');
}

// Success Modal for B2B Form
function openCorporateSuccessModal(data) {
    const existingModal = document.getElementById('b2b-success-modal');
    if (existingModal) existingModal.remove();

    let waMessage = `مرحباً مصنع زيرو ون (ZERO ONE) للملابس الداخلية،\nلقد قمت بإرسال طلب توريد تجاري جديد عبر الموقع برقم مرجعي: ${data.id}.\nالمنشأة: ${data.company}\nالمسؤول: ${data.contactName}\nالطلب: ${data.product} (${data.qty})`;
    const encoded = encodeURIComponent(waMessage);

    const modalHTML = `
        <div class="modal-overlay active" id="b2b-success-modal" style="position:fixed;inset:0;background:rgba(11,15,25,0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;">
            <div class="modal-content-box" style="background:var(--bg-surface);border:1px solid var(--border-gold);border-radius:var(--radius-xl);max-width:560px;width:100%;padding:36px;text-align:center;box-shadow:var(--shadow-lg);">
                <div style="width:72px;height:72px;border-radius:50%;background:rgba(16,185,129,0.15);border:2px solid var(--color-success);color:var(--color-success);display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 20px auto;">
                    <i class="fa-solid fa-check-double"></i>
                </div>
                <h3 style="font-size:1.45rem;font-weight:800;margin-bottom:8px;color:var(--text-primary);">تم استلام طلبكم وتسجيله بنجاح</h3>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:20px;">
                    رقم الطلب المرجعي: <strong style="color:var(--accent-gold);font-family:monospace;">#${data.id}</strong>
                </p>
                <div style="background:var(--bg-surface-elevated);border-radius:var(--radius-md);padding:18px;text-align:right;margin-bottom:24px;font-size:0.88rem;line-height:1.8;border:1px solid var(--border-subtle);">
                    <div>🏢 <strong>المنشأة:</strong> ${data.company}</div>
                    <div>👤 <strong>المسؤول:</strong> ${data.contactName}</div>
                    <div>📞 <strong>رقم الهاتف:</strong> ${data.phone}</div>
                    <div>📦 <strong>الطلب:</strong> ${data.product} (${data.qty})</div>
                </div>
                <div style="display:flex;gap:12px;flex-direction:column;">
                    <button class="btn-whatsapp-direct" style="width:100%;" onclick="window.open('https://api.whatsapp.com/send?phone=${FACTORY_CONTACT.whatsapp}&text=${encoded}', '_blank')">
                        <i class="fa-brands fa-whatsapp"></i> فتح المحادثة الفورية عبر واتساب لتأكيد الطلب
                    </button>
                    <button class="btn-luxury-outline" style="width:100%;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);color:var(--text-secondary);font-weight:700;" onclick="document.getElementById('b2b-success-modal').remove(); if(typeof unlockScroll==='function') unlockScroll();">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (typeof lockScroll === 'function') lockScroll();
}

// Copy Text to Clipboard Helper
function copyTextToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
            showToast(`تم نسخ ${label} إلى الحافظة بنجاح`, 'info');
        } else {
            alert(`تم نسخ ${label}`);
        }
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (typeof showToast === 'function') {
            showToast(`تم نسخ ${label} إلى الحافظة بنجاح`, 'info');
        }
    });
}
