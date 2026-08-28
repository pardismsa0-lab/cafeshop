/** تبدیل ارقام لاتین به فارسی */
export const faDigits = (value: number | string): string =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

/** فرمت عدد با جداکننده‌ی هزارگان فارسی */
export const formatNumber = (n: number): string => new Intl.NumberFormat("fa-IR").format(n);

/** فرمت قیمت به تومان */
export const formatToman = (n: number): string => `${formatNumber(n)} تومان`;

/** نرمال‌سازی متن فارسی برای جستجوی تحمل‌پذیر (ی/ک عربی، نیم‌فاصله و…) */
export const normalizeFa = (s: string): string =>
  s
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[\u200c\u200f\u200e]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** تبدیل ارقام فارسی/عربی به لاتین (برای اعتبارسنجی شماره) */
export const toEnDigits = (s: string): string =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

/** تاریخ امروز به شمسی */
export const todayFa = (): string =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date());

/** تولید کد پیگیری ۶ رقمی با ارقام فارسی */
export const makeTrackingCode = (): string =>
  faDigits(String(Math.floor(100_000 + Math.random() * 900_000)));

/** اعتبارسنجی شماره‌موبایل ایران */
export const isValidPhone = (raw: string): boolean => {
  const s = toEnDigits(raw).replace(/[\s-]/g, "");
  return /^09\d{9}$/.test(s) || /^\+989\d{9}$/.test(s);
};
