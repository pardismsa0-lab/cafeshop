/**
 * منطق خالص فروشگاه — بدون وابستگی به React یا DOM
 * این توابع واحدِ اصلی تست‌پذیر برنامه هستند.
 */
import { FREE_SHIPPING_THRESHOLD } from "../data/products";

/* ─────────── قوانین باشگاه مشتریان ─────────── */

/** به‌ازای هر ۱۰٬۰۰۰ تومان خرید، یک امتیاز */
export const TOMANS_PER_POINT = 10_000;

export const pointsForPurchase = (total: number): number =>
  Math.max(0, Math.floor(total / TOMANS_PER_POINT));

export interface RedeemRule {
  points: number;
  percent: number;
  label: string;
}

export const REDEEM_RULES: RedeemRule[] = [
  { points: 200, percent: 10, label: "۱۰٪ تخفیف" },
  { points: 450, percent: 20, label: "۲۰٪ تخفیف" },
];

export interface Tier {
  name: string;
  min: number;
  perk: string;
}

export const TIERS: Tier[] = [
  { name: "برنزی", min: 0, perk: "کد خوش‌آمدگویی ۱۰٪" },
  { name: "نقره‌ای", min: 300, perk: "ارسال رایگان یک سفارش در ماه" },
  { name: "طلایی", min: 800, perk: "دسترسی زودهنگام به لات‌های محدود" },
];

export const tierForPoints = (points: number): { tier: Tier; next: Tier | null; progress: number } => {
  let tier = TIERS[0];
  let next: Tier | null = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) {
      tier = TIERS[i];
      next = TIERS[i + 1] ?? null;
    }
  }
  const progress = next ? Math.min(1, (points - tier.min) / (next.min - tier.min)) : 1;
  return { tier, next, progress };
};

/* ─────────── محاسبات سبد و تسویه ─────────── */

export interface TotalsInput {
  subtotal: number;
  discountPercent: number;
  shippingBase: number;
  freeThreshold?: number;
}

export interface Totals {
  discount: number;
  payable: number;
  shippingCost: number;
  freeShipping: boolean;
  total: number;
}

export const computeTotals = ({
  subtotal,
  discountPercent,
  shippingBase,
  freeThreshold = FREE_SHIPPING_THRESHOLD,
}: TotalsInput): Totals => {
  const discount = Math.round((subtotal * discountPercent) / 100);
  const payable = subtotal - discount;
  const freeShipping = payable >= freeThreshold;
  const shippingCost = freeShipping ? 0 : shippingBase;
  return { discount, payable, shippingCost, freeShipping, total: payable + shippingCost };
};

/** پیشرفت تا ارسال رایگان (۰ تا ۱) */
export const freeShippingProgress = (subtotal: number, threshold = FREE_SHIPPING_THRESHOLD): number =>
  Math.min(1, Math.max(0, subtotal / threshold));

/** اعتبار کد تخفیف از نظر قالب */
export const normalizeCouponCode = (raw: string): string =>
  raw.trim().toUpperCase().replace(/\s+/g, "");

/* ─────────── تست‌های خودکار (در زمان اجرا) ─────────── */

export interface TestResult {
  name: string;
  passed: boolean;
}

const assertEq = <T,>(actual: T, expected: T): boolean =>
  JSON.stringify(actual) === JSON.stringify(expected);

export function runCartLogicTests(): TestResult[] {
  const results: TestResult[] = [];
  const t = (name: string, fn: () => boolean) => {
    try {
      results.push({ name, passed: fn() });
    } catch {
      results.push({ name, passed: false });
    }
  };

  t("تخفیف ۱۰٪ درست محاسبه می‌شود", () => {
    const r = computeTotals({ subtotal: 400_000, discountPercent: 10, shippingBase: 45_000 });
    return assertEq(r.discount, 40_000);
  });

  t("ارسال بالای آستانه رایگان می‌شود", () => {
    const r = computeTotals({ subtotal: 600_000, discountPercent: 0, shippingBase: 45_000 });
    return r.freeShipping && r.shippingCost === 0;
  });

  t("تخفیف، مبلغ قابل‌پرداخت را زیر آستانه ببرد، ارسال دوباره لحاظ می‌شود", () => {
    const r = computeTotals({ subtotal: 540_000, discountPercent: 10, shippingBase: 45_000 });
    return !r.freeShipping && r.shippingCost === 45_000;
  });

  t("جمع کل = قابل‌پرداخت + ارسال", () => {
    const r = computeTotals({ subtotal: 300_000, discountPercent: 15, shippingBase: 60_000 });
    return assertEq(r.total, r.payable + r.shippingCost);
  });

  t("امتیاز خرید: هر ۱۰ هزار تومان یک امتیاز", () => {
    return pointsForPurchase(1_250_000) === 125;
  });

  t("امتیاز خرید زیر ۱۰ هزار تومان صفر است", () => {
    return pointsForPurchase(9_999) === 0;
  });

  t("سطح نقره‌ای از ۳۰۰ امتیاز شروع می‌شود", () => {
    return tierForPoints(350).tier.name === "نقره‌ای";
  });

  t("سطح طلایی بالاترین سطح است و بعدی ندارد", () => {
    const r = tierForPoints(1000);
    return r.tier.name === "طلایی" && r.next === null && r.progress === 1;
  });

  t("پیشرفت ارسال رایگان بین ۰ و ۱ کران دارد", () => {
    return freeShippingProgress(0) === 0 && freeShippingProgress(99_999_999) === 1;
  });

  t("نرمال‌سازی کد تخفیف: حروف بزرگ و حذف فاصله", () => {
    return normalizeCouponCode(" atash 10 ") === "ATASH10";
  });

  return results;
}
