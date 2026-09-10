/**
 * Main Application Logic & Store Controller
 * Manages B2C Store, Quick View, Cart, Wishlist, Currency, & UI Interactions
 */

// Clean up any legacy persistent localStorage carts so old stuck items are wiped
try {
    localStorage.removeItem('safwa_cart');
    localStorage.removeItem('mesiri_cart');
    localStorage.removeItem('zerone_cart');
} catch (e) {}

// Use sessionStorage for cart so it persists during page refresh (F5),
// but gets completely cleared whenever the user leaves or closes the site session
const CART_STORAGE_KEY = 'zerone_cart_session';
let cart = [];
try {
    const rawCart = sessionStorage.getItem(CART_STORAGE_KEY);
    cart = rawCart ? JSON.parse(rawCart) : [];
    if (!Array.isArray(cart)) cart = [];
} catch (e) {
    cart = [];
}
let wishlist = JSON.parse(localStorage.getItem('safwa_wishlist')) || [];
let activeCoupon = null;
let selectedModalProduct = null;
let selectedColor = null;
let selectedSize = null;
let selectedQty = 1;

function getCartItems() {
    return cart;
}

// Store Filter State
let currentCategory = 'all';
let currentSearchQuery = '';
let currentSortBy = 'default';

// ----------------------------------------------------
// SMART ARABIC SEARCH ENGINE & NORMALIZATION
// ----------------------------------------------------
function normalizeArabicText(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        // Strip harakat / diacritics
        .replace(/[\u064B-\u065F\u0670]/g, '')
        // Normalize Alef variants (أ, إ, آ, ٱ) -> ا
        .replace(/[أإآٱ]/g, 'ا')
        // Normalize Taa Marbuta & Haa -> ه
        .replace(/ة/g, 'ه')
        // Normalize Yaa variants (ى, ئ) -> ي
        .replace(/[ىئ]/g, 'ي')
        // Normalize Waw variants -> و
        .replace(/ؤ/g, 'و')
        // Remove Tatweel (Kashida)
        .replace(/ـ/g, '')
        // Clean special chars
        .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

// Egyptian & Arabic colloquial clothing synonyms dictionary
const SEARCH_SYNONYMS = {
    'بكم': ['قميص', 'اكمام', 'باكمام', 'طويل', 'بليزر'],
    'كم': ['قميص', 'اكمام', 'باكمام'],
    'اكمام': ['قميص', 'بكم', 'باكمام', 'بليزر'],
    'باكمام': ['قميص', 'بكم', 'اكمام', 'بليزر'],
    'طويل': ['اكمام', 'بكم', 'قميص', 'بليزر'],
    'نص': ['بولو', 'تيشيرت', 'تيشرت', 'صيفي'],
    'نصف': ['بولو', 'تيشيرت', 'تيشرت', 'صيفي'],
    'نص كم': ['بولو', 'تيشيرت', 'تيشرت'],
    'نصف كم': ['بولو', 'تيشيرت', 'تيشرت'],
    'تيشرت': ['بولو', 'تيشيرت', 'تشرت'],
    'تيشيرت': ['بولو', 'تيشرت', 'تشرت'],
    'تشرت': ['بولو', 'تيشرت', 'تيشيرت'],
    'بولو': ['تيشرت', 'تيشيرت', 'polo'],
    'قميص': ['كتان', 'بكم'],
    'قمصان': ['قميص', 'كتان', 'بكم'],
    'بنطلون': ['تشينو', 'جينز', 'شينو'],
    'بناطيل': ['بنطلون', 'تشينو', 'جينز'],
    'جينز': ['بنطلون', 'تشينو'],
    'جينس': ['بنطلون', 'تشينو'],
    'تشينو': ['بنطلون'],
    'شينو': ['بنطلون', 'تشينو'],
    'بليزر': ['جاكيت', 'بدله', 'بدلة'],
    'جاكيت': ['بليزر', 'بدله'],
    'جاكت': ['بليزر', 'بدله'],
    'بدله': ['بليزر'],
    'بدلة': ['بليزر'],
    'كاجوال': ['تيشرت', 'قميص', 'بنطلون', 'بليزر'],
    'شيك': ['فاخر', 'كاجوال'],
    'اسود': ['سودا', 'بلاك', 'black'],
    'سودا': ['اسود', 'black'],
    'ابيض': ['بيضا', 'عاجي', 'white'],
    'بيضا': ['ابيض', 'white'],
    'بيج': ['رملي', 'كافيه', 'beige'],
    'رمادي': ['رصاصي', 'ميلانج', 'grey', 'gray'],
    'كحلي': ['ازرق', 'نافي', 'navy', 'blue'],
    'صيفي': ['تيشرت', 'بولو', 'كتان'],
    'شتوي': ['بليزر', 'جاكيت', 'صوف', 'بكم']
};

function matchesSmartSearch(product, rawQuery) {
    if (!rawQuery || !rawQuery.trim()) return true;
    
    const corpusWords = [
        product.name,
        product.categoryName,
        product.fabric,
        ...(product.searchKeywords || []),
        ...(product.colors ? product.colors.map(c => c.name) : [])
    ].map(normalizeArabicText);

    const normCorpus = ' ' + corpusWords.join(' ') + ' ';
    const normQuery = normalizeArabicText(rawQuery);

    if (normCorpus.includes(' ' + normQuery + ' ')) return true;
    if (normQuery.length >= 4 && normCorpus.includes(normQuery)) return true;

    const queryTokens = normQuery.split(' ').filter(Boolean);
    return queryTokens.every(tok => {
        if (normCorpus.includes(' ' + tok + ' ')) return true;
        if (tok.length >= 4 && normCorpus.includes(tok)) return true;

        const syns = SEARCH_SYNONYMS[tok] || [];
        return syns.some(s => {
            const normS = normalizeArabicText(s);
            return normCorpus.includes(' ' + normS + ' ') || (normS.length >= 4 && normCorpus.includes(normS));
        });
    });
}

// ----------------------------------------------------
// APPLICATION BOOTSTRAP
// ----------------------------------------------------
async function startApp() {
    // Verify & update products from API if valid casual catalog
    if (typeof API !== 'undefined' && API.getProducts) {
        try {
            const dbProducts = await API.getProducts();
            if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
                if (!dbProducts.some(p => p.category === 'boxers' || p.category === 'briefs' || (p.id && p.id.includes('boxer')))) {
                    PRODUCTS_DATA = dbProducts;
                }
            }
        } catch(e) {}
    }

    // Fallback safety to window.PRODUCTS_DATA
    if (!PRODUCTS_DATA || !Array.isArray(PRODUCTS_DATA) || PRODUCTS_DATA.length < 4 || PRODUCTS_DATA.some(p => p.category === 'boxers')) {
        if (window.PRODUCTS_DATA && window.PRODUCTS_DATA.length >= 4) {
            PRODUCTS_DATA = window.PRODUCTS_DATA;
        }
    }

    initApp();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

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
// SCROLL LOCK
// Prevents background page scrolling when modal or drawer is open
// ----------------------------------------------------
function lockScroll() {
    document.body.classList.add('scroll-locked');
}

function unlockScroll() {
    const activeModals = document.querySelectorAll('.modal-overlay.active, .cart-drawer-overlay.active');
    if (!activeModals || activeModals.length === 0) {
        document.body.classList.remove('scroll-locked');
    }
}

window.lockScroll = lockScroll;
window.unlockScroll = unlockScroll;

// ----------------------------------------------------
// PRODUCT RENDERING, FILTERING & SORTING
// ----------------------------------------------------
function updateStoreBadges() {
    const catalog = (Array.isArray(PRODUCTS_DATA) && PRODUCTS_DATA.length >= 4) ? PRODUCTS_DATA : (window.PRODUCTS_DATA || []);
    const counts = {
        all: catalog.length,
        tshirts: catalog.filter(p => p.category === 'tshirts').length,
        shirts: catalog.filter(p => p.category === 'shirts').length,
        pants: catalog.filter(p => p.category === 'pants').length
    };

    Object.keys(counts).forEach(cat => {
        const badge = document.getElementById(`count-cat-${cat}`);
        if (badge) badge.textContent = counts[cat];
    });
}

function renderProducts(category, searchQuery, sortBy) {
    if (category !== undefined) currentCategory = category;
    if (searchQuery !== undefined) currentSearchQuery = searchQuery;
    if (sortBy !== undefined) currentSortBy = sortBy;

    const grid = document.getElementById('products-grid-container');
    if (!grid) return;

    updateStoreBadges();

    const catalog = (Array.isArray(PRODUCTS_DATA) && PRODUCTS_DATA.length >= 4) ? PRODUCTS_DATA : (window.PRODUCTS_DATA || []);

    let filtered = catalog.filter(p => {
        const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
        const matchesSearch = matchesSmartSearch(p, currentSearchQuery);
        return matchesCategory && matchesSearch;
    });

    // Sorting
    if (currentSortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating || (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    // Status Indicator & Reset Button
    const statusTextEl = document.getElementById('store-filter-status-text');
    const resetBtn = document.getElementById('reset-all-filters-btn');
    const hasActiveFilter = currentCategory !== 'all' || currentSearchQuery.trim().length > 0 || currentSortBy !== 'default';

    if (statusTextEl) {
        let catLabel = 'كل المنتجات';
        if (currentCategory === 'tshirts') catLabel = 'تيشرتات وبولو صيفي';
        if (currentCategory === 'shirts') catLabel = 'قمصان وتيشرتات بكم';
        if (currentCategory === 'pants') catLabel = 'بناطيل وجينز كاجوال';

        let desc = `عرض <strong>${catLabel}</strong> (${filtered.length} قطع كاجوال)`;
        if (currentSearchQuery.trim()) {
            desc += ` | البحث عن: "${currentSearchQuery.trim()}"`;
        }
        statusTextEl.innerHTML = `<i class="fa-solid fa-layer-group" style="color: var(--accent-gold); margin-left: 6px;"></i><span>${desc}</span>`;
    }

    if (resetBtn) {
        resetBtn.style.display = hasActiveFilter ? 'inline-flex' : 'none';
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <i class="fa-solid fa-shirt" style="font-size: 3rem; margin-bottom: 16px; display: block; color: var(--accent-gold);"></i>
                <p style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">مفيش منتجات مطابقة لبحثك في هذا القسم</p>
                <p style="font-size: 0.92rem; margin-bottom: 20px; line-height: 1.6;">جرب تبحث بكلمات تانية زي (بولو، قميص بكم، بنطلون، بليزر، كتان) أو اعرض كل المنتجات.</p>
                <button type="button" onclick="resetAllStoreFilters()" class="btn-luxury-primary" style="padding: 10px 24px; font-size: 0.9rem; margin: 0 auto; display: inline-flex; align-items: center; gap: 8px; border-radius: 8px; cursor: pointer;">
                    <i class="fa-solid fa-rotate-left"></i> إظهار كل تشكيلة الكاجوال (4 منتجات)
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const isWishlisted = wishlist.includes(product.id);
        const badgesList = (Array.isArray(product.badges) && product.badges.length > 0)
            ? product.badges
            : (product.badge ? [product.badge] : []);

        const getBadgeStyleClass = (b) => {
            if (/خصم|sale|تخفيض/i.test(b)) return 'badge-sale';
            if (/جديد|new|حديث/i.test(b)) return 'badge-new';
            return 'badge-gold';
        };

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-media">
                    <div class="product-badges-corner-container" style="position: absolute; top: 12px; right: 12px; z-index: 4; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; pointer-events: none;">
                        ${badgesList.map(b => `<span class="badge ${getBadgeStyleClass(b)}">${b}</span>`).join('')}
                    </div>
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

// ----------------------------------------------------
// STORE INTERACTIVE CONTROLLER HANDLERS
// ----------------------------------------------------
window.setStoreCategory = function(category, element) {
    currentCategory = category || 'all';

    const tabs = document.querySelectorAll('.cat-tab-btn');
    tabs.forEach(t => {
        if (t.getAttribute('data-cat') === currentCategory || (element && t === element)) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });

    renderProducts();
};
window.filterCategory = window.setStoreCategory;

window.handleStoreSearch = function(query) {
    currentSearchQuery = query || '';
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        clearBtn.style.display = currentSearchQuery.trim().length > 0 ? 'inline-block' : 'none';
    }
    renderProducts();
};

window.clearStoreSearch = function() {
    const input = document.getElementById('search-products-input');
    if (input) {
        input.value = '';
        input.focus();
    }
    handleStoreSearch('');
};

window.handleSortChange = function(sortBy) {
    currentSortBy = sortBy || 'default';
    const select = document.getElementById('sort-products-select');
    if (select && select.value !== currentSortBy) {
        select.value = currentSortBy;
    }
    renderProducts();
};

window.resetAllStoreFilters = function() {
    currentCategory = 'all';
    currentSearchQuery = '';
    currentSortBy = 'default';

    const input = document.getElementById('search-products-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    const select = document.getElementById('sort-products-select');
    if (select) select.value = 'default';

    const tabs = document.querySelectorAll('.cat-tab-btn');
    tabs.forEach(t => {
        if (t.getAttribute('data-cat') === 'all') t.classList.add('active');
        else t.classList.remove('active');
    });

    renderProducts();
};

function initFilterTabs() {
    const tabs = document.querySelectorAll('.cat-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-cat');
            setStoreCategory(category, tab);
        });
    });

    const sortSelect = document.getElementById('sort-products-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            handleSortChange(e.target.value);
        });
    }
}

function initLiveSearch() {
    const searchInput = document.getElementById('search-products-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        handleStoreSearch(e.target.value);
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
                <div style="display: flex; flex-wrap: wrap; gap: 6px; align-self: flex-start; margin-bottom: 6px;">
                    ${((Array.isArray(product.badges) && product.badges.length > 0) ? product.badges : (product.badge ? [product.badge] : [])).map(b => {
                        const cls = (/خصم|sale|تخفيض/i.test(b)) ? 'badge-sale' : ((/جديد|new|حديث/i.test(b)) ? 'badge-new' : 'badge-gold');
                        return `<span class="badge ${cls}">${b}</span>`;
                    }).join('')}
                </div>
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
    lockScroll();
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.classList.remove('active');
    unlockScroll();
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
    try {
        sessionStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
    saveCart();
    updateCartUI();
}

function saveCart() {
    try {
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
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
    lockScroll();
}

function closeCartDrawer() {
    const drawerOverlay = document.getElementById('cart-drawer-overlay');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    unlockScroll();
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
    const existing = document.getElementById('size-guide-modal');
    if (existing) existing.remove();

    const modalHTML = `
        <div class="modal-overlay active" id="size-guide-modal" onclick="if(event.target===this){document.getElementById('size-guide-modal').remove(); unlockScroll();}">
            <div class="modal-content-box" style="max-width: 650px; padding: 24px;">
                <button class="modal-close-btn" onclick="document.getElementById('size-guide-modal').remove(); unlockScroll();">
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
    lockScroll();
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
