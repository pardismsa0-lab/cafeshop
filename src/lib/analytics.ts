/**
 * آنالیتیکس رویدادها (شبیه‌سازی‌شده)
 * -----------------------------------
 * رویدادها در localStorage ذخیره می‌شوند و در تب «آنالیتیکس» پنل مدیریت،
 * قیف تبدیلِ «بازدید محصول → افزودن به سبد → تسویه → خرید» نمایش داده می‌شود.
 */

export type ShopEvent =
  | "view_item"
  | "search"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "purchase"
  | "subscribe";

export const EVENT_LABELS: Record<ShopEvent, string> = {
  view_item: "بازدید محصول",
  search: "جستجو",
  add_to_cart: "افزودن به سبد",
  remove_from_cart: "حذف از سبد",
  begin_checkout: "شروع تسویه",
  purchase: "خرید نهایی",
  subscribe: "اشتراک",
};

interface StoredEvent {
  event: ShopEvent;
  at: number;
  props: Record<string, string | number>;
}

const KEY = "aod-analytics";
const MAX_EVENTS = 400;

function readAll(): StoredEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredEvent[]) : [];
  } catch {
    return [];
  }
}

/** ثبت یک رویداد */
export function track(event: ShopEvent, props: Record<string, string | number> = {}) {
  try {
    const list = readAll();
    list.push({ event, at: Date.now(), props });
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_EVENTS)));
  } catch {
    /* ذخیره‌سازی در دسترس نیست */
  }
}

/** شمارش رویدادها */
export function getEventCounts(): Record<ShopEvent, number> {
  const counts: Record<ShopEvent, number> = {
    view_item: 0,
    search: 0,
    add_to_cart: 0,
    remove_from_cart: 0,
    begin_checkout: 0,
    purchase: 0,
    subscribe: 0,
  };
  for (const e of readAll()) counts[e.event]++;
  return counts;
}

/** قیف تبدیل */
export interface FunnelStep {
  event: ShopEvent;
  label: string;
  count: number;
  /** نرخ تبدیل نسبت به مرحله‌ی قبل */
  rate: number | null;
}

export function getFunnel(): FunnelStep[] {
  const c = getEventCounts();
  const steps: ShopEvent[] = ["view_item", "add_to_cart", "begin_checkout", "purchase"];
  return steps.map((event, i) => {
    const prev = i === 0 ? null : c[steps[i - 1]];
    return {
      event,
      label: EVENT_LABELS[event],
      count: c[event],
      rate: prev && prev > 0 ? c[event] / prev : null,
    };
  });
}

/** آخرین رویدادها برای جدول پنل مدیریت */
export function getRecentEvents(limit = 12): (StoredEvent & { timeFa: string })[] {
  return readAll()
    .slice(-limit)
    .reverse()
    .map((e) => ({
      ...e,
      timeFa: new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(e.at),
    }));
}

/** پاک‌کردن داده‌های آنالیتیکس */
export function resetAnalytics() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* — */
  }
}
