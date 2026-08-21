import { useEffect, useState } from "react";
import { api, ORDER_STATUS_LABELS, type OrderStatus, type StoredOrder } from "../lib/api";
import { faDigits, formatToman } from "../lib/utils";
import { CheckIcon, CloseIcon, PackageIcon, StoreIcon, TruckIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  onGoShop: () => void;
}

const TIMELINE: { label: string; icon: typeof CheckIcon }[] = [
  { label: "ثبت سفارش", icon: CheckIcon },
  { label: "آماده‌سازی", icon: PackageIcon },
  { label: "ارسال", icon: TruckIcon },
  { label: "تحویل", icon: StoreIcon },
];

/** ایندکس مرحله‌ی فعال بر اساس وضعیت سفارش */
const statusStep = (s: OrderStatus): number =>
  s === "preparing" ? 1 : s === "shipping" ? 2 : 3;

export default function OrderHistory({ open, onClose, onGoShop }: Props) {
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    if (open) setOrders(api.getOrders());
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-roast-950/60 backdrop-blur-[2px] transition-opacity duration-400 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-label="تاریخچه‌ی سفارش‌ها"
        className={`absolute inset-x-3 top-1/2 mx-auto flex max-h-[84dvh] w-auto max-w-2xl -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-cream-100 shadow-lift transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <header className="flex items-center justify-between border-b border-roast-900/10 bg-cream-50 px-6 py-4">
          <h2 className="font-display flex items-center gap-2.5 text-2xl text-roast-900">
            <PackageIcon className="h-6 w-6 text-gold-600" />
            سفارش‌های من
            {orders.length > 0 && (
              <span className="grid h-7 min-w-7 place-items-center rounded-full bg-gold-500 px-2 text-xs font-bold text-roast-950">
                {faDigits(orders.length)}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="grid h-10 w-10 place-items-center rounded-full text-roast-600 transition-all hover:bg-roast-900/8 hover:text-roast-900 active:scale-90"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="slim-scroll flex-1 overflow-y-auto p-5">
          {orders.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <div>
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-gold-600/50 text-gold-700">
                  <PackageIcon className="h-9 w-9" />
                </span>
                <h3 className="font-display mt-5 text-xl text-roast-900">هنوز سفارشی ثبت نکرده‌اید</h3>
                <p className="mx-auto mt-2 max-w-64 text-sm leading-7 text-roast-600">
                  اولین قهوه‌ی تازه‌برشت‌تان فقط چند کلیک فاصله دارد!
                </p>
                <button
                  onClick={onGoShop}
                  className="mt-6 rounded-full bg-gold-600 px-7 py-3 text-sm font-bold text-roast-950 transition-all hover:bg-gold-500 active:scale-95"
                >
                  رفتن به فروشگاه
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((o, idx) => {
                const step = statusStep(o.status);
                const delivered = o.status === "delivered";
                return (
                  <li
                    key={o.code}
                    className="animate-fade-up rounded-xl border border-roast-900/10 bg-cream-50 p-5 shadow-card"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-display rounded-lg bg-roast-900 px-3 py-1.5 text-lg tracking-[0.12em] text-gold-400">
                          {o.code}
                        </span>
                        <span className="text-xs font-semibold text-roast-600">{o.date}</span>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                          delivered ? "bg-olive-600/15 text-olive-700" : "bg-gold-500/15 text-gold-700"
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          {!delivered && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-600 opacity-60" />
                          )}
                          <span
                            className={`relative inline-flex h-2 w-2 rounded-full ${delivered ? "bg-olive-600" : "bg-gold-600"}`}
                          />
                        </span>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </div>

                    {/* تایم‌لاین وضعیت */}
                    <ol className="mt-4 flex items-center">
                      {TIMELINE.map((t, i) => {
                        const done = i < step || delivered;
                        const active = i === step && !delivered;
                        return (
                          <li key={t.label} className="flex flex-1 items-center last:flex-none">
                            <span className="flex flex-col items-center gap-1.5">
                              <span
                                className={`grid h-8 w-8 place-items-center rounded-full border-2 transition-colors ${
                                  done
                                    ? "border-olive-600 bg-olive-600 text-cream-50"
                                    : active
                                      ? "border-gold-600 bg-gold-500/20 text-gold-700"
                                      : "border-roast-900/15 bg-cream-100 text-roast-900/35"
                                }`}
                              >
                                <t.icon className="h-3.5 w-3.5" />
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  done ? "text-olive-600" : active ? "text-gold-700" : "text-roast-900/40"
                                }`}
                              >
                                {t.label}
                              </span>
                            </span>
                            {i < TIMELINE.length - 1 && (
                              <span
                                className={`mx-1 mb-5 h-0.5 flex-1 rounded-full ${
                                  i < step || delivered ? "bg-olive-600/60" : "bg-roast-900/10"
                                }`}
                              />
                            )}
                          </li>
                        );
                      })}
                    </ol>

                    <ul className="mt-4 space-y-1.5 border-t border-dashed border-roast-900/15 pt-3.5">
                      {o.items.map((it) => (
                        <li key={it.name} className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-roast-700">
                            {it.name} <strong className="text-roast-900">× {faDigits(it.qty)}</strong>
                          </span>
                          <span className="whitespace-nowrap font-bold text-roast-900">
                            {formatToman(it.price * it.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-roast-900/15 pt-3.5 text-xs text-roast-600">
                      <span>
                        {o.shippingLabel} · {o.paymentLabel}
                      </span>
                      <span className="text-sm font-extrabold text-gold-700">{formatToman(o.total)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
