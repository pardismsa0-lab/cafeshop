export type CategoryId = "whole" | "ground" | "capsule";
export type SortKey = "popular" | "cheap" | "expensive" | "newest";

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  helpful: number;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  category: CategoryId;
  description: string;
  longDescription: string;
  price: number;
  /** موجودی انبار — توسط لایه‌ی api پر می‌شود */
  stock?: number;
  image: string;
  rating: number;
  reviews: number;
  popularity: number;
  addedAt: string;
  badge?: "new" | "bestseller";
  details: {
    roastDate: string;
    origin: string;
    process: string;
    roastLevel: string;
    intensity: number;
    altitude: string;
    tastingNotes: string[];
  };
  customerReviews: Review[];
}

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  whole: "دانه‌ی کامل",
  ground: "آسیاب‌شده",
  capsule: "کپسولی",
};

export const CATEGORY_FILTERS: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "whole", label: "دانه‌ی کامل" },
  { id: "ground", label: "آسیاب‌شده" },
  { id: "capsule", label: "کپسولی" },
];

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "popular", label: "پربازدیدترین" },
  { id: "cheap", label: "ارزان‌ترین" },
  { id: "expensive", label: "گران‌ترین" },
  { id: "newest", label: "جدیدترین" },
];

/** آستانه‌ی ارسال رایگان */
export const FREE_SHIPPING_THRESHOLD = 500_000;

/** کدهای تخفیف (شبیه‌سازی) */
export const COUPONS: Record<string, number> = {
  ATASH10: 10,
  BAHAAR15: 15,
};

const IMG = {
  ethiopia:
    "https://image.qwenlm.ai/generated-images/63dd1758-95ff-4b28-a49a-7ec2b2fdb7ea/_result.png",
  colombia:
    "https://image.qwenlm.ai/generated-images/aab07dd2-5a8b-40c8-84cb-c8c2314c1067/_result.png",
  baron:
    "https://image.qwenlm.ai/generated-images/e349a88f-df14-4cb5-bf1c-d3ae807378cc/_result.png",
  brazil:
    "https://image.qwenlm.ai/generated-images/8527c232-4a39-4cd4-a84e-0a1ee4e55e5f/_result.png",
  lungo:
    "https://image.qwenlm.ai/generated-images/aafffbaa-f2ca-4988-9478-75b723ba4002/_result.png",
  decaf:
    "https://image.qwenlm.ai/generated-images/2e0270e5-b311-4782-a0cb-487f77e2d3b3/_result.png",
};

export const HERO_IMAGE =
  "https://image.qwenlm.ai/generated-images/ecab241b-13b6-4dc6-a4b9-312870206648/_result.png";

export const ROASTERY_IMAGE =
  "https://image.qwenlm.ai/generated-images/46e84b13-f5f7-4bc3-9b44-1e3696d7da50/_result.png";

export const PRODUCTS: Product[] = [
  {
    id: "ethiopia-yirgacheffe",
    name: "قهوه‌ی سینگل‌اورجین اتیوپی یرگاچف",
    shortName: "اتیوپی یرگاچف",
    category: "whole",
    description: "با نت‌های گلی و مرکباتی، اسیدیته‌ی دلپذیر",
    longDescription:
      "یرگاچف یکی از مشهورترین خاستگاه‌های قهوه‌ی جهان است؛ دانه‌هایی که در باغ‌های کوچک منطقه‌ی گدیو پرورش می‌یابند و عطر یاسمین و طعم ترنج را به فنجان می‌آورند. این لاتِ تازه‌برشت، اسیدیته‌ای روشن و بدنه‌ای چای‌مانند دارد و برای دم‌آوری‌های دمی مثل V60 و کمکس بی‌نظیر است.",
    price: 450_000,
    image: IMG.ethiopia,
    rating: 4.8,
    reviews: 214,
    popularity: 980,
    addedAt: "2025-10-02",
    badge: "bestseller",
    details: {
      roastDate: "۲۰ مهر ۱۴۰۴",
      origin: "اتیوپی، منطقه‌ی گدیو",
      process: "شسته (Washed)",
      roastLevel: "روشن",
      intensity: 2,
      altitude: "۱۹۰۰ تا ۲۲۰۰ متر",
      tastingNotes: ["یاسمین", "ترنج", "لیمو شیرین"],
    },
    customerReviews: [
      {
        id: "eth-1",
        author: "نیلوفر احمدی",
        date: "۱۲ مهر ۱۴۰۴",
        rating: 5,
        text: "عطر یاسمینش از همان لحظه‌ی آسیاب‌کردن بلند می‌شود؛ با V60 فوق‌العاده شفاف و تمیز درمی‌آید. بهترین یرگاچفی بود که تا حالا نوشیده‌ام.",
        helpful: 23,
        verified: true,
      },
      {
        id: "eth-2",
        author: "کاوه میرزایی",
        date: "۸ مهر ۱۴۰۴",
        rating: 4,
        text: "اسیدیته‌ی مرکباتی‌اش برای ذائقه‌ی من کمی روشن بود، ولی کیفیت دانه واقعاً بالاست. برای دم سرد هم نتیجه‌ی جالبی داد.",
        helpful: 11,
        verified: true,
      },
      {
        id: "eth-3",
        author: "غزل رضوی",
        date: "۳ مهر ۱۴۰۴",
        rating: 5,
        text: "بسته‌بندی با تاریخ برشتِ همان هفته رسید. نت لیمو شیرینش کنار دسرهای شکلاتی معرکه است.",
        helpful: 8,
        verified: false,
      },
    ],
  },
  {
    id: "colombia-supremo",
    name: "قهوه‌ی بلند برشت کلمبیا سوپرمو",
    shortName: "کلمبیا سوپرمو",
    category: "whole",
    description: "طعم متعادل با نت‌های شکلاتی و آجیلی",
    longDescription:
      "سوپرمو درجه‌ی کیفی برتر دانه‌های کلمبیاست؛ درشت، یکدست و سرشار از شیرینی کاراملی. برشت مدیوم این قهوه، تعادلی دقیق میان اسیدیته و تلخی برقرار می‌کند و نت‌های شکلات شیری و فندق در پس‌زمینه‌ی آن می‌درخشند. انتخابی مطمئن برای کسانی که قهوه‌ای همه‌پسند می‌خواهند.",
    price: 380_000,
    image: IMG.colombia,
    rating: 4.6,
    reviews: 178,
    popularity: 845,
    addedAt: "2025-09-12",
    details: {
      roastDate: "۱۸ مهر ۱۴۰۴",
      origin: "کلمبیا، هوئیلا",
      process: "شسته (Washed)",
      roastLevel: "مدیوم",
      intensity: 3,
      altitude: "۱۵۰۰ تا ۱۸۰۰ متر",
      tastingNotes: ["شکلات شیری", "فندق", "کارامل"],
    },
    customerReviews: [
      {
        id: "col-1",
        author: "بهرام شریفی",
        date: "۱۵ مهر ۱۴۰۴",
        rating: 5,
        text: "تعادلش بی‌نظیر است؛ نه زیادی ترش، نه تلخ. با فرنچ‌پرس، صبح‌هایم را می‌سازد.",
        helpful: 17,
        verified: true,
      },
      {
        id: "col-2",
        author: "مهشید کریمی",
        date: "۲ مهر ۱۴۰۴",
        rating: 4,
        text: "نت فندق و کاراملش کاملاً مشخص است. فقط کاش بسته‌ی نیم‌کیلویی هم داشتید!",
        helpful: 9,
        verified: true,
      },
    ],
  },
  {
    id: "baron-espresso",
    name: "قهوه‌ی اسپرسو ایتالیایی بارون",
    shortName: "اسپرسو بارون",
    category: "ground",
    description: "ترکیب آرابیکا و روبوستا، کرم‌دهی عالی",
    longDescription:
      "یک بلند کلاسیک به سبک ناپل؛ ۷۰٪ آرابیکای برزیل و ۳۰٪ روبوستای شسته‌ی هند که برای شات‌های پرکرم و پرقدرت طراحی شده است. آسیاب مخصوص اسپرسو، تلخی دلپذیر کاکائو و ته‌مزه‌ی ادویه‌ای که با شیر عالی می‌شود و کاپوچینوی شما را به کافه‌ی ایتالیایی می‌برد.",
    price: 290_000,
    image: IMG.baron,
    rating: 4.5,
    reviews: 342,
    popularity: 1240,
    addedAt: "2025-07-28",
    badge: "bestseller",
    details: {
      roastDate: "۲۲ مهر ۱۴۰۴",
      origin: "بلند برزیل و هند",
      process: "خشک و شسته",
      roastLevel: "تیره",
      intensity: 5,
      altitude: "۹۰۰ تا ۱۲۰۰ متر",
      tastingNotes: ["کاکائو", "ادویه", "شکر قهوه‌ای"],
    },
    customerReviews: [
      {
        id: "bar-1",
        author: "آرش قاسمی",
        date: "۲۰ مهر ۱۴۰۴",
        rating: 5,
        text: "برای اسپرسوساز خانگی فوق‌العاده است؛ کرمای غلیظ و شکلاتی می‌دهد. از خیلی کافه‌ها بهتر است.",
        helpful: 31,
        verified: true,
      },
      {
        id: "bar-2",
        author: "سپیده نادری",
        date: "۱۱ مهر ۱۴۰۴",
        rating: 4,
        text: "با شیر عالی می‌شود و لاته‌آرتش هم خوب درمی‌آید. تلخی‌اش برای ذائقه‌ی من مناسب است.",
        helpful: 14,
        verified: true,
      },
      {
        id: "bar-3",
        author: "حمید توکلی",
        date: "۵ مهر ۱۴۰۴",
        rating: 4,
        text: "ارسال سریع بود و دانه‌ها تازه. روبوستایش اصلاً زننده نیست؛ شات صبحگاهیِ کاملی می‌دهد.",
        helpful: 6,
        verified: false,
      },
    ],
  },
  {
    id: "brazil-santos",
    name: "قهوه‌ی سرددم (کلدبرو) برزیل سانتوس",
    shortName: "کلدبرو سانتوس",
    category: "whole",
    description: "مناسب برای دم‌آوری سرد، طعم شیرین و نرم",
    longDescription:
      "دانه‌های سانتوس برزیل به‌دلیل شیرینی طبیعی و اسیدیته‌ی پایین، محبوب‌ترین انتخاب برای کلدبرو هستند. ۱۲ تا ۱۶ ساعت خیساندن در آب سرد، کنسانتره‌ای نرم با نت‌های فندقی و ته‌مزه‌ی ملاس به شما می‌دهد؛ پایه‌ای عالی برای نوشیدنی‌های تابستانی با یخ و شیر.",
    price: 420_000,
    image: IMG.brazil,
    rating: 4.7,
    reviews: 156,
    popularity: 690,
    addedAt: "2025-10-05",
    badge: "new",
    details: {
      roastDate: "۲۱ مهر ۱۴۰۴",
      origin: "برزیل، میناس‌ژرایس",
      process: "طبیعی (Natural)",
      roastLevel: "مدیوم",
      intensity: 3,
      altitude: "۸۰۰ تا ۱۳۵۰ متر",
      tastingNotes: ["فندق", "ملاس", "کشمش"],
    },
    customerReviews: [
      {
        id: "bra-1",
        author: "لیلا موسوی",
        date: "۱۸ مهر ۱۴۰۴",
        rating: 5,
        text: "۱۴ ساعت کلدبرو کردم؛ شیرین و نرم، بدون هیچ تلخی آزاردهنده. با یخ و کمی شیر محشر می‌شود.",
        helpful: 19,
        verified: true,
      },
      {
        id: "bra-2",
        author: "پویا افشار",
        date: "۹ مهر ۱۴۰۴",
        rating: 5,
        text: "نت ملاس و کشمشش توی دم سرد خیلی واضح است. تابستان‌ها فقط همین را می‌خرم.",
        helpful: 12,
        verified: true,
      },
    ],
  },
  {
    id: "lungo-capsule",
    name: "کپسول قهوه‌ی لُونگو کامپاتیبل",
    shortName: "کپسول لُونگو",
    category: "capsule",
    description: "سازگار با دستگاه‌های نِسپرسو، رست متوسط",
    longDescription:
      "کپسول‌های آلومینیومی با آب‌بندی کامل عطر، سازگار با تمام دستگاه‌های نسپرسو. بلند آرابیکای آمریکای مرکزی با برشت متوسط، فنجانی بلندتر (۱۱۰ میلی‌لیتر) با بدنه‌ی لطیف و ته‌مزه‌ی غلات برشته به شما می‌دهد؛ بسته‌ی ۱۰ عددی برای مصرف روزانه‌ی دفتر و خانه.",
    price: 180_000,
    image: IMG.lungo,
    rating: 4.3,
    reviews: 96,
    popularity: 512,
    addedAt: "2025-08-19",
    details: {
      roastDate: "۱۵ مهر ۱۴۰۴",
      origin: "بلند آمریکای مرکزی",
      process: "شسته (Washed)",
      roastLevel: "مدیوم",
      intensity: 3,
      altitude: "۱۲۰۰ تا ۱۶۰۰ متر",
      tastingNotes: ["غلات برشته", "عسل", "سیب قرمز"],
    },
    customerReviews: [
      {
        id: "lun-1",
        author: "نرگس صادقی",
        date: "۱۶ مهر ۱۴۰۴",
        rating: 4,
        text: "با دستگاه نسپرسوی قدیمی‌ام کاملاً سازگار است. عطرش توی دفتر همه را جذب می‌کند!",
        helpful: 7,
        verified: true,
      },
      {
        id: "lun-2",
        author: "فرهاد جلیلی",
        date: "۲۸ شهریور ۱۴۰۴",
        rating: 4,
        text: "نسبت به قیمتش کیفیت خوبی دارد؛ بدنه‌اش شاید کمی سبک باشد ولی برای مصرف روزمره عالیه.",
        helpful: 5,
        verified: false,
      },
    ],
  },
  {
    id: "swiss-water-decaf",
    name: "قهوه‌ی بدون کافئین (دکف) سوئیس‌واتر",
    shortName: "دکف سوئیس‌واتر",
    category: "whole",
    description: "فرآوری‌شده با روش سوئیس‌واتر، بدون مواد شیمیایی",
    longDescription:
      "کافئین‌زدایی به روش سوئیس‌واتر تنها با آب خالص انجام می‌شود؛ بدون هیچ حلال شیمیایی و با حفظ ۹۹٫۹٪ طعم دانه. نتیجه فنجانی است که تفاوتش با قهوه‌ی معمولی را جز در آرامش شبانه حس نمی‌کنید؛ شیرین، گِرد و با نت‌های شکلات تلخ. مناسب عصرها و برای کسانی که به کافئین حساس‌اند.",
    price: 500_000,
    image: IMG.decaf,
    rating: 4.4,
    reviews: 64,
    popularity: 310,
    addedAt: "2025-10-08",
    badge: "new",
    details: {
      roastDate: "۲۳ مهر ۱۴۰۴",
      origin: "کلمبیا، کائوکا",
      process: "سوئیس‌واتر + شسته",
      roastLevel: "مدیوم",
      intensity: 2,
      altitude: "۱۶۰۰ تا ۲۰۰۰ متر",
      tastingNotes: ["شکلات تلخ", "خرما", "گردو"],
    },
    customerReviews: [
      {
        id: "dec-1",
        author: "شیرین عبّاسی",
        date: "۲۱ مهر ۱۴۰۴",
        rating: 5,
        text: "باورم نمی‌شد دکف این‌قدر خوش‌طعم باشد؛ هیچ مزه‌ی کاغذی یا شیمیایی ندارد. عصرها با خیال راحت می‌نوشم.",
        helpful: 15,
        verified: true,
      },
      {
        id: "dec-2",
        author: "بابک امینی",
        date: "۷ مهر ۱۴۰۴",
        rating: 4,
        text: "نت خرما و گردویش مشخص است. روش سوئیس‌واتر واقعاً تفاوت را نشان می‌دهد.",
        helpful: 9,
        verified: true,
      },
    ],
  },
];

export interface ShippingMethod {
  id: "post" | "courier" | "pickup";
  label: string;
  eta: string;
  cost: number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "post", label: "پست پیشتاز", eta: "۲ تا ۴ روز کاری", cost: 45_000 },
  { id: "courier", label: "پیک موتوری", eta: "همان روز (تهران)", cost: 60_000 },
  { id: "pickup", label: "تحویل در محل برشت‌خانه", eta: "۲ ساعت پس از آماده‌سازی", cost: 0 },
];

export const PAYMENT_METHODS: { id: "online" | "cod"; label: string; hint: string }[] = [
  { id: "online", label: "پرداخت آنلاین", hint: "شبیه‌سازی‌شده؛ مبلغی کسر نمی‌شود" },
  { id: "cod", label: "پرداخت در محل", hint: "نقد یا کارت هنگام تحویل" },
];

export const BRAND = "آتش‌ودانه";

/* ═══════════ امتیازهای کاپینگ (برای برگه‌ی مقایسه) ═══════════ */
export interface CuppingScores {
  acidity: number;
  body: number;
  sweetness: number;
  aroma: number;
}

export const CUPPING_SCORES: Record<string, CuppingScores> = {
  "ethiopia-yirgacheffe": { acidity: 5, body: 2, sweetness: 3, aroma: 5 },
  "colombia-supremo": { acidity: 3, body: 3, sweetness: 4, aroma: 4 },
  "baron-espresso": { acidity: 2, body: 5, sweetness: 2, aroma: 4 },
  "brazil-santos": { acidity: 2, body: 4, sweetness: 5, aroma: 3 },
  "lungo-capsule": { acidity: 3, body: 3, sweetness: 3, aroma: 3 },
  "swiss-water-decaf": { acidity: 2, body: 3, sweetness: 4, aroma: 3 },
};

/* ═══════════ اشتراک ماهانه ═══════════ */
export const SUBSCRIPTION = {
  sizes: [
    { id: "250", label: "۲۵۰ گرم", price: 320_000 },
    { id: "500", label: "۵۰۰ گرم", price: 580_000 },
  ],
  frequencies: [
    { id: "monthly", label: "ماهانه", percent: 15 },
    { id: "biweekly", label: "هر دو هفته", percent: 10 },
  ],
  profiles: [
    { id: "surprise", label: "انتخاب باریستا", hint: "هر بار یک سورپرایز تازه‌برشت" },
    { id: "bright", label: "روشن و گلی", hint: "اسیدیته‌ی بالا، نت‌های مرکباتی" },
    { id: "balanced", label: "متعادل", hint: "شیرینی و بدنه‌ی هم‌تراز" },
    { id: "dark", label: "تیره و شکلاتی", hint: "پرکرم، مناسب اسپرسو" },
  ],
};

export interface SubscriptionPlan {
  sizeId: string;
  freqId: string;
  profileId: string;
  price: number;
  percent: number;
  startedAt: string;
  nextDelivery: string;
}
