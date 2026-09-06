/**
 * Main Application Logic & Store Controller
 * Manages B2C Store, Quick View, Cart, Wishlist, Currency, & UI Interactions
 */

let cart = JSON.parse(localStorage.getItem('safwa_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('safwa_wishlist')) || [];
let activeCoupon = null;
let selectedModalProduct = null;
let selectedColor = null;
let selectedSize = null;
let selectedQty = 1;

function getCartItems() {
    return cart;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof API !== 'undefined' && API.getProducts) {
        try {
            const dbProducts = await API.getProducts();
            if (dbProducts && dbProducts.length > 0) {
                PRODUCTS_DATA = dbProducts;
            }
        } catch(e) {}
    }
    initApp();
});

function initApp() {
    renderProducts();
    updateCartUI();
    updateWishlistBadge();
    initCurrencySwitcher();
    initFilterTabs();
    initLiveSearch();
    initToastContainer();
}

// ----------------------------------------------------
// PRODUCT RENDERING & FILTERING
// ----------------------------------------------------
function renderProducts(category = 'all', searchQuery = '', sortBy = 'default') {
    const grid = document.getElementById('products-grid-container');
    if (!grid) return;

    let filtered = PRODUCTS_DATA.filter(p => {
        const matchesCategory = category === 'all' || p.category === category;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.fabric.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 16px; display: block;"></i>
                <p style="font-size: 1.1rem; font-weight: 600;">لا توجد منتجات مطابقة لخيارات البحث الحالية</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const isWishlisted = wishlist.includes(product.id);
        const badgeClass = product.badgeType === 'sale' ? 'badge-sale' : (product.badgeType === 'new' ? 'badge-new' : 'badge-gold');

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-media">
                    <span class="badge ${badgeClass} product-badge-corner">${product.badge}</span>
                    <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${product.id}')" title="إضافة للمفضلة">
                        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <button class="product-quick-view-btn" onclick="openQuickView('${product.id}')">
                        <i class="fa-solid fa-eye"></i> نظرة سريعة
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-meta-row">
                        <span class="product-category-tag">${product.categoryName}</span>
                        <div class="product-rating">
                            <i class="fa-solid fa-star"></i>
                            <span>${product.rating}</span>
                            <span style="color: var(--text-muted); font-size: 0.75rem;">(${product.reviewsCount})</span>
                        </div>
                    </div>
                    <h3 class="product-name" onclick="openQuickView('${product.id}')" style="cursor: pointer;">${product.name}</h3>
                    
                    <div class="product-swatches-preview">
                        ${product.colors.map(c => `
                            <span class="swatch-circle" style="background-color: ${c.hex};" title="${c.name}"></span>
                        `).join('')}
                    </div>

                    <div class="product-footer-row">
                        <div class="product-pricing">
                            <span class="current-price">${product.price} ${CURRENCY.symbol}</span>
                            ${product.originalPrice ? `<span class="original-price">${product.originalPrice} ${CURRENCY.symbol}</span>` : ''}
                        </div>
                        <button class="btn-add-cart-icon" onclick="openQuickView('${product.id}')" title="تحديد الخيارات والشراء">
                            <i class="fa-solid fa-bag-shopping"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function initFilterTabs() {
    const tabs = document.querySelectorAll('.cat-tab-btn');
    const sortSelect = document.getElementById('sort-products-select');
    const searchInput = document.getElementById('search-products-input');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-cat');
            renderProducts(category, searchInput?.value || '', sortSelect?.value || 'default');
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const activeTab = document.querySelector('.cat-tab-btn.active');
            const category = activeTab ? activeTab.getAttribute('data-cat') : 'all';
            renderProducts(category, searchInput?.value || '', sortSelect.value);
        });
    }
}

function initLiveSearch() {
    const searchInput = document.getElementById('search-products-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const activeTab = document.querySelector('.cat-tab-btn.active');
        const category = activeTab ? activeTab.getAttribute('data-cat') : 'all';
        const sortSelect = document.getElementById('sort-products-select');
        renderProducts(category, e.target.value, sortSelect?.value || 'default');
    });
}

// ----------------------------------------------------
// QUICK VIEW / PRODUCT DETAILS MODAL
// ----------------------------------------------------
function openQuickView(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    selectedModalProduct = product;
    selectedColor = product.colors[0];
    selectedSize = product.sizes[0];
    selectedQty = 1;

    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    const modalBody = document.getElementById('quick-view-body');
    modalBody.innerHTML = `
        <div class="quick-view-grid">
            <div class="qv-gallery">
                <div class="qv-main-img-box">
                    <img id="qv-active-img" src="${product.gallery[0]}" alt="${product.name}">
                </div>
                <div class="qv-thumbnails">
                    ${product.gallery.map((img, idx) => `
                        <div class="qv-thumb ${idx === 0 ? 'active' : ''}" onclick="switchQvImage('${img}', this)">
                            <img src="${img}" alt="معاينة ${idx + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="qv-details">
                <span class="badge badge-gold" style="align-self: flex-start;">${product.badge}</span>
                <h2 class="qv-title">${product.name}</h2>
                <div class="qv-price-row">
                    <span class="cur-price">${product.price} ${CURRENCY.symbol}</span>
                    ${product.originalPrice ? `<span class="old-price">${product.originalPrice} ${CURRENCY.symbol}</span>` : ''}
                </div>

                <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; background: var(--bg-surface-elevated); padding: 12px 16px; border-radius: var(--radius-md); border-right: 3px solid var(--accent-gold);">
                    <strong>الخامة:</strong> ${product.fabric}
                </div>

                <!-- Color Selectors -->
                <div class="qv-option-group">
                    <div class="qv-option-label">
                        <span>اللون: <strong id="qv-selected-color-name" style="color: var(--text-primary);">${product.colors[0].name}</strong></span>
                    </div>
                    <div class="color-swatches-list">
                        ${product.colors.map((c, i) => `
                            <div class="color-swatch-item ${i === 0 ? 'active' : ''}" onclick="selectModalColor('${c.name}', '${c.hex}', this)" title="${c.name}">
                                <span style="background-color: ${c.hex};"></span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Size Selectors -->
                <div class="qv-option-group">
                    <div class="qv-option-label">
                        <span>المقاس: <strong id="qv-selected-size-name" style="color: var(--text-primary);">${product.sizes[0]}</strong></span>
                        <span class="size-guide-link" onclick="openSizeGuideModal()"><i class="fa-solid fa-ruler-combined"></i> دليل المقاسات</span>
                    </div>
                    <div class="size-pills-list">
                        ${product.sizes.map((s, i) => `
                            <button class="size-pill-btn ${i === 0 ? 'active' : ''}" onclick="selectModalSize('${s}', this)">${s}</button>
                        `).join('')}
                    </div>
                </div>

                <!-- Qty & CTA -->
                <div class="qv-qty-cta-row">
                    <div class="qty-stepper">
                        <button class="qty-btn" onclick="updateModalQty(-1)"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-display" id="qv-qty-val">1</span>
                        <button class="qty-btn" onclick="updateModalQty(1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <button class="btn-luxury-gold btn-qv-add-cart" onclick="addModalProductToCart()">
                        <i class="fa-solid fa-bag-shopping"></i> إضافة إلى السلة
                    </button>
                </div>

                <div style="margin-top: 14px; font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 20px;">
                    <span><i class="fa-solid fa-shield-halved" style="color: var(--accent-gold);"></i> ضمان جودة المصنع</span>
                    <span><i class="fa-solid fa-truck-fast" style="color: var(--accent-gold);"></i> شحن سريع</span>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.classList.remove('active');
}

function switchQvImage(imgSrc, thumbEl) {
    const activeImg = document.getElementById('qv-active-img');
    if (activeImg) activeImg.src = imgSrc;
    document.querySelectorAll('.qv-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
}

function selectModalColor(name, hex, swatchEl) {
    selectedColor = { name, hex };
    const label = document.getElementById('qv-selected-color-name');
    if (label) label.innerText = name;
    document.querySelectorAll('.color-swatch-item').forEach(s => s.classList.remove('active'));
    if (swatchEl) swatchEl.classList.add('active');
}

function selectModalSize(size, btnEl) {
    selectedSize = size;
    const label = document.getElementById('qv-selected-size-name');
    if (label) label.innerText = size;
    document.querySelectorAll('.size-pill-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
}

function updateModalQty(change) {
    selectedQty = Math.max(1, selectedQty + change);
    const display = document.getElementById('qv-qty-val');
    if (display) display.innerText = selectedQty;
}

function addModalProductToCart() {
    if (!selectedModalProduct) return;

    addToCart(selectedModalProduct, selectedColor.name, selectedSize, selectedQty);
    closeQuickView();
    openCartDrawer();
}

// ----------------------------------------------------
// CART & DRAWER MANAGEMENT
// ----------------------------------------------------
function addToCart(product, colorName, size, qty = 1) {
    const cartItemId = `${product.id}-${colorName}-${size}`;
    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            cartItemId,
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            color: colorName,
            size: size,
            qty: qty
        });
    }

    saveCart();
    updateCartUI();
}

function updateCartItemQty(cartItemId, delta) {
    const index = cart.findIndex(item => item.cartItemId === cartItemId);
    if (index === -1) return;

    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
        showToast('تم حذف المنتج من السلة', 'info');
    }
    saveCart();
    updateCartUI();
}

function removeCartItem(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
    updateCartUI();
    showToast('تم حذف المنتج من السلة', 'info');
}

function clearCart() {
    cart = [];
    activeCoupon = null;
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('safwa_cart', JSON.stringify(cart));
}

function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getAppliedDiscount(subtotal) {
    if (!activeCoupon) return 0;
    return subtotal * activeCoupon.rate;
}

function updateCartUI() {
    const cartBadge = document.getElementById('nav-cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) cartBadge.innerText = totalItems;

    const cartListEl = document.getElementById('cart-drawer-items');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const discountEl = document.getElementById('cart-discount-val');
    const totalEl = document.getElementById('cart-total-val');

    const subtotal = getCartSubtotal();
    const discount = getAppliedDiscount(subtotal);
    const total = subtotal - discount;

    if (subtotalEl) subtotalEl.innerText = `${subtotal} ${CURRENCY.symbol}`;
    if (discountEl) discountEl.innerText = `-${discount} ${CURRENCY.symbol}`;
    if (totalEl) totalEl.innerText = `${total} ${CURRENCY.symbol}`;

    if (!cartListEl) return;

    if (cart.length === 0) {
        cartListEl.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-bag-shopping"></i>
                <h4>سلة المشتريات فارغة</h4>
                <p>تصفح التشكيلات الراقية وأضف ما يناسب ذوقك الرفيع</p>
            </div>
        `;
        return;
    }

    cartListEl.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div class="cart-item-thumb">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-variants">اللون: ${item.color} | المقاس: ${item.size}</div>
                <div class="cart-item-bottom">
                    <div class="qty-stepper" style="width: 90px; height: 32px;">
                        <button class="qty-btn" onclick="updateCartItemQty('${item.cartItemId}', -1)">-</button>
                        <span class="qty-display" style="font-size: 0.85rem;">${item.qty}</span>
                        <button class="qty-btn" onclick="updateCartItemQty('${item.cartItemId}', 1)">+</button>
                    </div>
                    <span class="cart-item-price">${(item.price * item.qty)} ${CURRENCY.symbol}</span>
                    <button class="cart-item-remove-btn" onclick="removeCartItem('${item.cartItemId}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openCartDrawer() {
    const drawerOverlay = document.getElementById('cart-drawer-overlay');
    if (drawerOverlay) drawerOverlay.classList.add('active');
}

function closeCartDrawer() {
    const drawerOverlay = document.getElementById('cart-drawer-overlay');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
}

function applyCouponCode() {
    const input = document.getElementById('cart-coupon-input');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (code === 'SAFWA10') {
        activeCoupon = { code: 'SAFWA10', rate: 0.10, label: 'خصم 10%' };
        showToast('تم تفعيل كوبون الخصم بنجاح (10%)!', 'success');
    } else if (code === 'EID2026') {
        activeCoupon = { code: 'EID2026', rate: 0.15, label: 'خصم 15%' };
        showToast('تم تفعيل كوبون العيد بنجاح (15%)!', 'success');
    } else {
        showToast('كود الخصم غير صالح أو منتهي الصلاحية', 'error');
        return;
    }
    updateCartUI();
}

// ----------------------------------------------------
// WISHLIST MANAGEMENT
// ----------------------------------------------------
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('تمت إزالة المنتج من قائمة المفضلة', 'info');
    } else {
        wishlist.push(productId);
        showToast('تمت إضافة المنتج إلى قائمة المفضلة ❤️', 'success');
    }
    localStorage.setItem('safwa_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    renderProducts();
}

function updateWishlistBadge() {
    const badge = document.getElementById('nav-wishlist-badge');
    if (badge) badge.innerText = wishlist.length;
}

// ----------------------------------------------------
// SIZE GUIDE MODAL
// ----------------------------------------------------
function openSizeGuideModal() {
    const modalHTML = `
        <div class="modal-overlay active" id="size-guide-modal">
            <div class="modal-content-box" style="max-width: 650px; padding: 24px;">
                <button class="modal-close-btn" onclick="document.getElementById('size-guide-modal').remove()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; color: var(--text-primary);">دليل المقاسات المعياري الإيطالي</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px;">جميع المقاسات مصممة بأعلى معايير الدقة بالسنتيمتر (CM)</p>
                <div style="overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 10px;">
                    <table style="width: 100%; min-width: 500px; border-collapse: collapse; text-align: center; font-size: 0.88rem; white-space: nowrap;">
                        <thead>
                            <tr style="background: var(--bg-surface-elevated); color: var(--text-gold); border-bottom: 2px solid var(--border-gold);">
                                <th style="padding: 12px 8px;">المقاس الدولي</th>
                                <th style="padding: 12px 8px;">المقاس الإيطالي</th>
                                <th style="padding: 12px 8px;">محيط الصدر (CM)</th>
                                <th style="padding: 12px 8px;">محيط الخصر (CM)</th>
                                <th style="padding: 12px 8px;">عرض الأكتاف (CM)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 12px 8px; font-weight: bold;">S</td><td>46</td><td>92-96</td><td>78-82</td><td>44</td></tr>
                            <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 12px 8px; font-weight: bold;">M</td><td>48</td><td>97-101</td><td>83-87</td><td>46</td></tr>
                            <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 12px 8px; font-weight: bold;">L</td><td>50</td><td>102-106</td><td>88-92</td><td>48</td></tr>
                            <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 12px 8px; font-weight: bold;">XL</td><td>52</td><td>107-111</td><td>93-97</td><td>50</td></tr>
                            <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 12px 8px; font-weight: bold;">2XL</td><td>54</td><td>112-117</td><td>98-103</td><td>52</td></tr>
                            <tr><td style="padding: 12px 8px; font-weight: bold;">3XL</td><td>56</td><td>118-124</td><td>104-110</td><td>54</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ----------------------------------------------------
// ----------------------------------------------------
// TOAST NOTIFICATIONS
// ----------------------------------------------------
function initToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info') {
    initToastContainer();
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}
