/**
 * تست‌های واحد منطق سبد، تخفیف و باشگاه مشتریان
 * اجرا با: npx vitest run
 */
import { describe, expect, it } from "vitest";
import {
  computeTotals,
  freeShippingProgress,
  normalizeCouponCode,
  pointsForPurchase,
  REDEEM_RULES,
  tierForPoints,
} from "./cart-logic";

describe("computeTotals", () => {
  it("تخفیف درصدی را درست محاسبه می‌کند", () => {
    const r = computeTotals({ subtotal: 400_000, discountPercent: 10, shippingBase: 45_000 });
    expect(r.discount).toBe(40_000);
    expect(r.payable).toBe(360_000);
  });

  it("بالای آستانه، ارسال رایگان می‌شود", () => {
    const r = computeTotals({ subtotal: 500_000, discountPercent: 0, shippingBase: 45_000 });
    expect(r.freeShipping).toBe(true);
    expect(r.shippingCost).toBe(0);
    expect(r.total).toBe(500_000);
  });

  it("اگر تخفیف مبلغ را زیر آستانه بیاورد، ارسال دوباره حساب می‌شود", () => {
    const r = computeTotals({ subtotal: 540_000, discountPercent: 10, shippingBase: 45_000 });
    expect(r.freeShipping).toBe(false);
    expect(r.total).toBe(486_000 + 45_000);
  });

  it("سبد خالی جمع صفر دارد", () => {
    const r = computeTotals({ subtotal: 0, discountPercent: 15, shippingBase: 45_000 });
    expect(r.total).toBe(45_000);
  });
});

describe("باشگاه مشتریان", () => {
  it("هر ۱۰ هزار تومان یک امتیاز", () => {
    expect(pointsForPurchase(1_250_000)).toBe(125);
    expect(pointsForPurchase(9_999)).toBe(0);
  });

  it("قوانین تبدیل امتیاز صعودی‌اند", () => {
    for (let i = 1; i < REDEEM_RULES.length; i++) {
      expect(REDEEM_RULES[i].points).toBeGreaterThan(REDEEM_RULES[i - 1].points);
      expect(REDEEM_RULES[i].percent).toBeGreaterThan(REDEEM_RULES[i - 1].percent);
    }
  });

  it("سطوح بر اساس امتیاز درست انتخاب می‌شوند", () => {
    expect(tierForPoints(0).tier.name).toBe("برنزی");
    expect(tierForPoints(300).tier.name).toBe("نقره‌ای");
    expect(tierForPoints(800).tier.name).toBe("طلایی");
    expect(tierForPoints(5000).next).toBeNull();
  });
});

describe("کد تخفیف", () => {
  it("کد را نرمال‌سازی می‌کند", () => {
    expect(normalizeCouponCode(" atash 10 ")).toBe("ATASH10");
  });
});

describe("freeShippingProgress", () => {
  it("بین صفر و یک کران دارد", () => {
    expect(freeShippingProgress(0)).toBe(0);
    expect(freeShippingProgress(250_000)).toBeCloseTo(0.5);
    expect(freeShippingProgress(10_000_000)).toBe(1);
  });
});
