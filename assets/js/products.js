/**
 * Al-Mesiri Innerwear Factory - Products Data & Configuration
 * Supports B2C Retail & B2B Wholesale Specifications
 */

// We only use Egyptian Pound (EGP) as requested.
const CURRENCY = { symbol: 'ج.م', name: 'جنيه مصري' };

let PRODUCTS_DATA = [
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
        fabric: '95% قطن مصري ممشط (Combed Cotton) + 5% إيلاستين لمرونة استثنائية',
        details: [
            'حزام خصر مرن ومريح لا يترك علامات على الجلد',
            'تصميم داعم ومانع للاحتكاك للاستخدام اليومي المريح',
            'نسيج يسمح بالتهوية ويمتص الرطوبة بكفاءة عالية',
            'معالج ضد الانكماش والبهتان بعد الغسيل المتكرر'
        ],
        careInstructions: 'غسيل آلي بدرجة حرارة 40° مئوية كحد أقصى، يمكن استخدام التجفيف الآلي بدرجة حرارة منخفضة',
        b2b: {
            moq: 100,
            tiers: [
                { min: 100, max: 499, price: 145, discount: '42%' },
                { min: 500, max: 999, price: 125, discount: '50%' },
                { min: 1000, max: 5000, price: 110, discount: '56%' }
            ],
            productionTime: '7 - 14 يوم عمل',
            customizationOptions: ['تطريز شعار الماركة على الكمر', 'ألوان مخصصة', 'تغليف خاص بالبراند (Private Label)']
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
            'ياقة V-Neck مثالية للارتداء أسفل القمصان المفتوحة دون أن تظهر',
            'خياطة مزدوجة ناعمة عند الأكتاف لتجنب أي احتكاك',
            'قصة (Slim Fit) مريحة تأخذ شكل الجسم',
            'يمتص العرق بكفاءة للحفاظ على جفاف الجسم طوال اليوم'
        ],
        careInstructions: 'غسيل بالماء الدافئ، يمكن كيّه بدرجة حرارة متوسطة، لا تستخدم المبيضات بكثرة',
        b2b: {
            moq: 200,
            tiers: [
                { min: 200, max: 999, price: 95, discount: '47%' },
                { min: 1000, max: 2999, price: 80, discount: '55%' },
                { min: 3000, max: 10000, price: 72, discount: '60%' }
            ],
            productionTime: '10 - 15 يوم عمل',
            customizationOptions: ['تعديل شكل الياقة', 'طباعة الشعار حرارياً من الداخل', 'تصنيع لحساب الغير']
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
        reviewsCount: 180,
        badge: 'عرض حصري',
        badgeType: 'sale',
        image: 'assets/images/product_briefs.jpg',
        gallery: [
            'assets/images/product_briefs.jpg',
            'assets/images/factory_production.jpg'
        ],
        colors: [
            { name: 'أبيض ناصع', hex: '#ffffff', inStock: true }
        ],
        sizes: ['M', 'L', 'XL', '2XL', '3XL', '4XL'],
        stock: 600,
        fabric: '100% قطن مصري ممتاز منسوج بتقنية Rib',
        details: [
            'تصميم كلاسيكي داعم يوفر أقصى درجات الراحة والمرونة',
            'أستك (كمر) مغلف بالقطن بالكامل لمنع أي حساسية للجلد',
            'حواف مرنة حول الفخذين لا تسبب الضغط',
            'متانة عالية وتحمل للغسيل المتكرر'
        ],
        careInstructions: 'غسيل آلي بالماء الدافئ مع الألوان الفاتحة',
        b2b: {
            moq: 300,
            tiers: [
                { min: 300, max: 999, price: 65, discount: '45%' },
                { min: 1000, max: 4999, price: 55, discount: '54%' },
                { min: 5000, max: 20000, price: 48, discount: '60%' }
            ],
            productionTime: '7 - 14 يوم عمل',
            customizationOptions: ['تغيير نوع الأستك (كمر خارجي عريض)', 'تغليف فردي للقطع', 'تصدير كميات ضخمة']
        }
    },
    {
        id: 'undershirt-tank-white',
        name: 'فانلة داخلية بحمالات عريضة (Tank Top) بيضاء',
        category: 'undershirts',
        categoryName: 'فانلات داخلية',
        price: 150,
        originalPrice: 190,
        rating: 4.7,
        reviewsCount: 420,
        badge: 'أساسي يومي',
        badgeType: 'bestseller',
        image: 'assets/images/product_undershirt.jpg', // Using undershirt image as fallback
        gallery: [
            'assets/images/product_undershirt.jpg',
            'assets/images/fabrics_rolls.jpg'
        ],
        colors: [
            { name: 'أبيض', hex: '#ffffff', inStock: true },
            { name: 'رمادي', hex: '#d1d5db', inStock: true }
        ],
        sizes: ['M', 'L', 'XL', '2XL', '3XL'],
        stock: 550,
        fabric: '100% قطن مصري مضلع (Ribbed Cotton) يتمدد براحة تامة',
        details: [
            'تصميم حمالات عريضة مناسب للاستخدام تحت مختلف الملابس',
            'طول إضافي لمنع خروج الفانلة من البنطلون أثناء الحركة',
            'نسيج قطني يسمح بمرور الهواء ويحافظ على برودة الجسم',
            'خالي من أي بطاقات مزعجة في الرقبة (Tagless)'
        ],
        careInstructions: 'غسيل آلي بماء دافئ، تجنب المبيضات الكلورية',
        b2b: {
            moq: 200,
            tiers: [
                { min: 200, max: 999, price: 80, discount: '46%' },
                { min: 1000, max: 4999, price: 70, discount: '53%' },
                { min: 5000, max: 15000, price: 62, discount: '58%' }
            ],
            productionTime: '10 - 15 يوم عمل',
            customizationOptions: ['طباعة مقاسات ورقم الموديل بالداخل حرارياً', 'متاح تصنيع خامات مدمجة بالليكرا']
        }
    }
];

// Factory Capacity and Highlights
const FACTORY_STATS = [
    { value: '1.2M+', label: 'قطعة ملابس داخلية سنوياً', icon: 'fa-industry' },
    { value: '100%', label: 'قطن مصري ممتاز', icon: 'fa-leaf' },
    { value: '30+', label: 'عاماً من التميز والصناعة', icon: 'fa-award' },
    { value: 'ISO', label: 'معايير الجودة العالمية', icon: 'fa-shield-check' }
];

// Factory Capabilities Showcase
const FACTORY_CAPABILITIES = [
    {
        title: 'غزل وحياكة القطن المصري',
        desc: 'نستخدم أفضل تقنيات غزل القطن لإنتاج أقمشة داخلية ناعمة، مسامية، ومتينة تتحمل الاستخدام اليومي المكثف.',
        icon: 'fa-fan',
        tag: 'خامات طبيعية'
    },
    {
        title: 'قص آلي عالي الدقة',
        desc: 'خطوط قص محوسبة لضمان دقة المقاسات وثباتها في كافة القطع دون أي هدر في القماش.',
        icon: 'fa-scissors',
        tag: 'تقنية حديثة'
    },
    {
        title: 'مراقبة الجودة (QC)',
        desc: 'تخضع كل قطعة للفحص الدقيق للغرز، مرونة الأستك، وثبات الألوان لتوفير أقصى درجات الراحة للمستهلك.',
        icon: 'fa-check-double',
        tag: 'جودة لا تضاهى'
    },
    {
        title: 'تصنيع لحساب الغير (B2B)',
        desc: 'نصنع الملابس الداخلية للعلامات التجارية الكبرى بدءاً من التصميم وحتى التغليف بأكياس وعلب تحمل شعارك.',
        icon: 'fa-tags',
        tag: 'للشركات والمتاجر'
    }
];

// --- Database Simulation for Admin Panel ---
// Initialize or load products from localStorage
if (!localStorage.getItem('mesiri_products')) {
    localStorage.setItem('mesiri_products', JSON.stringify(PRODUCTS_DATA));
} else {
    try {
        PRODUCTS_DATA = JSON.parse(localStorage.getItem('mesiri_products'));
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
