/**
 * ZERO ONE (01) - Luxury Men's Casual Wear Products Data & Configuration
 * Supports B2C Retail & B2B Wholesale Specifications
 */

// We only use Egyptian Pound (EGP) as requested.
const CURRENCY = { symbol: 'ج.م', name: 'جنيه مصري' };

let PRODUCTS_DATA = [
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
            'أزرار صدفية متينة وخياطة مزدوجة ناعمة عند الأكتاف لمتانة قصوى',
            'معالج ضد الانكماش وتغير الألوان بعد تكرار الغسيل'
        ],
        careInstructions: 'غسيل آلي بماء بارد، الكي بحرارة معتدلة، تجنب المبيضات',
        b2b: {
            moq: 100,
            tiers: [
                { min: 100, max: 499, price: 210, discount: '46%' },
                { min: 500, max: 999, price: 180, discount: '53%' },
                { min: 1000, max: 5000, price: 155, discount: '60%' }
            ],
            productionTime: '7 - 12 يوم عمل',
            customizationOptions: ['تطريز شعار البراند', 'ألوان مخصصة بالطلب', 'تغليف خاص بالبراند (Private Label)']
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
        fabric: 'مزيج الكتان الطبيعي الفاخر مع القطن المصري للتهوية القصوى والانسيابية',
        details: [
            'أكمام طويلة أنيقة مع إمكانية طيها بسهولة بستايل كاجوال عصري',
            'ياقة فرنسية كاجوال مريحة تناسب الإطلالات المفتوحة والمغلقة',
            'نسيج خفيف يمنحك الانتعاش طوال اليوم مع مقاومة التجعد',
            'أزرار طبيعية متينة وتطريز دقيق عند الحواف والياقة'
        ],
        careInstructions: 'غسيل خفيف بالماء البارد، الكي بالبخار',
        b2b: {
            moq: 100,
            tiers: [
                { min: 100, max: 499, price: 290, discount: '46%' },
                { min: 500, max: 999, price: 250, discount: '53%' },
                { min: 1000, max: 5000, price: 220, discount: '59%' }
            ],
            productionTime: '10 - 15 يوم عمل',
            customizationOptions: ['طباعة أو تطريز العلامة التجارية', 'تعديل تصميم الياقة والأساور']
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
            'سحاب ومعدات إغلاق يابانية الصنع عالية التحمل ومقاومة للتآكل',
            'ثبات كامل للألوان ضد الغسيل المتكرر دون أي انكماش'
        ],
        careInstructions: 'غسيل مقلوباً في الغسالة بماء بارد، الكي بحرارة متوسطة',
        b2b: {
            moq: 100,
            tiers: [
                { min: 100, max: 499, price: 260, discount: '45%' },
                { min: 500, max: 999, price: 225, discount: '53%' },
                { min: 1000, max: 5000, price: 195, discount: '59%' }
            ],
            productionTime: '10 - 15 يوم عمل',
            customizationOptions: ['علامة جلدية مخصصة على الخصر', 'ألوان وغسلات حسب الطلب']
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
            'جيوب رقعة خارجية وخياطة دقيقة وتشطيب إيطالي فاخر',
            'أكتاف طبيعية غير مبطنة لمرونة وحرية تامة في الارتداء'
        ],
        careInstructions: 'تنظيف جاف فقط (Dry Clean)',
        b2b: {
            moq: 50,
            tiers: [
                { min: 50, max: 199, price: 490, discount: '42%' },
                { min: 200, max: 499, price: 420, discount: '50%' },
                { min: 500, max: 2000, price: 360, discount: '57%' }
            ],
            productionTime: '12 - 18 يوم عمل',
            customizationOptions: ['أزرار مخصصة بشعارك', 'بطانة داخلية مخصصة للبراند']
        }
    }
];

// Factory Capacity and Highlights
const FACTORY_STATS = [
    { value: '1.2M+', label: 'قطعة ملابس كاجوال سنوياً', icon: 'fa-industry' },
    { value: '100%', label: 'قطن مصري ممتاز', icon: 'fa-leaf' },
    { value: '30+', label: 'عاماً من التميز والصناعة', icon: 'fa-award' },
    { value: 'ISO', label: 'معايير الجودة العالمية', icon: 'fa-shield-halved' }
];

// Factory Capabilities Showcase
const FACTORY_CAPABILITIES = [
    {
        title: 'غزل وحياكة أرقى الأقمشة',
        desc: 'نستخدم أفضل تقنيات غزل القطن والكتان لإنتاج ملابس كاجوال ناعمة، مسامية، ومتينة تتحمل الاستخدام اليومي والأناقة العصرية.',
        icon: 'fa-fan',
        tag: 'خامات طبيعية'
    },
    {
        title: 'قص وتفصيل آلي عالي الدقة',
        desc: 'خطوط قص محوسبة لضمان دقة المقاسات وثباتها في كافة القطع دون أي هدر في القماش.',
        icon: 'fa-scissors',
        tag: 'تقنية حديثة'
    },
    {
        title: 'مراقبة الجودة والتشطيب (QC)',
        desc: 'تخضع كل قطعة للفحص الدقيق للغرز، متانة الأزرار، وثبات الألوان لتوفير أقصى درجات الأناقة والراحة.',
        icon: 'fa-check-double',
        tag: 'جودة لا تضاهى'
    },
    {
        title: 'تصنيع لحساب الغير (B2B)',
        desc: 'نصنع الملابس الكاجوال للعلامات التجارية الكبرى بدءاً من التصميم وحتى التغليف بأكياس وعلب تحمل شعارك.',
        icon: 'fa-tags',
        tag: 'للشركات والمتاجر'
    }
];

// --- Database Simulation for Admin Panel ---
// Initialize or load products from localStorage with automatic migration for casual wear
const CASUAL_DB_VERSION = 'v2_casual_wear';
const currentVersion = localStorage.getItem('mesiri_db_version');

if (!localStorage.getItem('mesiri_products') || currentVersion !== CASUAL_DB_VERSION) {
    localStorage.setItem('mesiri_products', JSON.stringify(PRODUCTS_DATA));
    localStorage.setItem('mesiri_db_version', CASUAL_DB_VERSION);
} else {
    try {
        const stored = JSON.parse(localStorage.getItem('mesiri_products'));
        if (Array.isArray(stored) && stored.some(p => p.category === 'boxers' || p.category === 'briefs' || (p.id && p.id.includes('boxer')))) {
            localStorage.setItem('mesiri_products', JSON.stringify(PRODUCTS_DATA));
        } else if (Array.isArray(stored) && stored.length > 0) {
            PRODUCTS_DATA = stored;
        }
    } catch (e) {
        console.error("Failed to parse products from local storage", e);
    }
}

// Initialize empty orders/RFQs if not exist
if (!localStorage.getItem('mesiri_orders')) {
    localStorage.setItem('mesiri_orders', JSON.stringify([]));
}
if (!localStorage.getItem('mesiri_rfqs')) {
    localStorage.setItem('mesiri_rfqs', JSON.stringify([]));
}

