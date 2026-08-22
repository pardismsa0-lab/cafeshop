/**
 * خودآزمایی هنگام اجرا
 * ----------------------
 * در حالت توسعه، هنگام بارگذاری برنامه، تمام آزمون‌های منطقِ فروشگاه
 * اجرا و نتیجه در کنسول مرورگر گزارش می‌شود — تا regressions همان لحظه دیده شوند.
 */
import { runCartLogicTests } from "./cart-logic";

export function runSelfTests() {
  const results = runCartLogicTests();
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  const style = (ok: boolean) =>
    `color:${ok ? "#558b2f" : "#d32f2f"};font-weight:bold`;

  console.groupCollapsed(
    `%c🧪 خودآزمایی آتش‌ودانه: ${passed}/${results.length} آزمون موفق`,
    `color:#c49a6c;font-weight:bold;font-size:13px`,
  );
  for (const r of results) {
    console.log(`%c${r.passed ? "✓" : "✗"} ${r.name}`, style(r.passed));
  }
  if (failed > 0) {
    console.warn(`${failed} آزمون ناموفق — منطق فروشگاه را بررسی کنید!`);
  }
  console.groupEnd();

  return { passed, failed, total: results.length };
}
