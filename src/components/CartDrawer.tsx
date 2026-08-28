import { useEffect } from "react";
import { FREE_SHIPPING_THRESHOLD, type Product } from "../data/products";
import { faDigits, formatNumber, formatToman } from "../lib/utils";
import { CartIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon, TruckIcon } from "./icons";

export interface CartItem {
  product: Product;
  qty: number;
}

interface Props {
  open: boolean;
  items: CartItem[];
  count: number;
  subtotal: number;
  onClose: () => void;
  onSetQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  onGoShop: () => void;
}

export default function CartDrawer({
  open,
  items,
  count,
  subtotal,
  onClose,
  onSetQty,
  onRemove,
  onClear,
  onCheckout,
  onGoShop,
}: Props) {
  // قفل اسکرول صفحه هنگام باز بودن پنل
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // بستن با کلید Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* لایه‌ی تیره */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-roast-950/60 backdrop-blur-[2px] transition-opacity duration-400 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* پنل: از پایین در موبایل، از کنار در دسکتاپ */}
      <aside
        role="dialog"
        aria-label="سبد خرید"
        className={`absolute flex flex-col bg-cream-50 shadow-lift transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] inset-x-0 bottom-0 max-h-[86dvh] rounded-t-xl
          md:inset-x-auto md:inset-y-0 md:left-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none
          ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:-translate-x-full"}`}
      >
        {/* دستگیره‌ی موبایل */}
        <div className="flex justify-center pt-2.5 md:hidden">
          <span className="h-1.5 w-12 rounded-full bg-roast-900/20" />
        </div>

        {/* سربرگ */}
        <header className="flex items-center justify-between border-b border-roast-900/10 px-5 py-4">
          <h2 className="font-display flex items-center gap-2.5 text-2xl text-roast-900">
            سبد خرید
            {count > 0 && (
              <span
                key={count}
                className="animate-pop grid h-7 min-w-7 place-items-center rounded-full bg-gold-500 px-2 text-xs font-bold text-roast-950"
              >
                {faDigits(count)}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="بستن سبد خرید"
            className="grid h-10 w-10 place-items-center rounded-full text-roast-600 transition-all hover:bg-roast-900/8 hover:text-roast-900 active:scale-90"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          /* حالت خالی */
          <div className="grid flex-1 place-items-center px-8 py-14 text-center">
            <div>
              <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-gold-600/50 text-gold-700">
                <CartIcon className="h-10 w-10" />
              </span>
              <h3 className="font-display mt-6 text-2xl text-roast-900">سبد خرید شما خالی است</h3>
              <p className="mx-auto mt-2 max-w-60 text-sm leading-7 text-roast-600">
                هنوز قهوه‌ای انتخاب نکرده‌اید؛ تازه‌برشت‌ها منتظرند!
              </p>
              <button
                onClick={onGoShop}
                className="mt-7 rounded-full bg-gold-600 px-7 py-3 text-sm font-bold text-roast-950 transition-all duration-300 hover:bg-gold-500 active:scale-95"
              >
                دیدن محصولات
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* اقلام */}
            <ul className="slim-scroll flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
              {items.map(({ product, qty }) => (
                <li
                  key={product.id}
                  className="animate-fade-up flex gap-3.5 rounded-xl border border-roast-900/8 bg-cream-100/70 p-3 transition-shadow hover:shadow-card"
                >
                  <img
                    src={product.image}
                    alt={product.shortName}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 text-sm font-extrabold text-roast-900">{product.name}</h4>
                      <button
                        onClick={() => onRemove(product.id)}
                        aria-label={`حذف ${product.shortName}`}
                        className="shrink-0 rounded-full p-1.5 text-brick-600 transition-all hover:bg-brick-600/10 active:scale-90"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-roast-600">
                      واحد: {formatNumber(product.price)} تومان
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-roast-900/15 bg-cream-50">
                        <button
                          onClick={() => onSetQty(product.id, qty - 1)}
                          aria-label="کاهش تعداد"
                          className="grid h-8 w-8 place-items-center rounded-full text-roast-700 transition-all hover:text-brick-600 active:scale-90"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span key={qty} className="animate-pop w-7 text-center text-sm font-bold text-roast-900">
                          {faDigits(qty)}
                        </span>
                        <button
                          onClick={() => onSetQty(product.id, qty + 1)}
                          disabled={qty >= 10}
                          aria-label="افزایش تعداد"
                          className="grid h-8 w-8 place-items-center rounded-full text-roast-700 transition-all hover:text-olive-600 active:scale-90 disabled:opacity-25"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="whitespace-nowrap text-sm font-extrabold text-gold-700">
                        {formatNumber(product.price * qty)}
                        <span className="text-[10px] font-bold text-gold-700/75"> تومان</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* جمع‌بندی */}
            <footer className="space-y-3.5 border-t border-roast-900/10 bg-cream-50 p-5">
              {/* نوار پیشرفت ارسال رایگان */}
              {(() => {
                const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
                const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
                return (
                  <div className="rounded-xl border border-roast-900/8 bg-cream-100/70 p-3.5">
                    <p className="flex items-center gap-2 text-[11px] font-bold">
                      <TruckIcon className={`h-4.5 w-4.5 shrink-0 ${remaining === 0 ? "text-olive-600" : "text-gold-700"}`} />
                      {remaining === 0 ? (
                        <span className="text-olive-600">تبریک! ارسال این سفارش رایگان شد.</span>
                      ) : (
                        <span className="text-roast-700">
                          تا ارسال رایگان، فقط{" "}
                          <strong className="font-extrabold text-gold-700">{formatNumber(remaining)}</strong> تومان
                          مانده
                        </span>
                      )}
                    </p>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-roast-900/10">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          remaining === 0 ? "bg-olive-600" : "bg-gradient-to-l from-gold-500 to-gold-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between text-sm text-roast-600">
                <span>تعداد کل اقلام</span>
                <strong className="font-extrabold text-roast-900">{faDigits(count)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-roast-700">جمع کل</span>
                <strong className="text-lg font-extrabold text-gold-700">{formatToman(subtotal)}</strong>
              </div>
              <button
                onClick={onCheckout}
                className="w-full rounded-full bg-gold-600 py-3.5 text-sm font-bold text-roast-950 shadow-[0_12px_28px_-10px_rgb(168_124_78/0.8)] transition-all duration-300 hover:bg-gold-500 active:scale-[0.98]"
              >
                ادامه به تسویه‌حساب
              </button>
              <div className="flex items-center justify-between pt-0.5">
                <button
                  onClick={onClear}
                  className="flex items-center gap-1.5 text-xs font-bold text-brick-600 transition-colors hover:text-brick-500"
                >
                  <TrashIcon className="h-4 w-4" />
                  تخلیه سبد
                </button>
                <button
                  onClick={onGoShop}
                  className="text-xs font-semibold text-roast-600 underline decoration-gold-600/50 underline-offset-4 transition-colors hover:text-gold-700"
                >
                  بازگشت به فروشگاه
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
