import { useState } from "react";
import confetti from "canvas-confetti";
import { PAYMENT_METHODS, SHIPPING_METHODS, type ShippingMethod } from "../data/products";
import { faDigits, formatToman, isValidPhone, makeTrackingCode, todayFa } from "../lib/utils";
import type { CartItem } from "./CartDrawer";
import {
  BackIcon,
  CardIcon,
  CashIcon,
  CheckIcon,
  PackageIcon,
  StoreIcon,
  TruckIcon,
} from "./icons";

interface Props {
  items: CartItem[];
  subtotal: number;
  onBack: () => void;
  onGoHome: () => void;
  onComplete: () => void;
}

interface OrderReceipt {
  code: string;
  date: string;
  name: string;
  shippingLabel: string;
  paymentLabel: string;
  total: number;
}

const SHIPPING_ICONS: Record<ShippingMethod["id"], typeof TruckIcon> = {
  post: PackageIcon,
  courier: TruckIcon,
  pickup: StoreIcon,
};

export default function Checkout({ items, subtotal, onBack, onGoHome, onComplete }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shipping, setShipping] = useState<ShippingMethod["id"]>("post");
  const [payment, setPayment] = useState<"online" | "cod">("online");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderReceipt | null>(null);

  const shippingCost = SHIPPING_METHODS.find((s) => s.id === shipping)?.cost ?? 0;
  const total = subtotal + shippingCost;

  const validate = () => {
    const next: typeof errors = {};
    if (name.trim().length < 3) next.name = "نام و نام‌خانوادگی را کامل وارد کنید.";
    if (!isValidPhone(phone)) next.phone = "شماره‌ی تماس معتبر نیست؛ مثال: ۰۹۱۲۳۴۵۶۷۸۹";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    /* شبیه‌سازی پردازش سفارش */
    window.setTimeout(() => {
      const receipt: OrderReceipt = {
        code: makeTrackingCode(),
        date: todayFa(),
        name: name.trim(),
        shippingLabel: SHIPPING_METHODS.find((s) => s.id === shipping)?.label ?? "",
        paymentLabel: PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? "",
        total,
      };
      setOrder(receipt);
      setSubmitting(false);
      onComplete();
      window.scrollTo({ top: 0, behavior: "smooth" });
      confetti({
        particleCount: 140,
        spread: 75,
        origin: { y: 0.55 },
        colors: ["#c49a6c", "#d4a574", "#558b2f", "#f3e3cd", "#8a6138"],
      });
    }, 900);
  };

  /* ═══════════ رسید موفقیت ═══════════ */
  if (order) {
    return (
      <div className="animate-fade-up mx-auto max-w-2xl px-4 py-14 text-center">
        <span className="animate-pop mx-auto grid h-24 w-24 place-items-center rounded-full bg-olive-600 text-cream-50 shadow-[0_20px_50px_-15px_rgb(85_139_47/0.7)]">
          <CheckIcon className="h-11 w-11" strokeWidth={2.4} />
        </span>
        <h1 className="font-display mt-7 text-3xl text-roast-900 md:text-4xl">
          سفارش شما با موفقیت ثبت شد!
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-roast-600">
          {order.name} عزیز، قهوه‌ی شما همین حالا در صف برشت‌خانه قرار گرفت. جزئیات سفارش از طریق
          پیامک برایتان ارسال می‌شود.
        </p>

        <div className="mx-auto mt-8 max-w-sm rounded-xl border-2 border-dashed border-gold-600/60 bg-gold-500/12 p-6">
          <p className="text-xs font-bold text-roast-600">کد پیگیری سفارش</p>
          <p className="font-display mt-2 text-4xl tracking-[0.15em] text-gold-700">{order.code}</p>
        </div>

        <dl className="mt-8 grid gap-3 text-start sm:grid-cols-2">
          {[
            { label: "تاریخ ثبت سفارش", value: order.date },
            { label: "گیرنده", value: order.name },
            { label: "روش ارسال", value: order.shippingLabel },
            { label: "روش پرداخت", value: order.paymentLabel },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-roast-900/10 bg-cream-50 p-4 shadow-card">
              <dt className="text-[11px] font-bold text-roast-600">{row.label}</dt>
              <dd className="mt-1.5 text-sm font-extrabold text-roast-900">{row.value}</dd>
            </div>
          ))}
          <div className="rounded-xl bg-roast-900 p-4 shadow-card sm:col-span-2">
            <dt className="text-[11px] font-bold text-cream-200/70">مبلغ نهایی سفارش</dt>
            <dd className="mt-1.5 text-lg font-extrabold text-gold-400">{formatToman(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full bg-gold-600 px-7 py-3.5 text-sm font-bold text-roast-950 transition-all duration-300 hover:bg-gold-500 active:scale-95"
          >
            بازگشت به فروشگاه
          </button>
          <button
            onClick={onGoHome}
            className="rounded-full border border-roast-900/20 px-7 py-3.5 text-sm font-bold text-roast-800 transition-all duration-300 hover:border-gold-600 hover:text-gold-700"
          >
            صفحه‌ی اصلی
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════ سبد خالی ═══════════ */
  if (items.length === 0) {
    return (
      <div className="animate-fade-up mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-roast-900">سبدی برای تسویه نیست!</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-8 text-roast-600">
          پیش از تسویه‌حساب، چند بسته قهوه‌ی تازه‌برشت به سبدتان اضافه کنید.
        </p>
        <button
          onClick={onBack}
          className="mt-8 rounded-full bg-gold-600 px-7 py-3.5 text-sm font-bold text-roast-950 transition-all hover:bg-gold-500 active:scale-95"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    );
  }

  /* ═══════════ فرم تسویه ═══════════ */
  return (
    <div className="animate-fade-up mx-auto max-w-6xl px-4 py-10">
      <button
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-roast-900/15 bg-cream-50 px-4 py-2.5 text-sm font-bold text-roast-700 shadow-card transition-all hover:border-gold-600 hover:text-gold-700 active:scale-95"
      >
        <BackIcon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
        بازگشت به فروشگاه
      </button>

      <h1 className="font-display mt-6 text-3xl text-roast-900 md:text-4xl">تسویه‌حساب</h1>
      <p className="mt-2 text-sm text-roast-600">
        اطلاعات گیرنده را وارد کنید؛ فاصله‌ی شما تا قهوه‌ی تازه فقط چند کلیک است.
      </p>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-5">
        {/* فرم */}
        <div className="space-y-9 lg:col-span-3">
          {/* اطلاعات گیرنده */}
          <fieldset className="rounded-xl border border-roast-900/10 bg-cream-50 p-6 shadow-card">
            <legend className="font-display float-start me-3 bg-transparent px-2 text-xl text-roast-900">
              اطلاعات گیرنده
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="mb-2 block text-sm font-bold text-roast-800">
                  نام و نام‌خانوادگی <span className="text-brick-600">*</span>
                </label>
                <input
                  id="co-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="مثلاً: سارا محمدی"
                  className={`w-full rounded-xl border-2 bg-cream-100/60 px-4 py-3 text-sm text-roast-900 placeholder:text-roast-900/30 transition-all focus:outline-none focus:ring-4 ${
                    errors.name
                      ? "border-brick-600 focus:ring-brick-600/15"
                      : "border-roast-900/12 focus:border-gold-600 focus:ring-gold-600/15"
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-xs font-semibold text-brick-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="co-phone" className="mb-2 block text-sm font-bold text-roast-800">
                  شماره تماس <span className="text-brick-600">*</span>
                </label>
                <input
                  id="co-phone"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  placeholder="0912 345 6789"
                  className={`w-full rounded-xl border-2 bg-cream-100/60 px-4 py-3 text-sm text-left text-roast-900 placeholder:text-roast-900/30 transition-all focus:outline-none focus:ring-4 ${
                    errors.phone
                      ? "border-brick-600 focus:ring-brick-600/15"
                      : "border-roast-900/12 focus:border-gold-600 focus:ring-gold-600/15"
                  }`}
                />
                {errors.phone && <p className="mt-1.5 text-xs font-semibold text-brick-600">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="mb-2 block text-sm font-bold text-roast-800">
                  آدرس <span className="text-xs font-medium text-roast-600">(اختیاری)</span>
                </label>
                <textarea
                  id="co-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="خیابان، کوچه، پلاک، واحد…"
                  className="w-full resize-none rounded-xl border-2 border-roast-900/12 bg-cream-100/60 px-4 py-3 text-sm text-roast-900 placeholder:text-roast-900/30 transition-all focus:border-gold-600 focus:outline-none focus:ring-4 focus:ring-gold-600/15"
                />
              </div>
            </div>
          </fieldset>

          {/* روش ارسال */}
          <fieldset>
            <legend className="font-display mb-4 text-xl text-roast-900">روش ارسال</legend>
            <div className="grid gap-3">
              {SHIPPING_METHODS.map((m) => {
                const Icon = SHIPPING_ICONS[m.id];
                const selected = shipping === m.id;
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all duration-300 ${
                      selected
                        ? "border-gold-600 bg-gold-500/12 shadow-card"
                        : "border-roast-900/12 bg-cream-50 hover:border-gold-600/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={m.id}
                      checked={selected}
                      onChange={() => setShipping(m.id)}
                      className="sr-only"
                    />
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
                        selected ? "bg-gold-600 text-roast-950" : "bg-roast-900/8 text-roast-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-extrabold text-roast-900">{m.label}</span>
                      <span className="mt-0.5 block text-xs text-roast-600">{m.eta}</span>
                    </span>
                    <span className={`text-sm font-extrabold ${m.cost === 0 ? "text-olive-600" : "text-gold-700"}`}>
                      {m.cost === 0 ? "رایگان" : formatToman(m.cost)}
                    </span>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
                        selected ? "border-gold-600 bg-gold-600" : "border-roast-900/25"
                      }`}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-cream-50" />}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* روش پرداخت */}
          <fieldset>
            <legend className="font-display mb-4 text-xl text-roast-900">روش پرداخت</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.id === "online" ? CardIcon : CashIcon;
                const selected = payment === m.id;
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border-2 p-4 transition-all duration-300 ${
                      selected
                        ? "border-gold-600 bg-gold-500/12 shadow-card"
                        : "border-roast-900/12 bg-cream-50 hover:border-gold-600/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={selected}
                      onChange={() => setPayment(m.id)}
                      className="sr-only"
                    />
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
                        selected ? "bg-gold-600 text-roast-950" : "bg-roast-900/8 text-roast-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-extrabold text-roast-900">{m.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-roast-600">{m.hint}</span>
                    </span>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
                        selected ? "border-gold-600 bg-gold-600" : "border-roast-900/25"
                      }`}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-cream-50" />}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* خلاصه‌ی سفارش */}
        <aside className="lg:col-span-2">
          <div className="rounded-xl border border-roast-900/10 bg-cream-50 p-6 shadow-card lg:sticky lg:top-32">
            <h2 className="font-display text-xl text-roast-900">خلاصه‌ی سفارش</h2>
            <ul className="mt-3 divide-y divide-roast-900/8">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <img src={product.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-extrabold text-roast-900">{product.name}</p>
                    <p className="mt-1 text-[11px] font-bold text-gold-700">× {faDigits(qty)}</p>
                  </div>
                  <p className="whitespace-nowrap text-xs font-extrabold text-roast-800">
                    {formatToman(product.price * qty)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-2 space-y-2.5 border-t border-roast-900/10 pt-4 text-sm">
              <div className="flex justify-between text-roast-600">
                <dt>جمع کالاها</dt>
                <dd className="font-bold text-roast-900">{formatToman(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-roast-600">
                <dt>هزینه‌ی ارسال</dt>
                <dd className={`font-bold ${shippingCost === 0 ? "text-olive-600" : "text-roast-900"}`}>
                  {shippingCost === 0 ? "رایگان" : formatToman(shippingCost)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-roast-900/15 pt-3">
                <dt className="font-extrabold text-roast-900">مبلغ قابل پرداخت</dt>
                <dd className="text-lg font-extrabold text-gold-700">{formatToman(total)}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-gold-600 py-4 text-sm font-bold text-roast-950 shadow-[0_14px_30px_-10px_rgb(168_124_78/0.8)] transition-all duration-300 hover:bg-gold-500 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
            >
              {submitting ? (
                <>
                  <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-roast-950/25 border-t-roast-950" />
                  در حال ثبت سفارش…
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  تأیید و ثبت سفارش
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-roast-600">
              پرداخت آنلاین در این نسخه شبیه‌سازی شده و مبلغی از حساب شما کسر نمی‌شود.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
