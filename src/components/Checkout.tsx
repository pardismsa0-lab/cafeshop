import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { api, stockOf, type Address } from "../lib/api";
import {
  COUPONS,
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  type ShippingMethod,
} from "../data/products";
import { usePageMeta } from "../lib/seo";
import { useShop } from "../lib/shop-context";
import { faDigits, formatToman, isValidPhone } from "../lib/utils";
import PaymentGateway from "./PaymentGateway";
import {
  BackIcon,
  CardIcon,
  CashIcon,
  CheckIcon,
  CloseIcon,
  PackageIcon,
  PinIcon,
  StoreIcon,
  TruckIcon,
  UserIcon,
} from "./icons";

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

export default function CheckoutPage() {
  usePageMeta(
    "تسویه‌حساب | آتش‌ودانه",
    "تسویه‌حساب امن سفارش قهوه‌های تازه‌برشت آتش‌ودانه — ارسال به سراسر کشور",
  );

  const navigate = useNavigate();
  const {
    cartItems: items,
    subtotal,
    clearCart,
    user,
    setAuthOpen,
    pushToast,
    sendSms,
    setOrdersOpen,
    refreshProducts,
  } = useShop();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [shipping, setShipping] = useState<ShippingMethod["id"]>("post");
  const [payment, setPayment] = useState<"online" | "cod">("online");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderReceipt | null>(null);
  const [gatewayOpen, setGatewayOpen] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  /* پر کردن خودکار از حساب کاربری */
  useEffect(() => {
    if (user) {
      setName((n) => n || user.name);
      setPhone((p) => p || user.phone);
      setSavedAddresses(api.getAddresses(user.phone));
    }
  }, [user]);

  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const payable = subtotal - discount;
  const freeShipping = payable >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = freeShipping ? 0 : (SHIPPING_METHODS.find((s) => s.id === shipping)?.cost ?? 0);
  const total = payable + shippingCost;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("کد تخفیف را وارد کنید.");
      return;
    }
    const percent = COUPONS[code];
    if (percent) {
      setCoupon({ code, percent });
      setCouponError("");
      setCouponInput("");
    } else {
      setCoupon(null);
      setCouponError("کد تخفیف معتبر نیست یا منقضی شده است.");
    }
  };

  const validate = () => {
    const next: typeof errors = {};
    if (name.trim().length < 3) next.name = "نام و نام‌خانوادگی را کامل وارد کنید.";
    if (!isValidPhone(phone)) next.phone = "شماره‌ی تماس معتبر نیست؛ مثال: ۰۹۱۲۳۴۵۶۷۸۹";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** ثبت نهایی سفارش روی «سرور» */
  const finalize = async () => {
    setSubmitting(true);
    const saved = await api.submitOrder({
      name: name.trim(),
      phone: phone.trim(),
      shippingLabel: SHIPPING_METHODS.find((s) => s.id === shipping)?.label ?? "",
      paymentLabel: PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? "",
      items: items.map((i) => ({ name: i.product.shortName, qty: i.qty, price: i.product.price })),
      subtotal,
      discount,
      shippingCost,
      total,
    });
    setOrder({
      code: saved.code,
      date: saved.date,
      name: saved.name,
      shippingLabel: saved.shippingLabel,
      paymentLabel: saved.paymentLabel,
      total: saved.total,
    });
    sendSms(
      `آتش‌ودانه\nسفارش شما با موفقیت ثبت شد.\nکد پیگیری: ${saved.code}\nوضعیت: در حال آماده‌سازی ☕`,
    );
    clearCart();
    refreshProducts();
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    confetti({
      particleCount: 140,
      spread: 75,
      origin: { y: 0.55 },
      colors: ["#c49a6c", "#d4a574", "#558b2f", "#f3e3cd", "#8a6138"],
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    /* بررسی موجودی انبار */
    for (const { product, qty } of items) {
      if (qty > stockOf(product)) {
        pushToast(`متأسفانه فقط ${faDigits(stockOf(product))} عدد از «${product.shortName}» موجود است`, "error");
        return;
      }
    }
    if (payment === "online") {
      setGatewayOpen(true);
    } else {
      void finalize();
    }
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
          {order.name} عزیز، قهوه‌ی شما همین حالا در صف برشت‌خانه قرار گرفت. جزئیات سفارش برایتان
          پیامک شد و از بخش «سفارش‌های من» قابل پیگیری است.
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
            onClick={() => setOrdersOpen(true)}
            className="flex items-center gap-2 rounded-full bg-roast-900 px-7 py-3.5 text-sm font-bold text-cream-50 transition-all duration-300 hover:bg-roast-800 active:scale-95"
          >
            <PackageIcon className="h-4.5 w-4.5" />
            پیگیری سفارش
          </button>
          <button
            onClick={() => navigate("/", { state: { scrollTo: "shop" } })}
            className="rounded-full bg-gold-600 px-7 py-3.5 text-sm font-bold text-roast-950 transition-all duration-300 hover:bg-gold-500 active:scale-95"
          >
            بازگشت به فروشگاه
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
          onClick={() => navigate("/", { state: { scrollTo: "shop" } })}
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
        onClick={() => navigate("/", { state: { scrollTo: "shop" } })}
        className="group flex items-center gap-2 rounded-full border border-roast-900/15 bg-cream-50 px-4 py-2.5 text-sm font-bold text-roast-700 shadow-card transition-all hover:border-gold-600 hover:text-gold-700 active:scale-95"
      >
        <BackIcon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
        بازگشت به فروشگاه
      </button>

      <h1 className="font-display mt-6 text-3xl text-roast-900 md:text-4xl">تسویه‌حساب</h1>
      <p className="mt-2 text-sm text-roast-600">
        اطلاعات گیرنده را وارد کنید؛ فاصله‌ی شما تا قهوه‌ی تازه فقط چند کلیک است.
      </p>

      {/* دعوت به ورود */}
      {!user && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-600/40 bg-gold-500/12 px-5 py-4">
          <p className="flex items-center gap-2.5 text-sm font-bold text-roast-800">
            <UserIcon className="h-5 w-5 text-gold-700" />
            با ورود، اطلاعات‌تان خودکار پر می‌شود و سفارش‌ها قابل پیگیری‌اند.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="rounded-full bg-roast-900 px-5 py-2.5 text-xs font-bold text-cream-50 transition-all hover:bg-roast-800 active:scale-95"
          >
            ورود / ثبت‌نام
          </button>
        </div>
      )}

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
                  className={`w-full rounded-xl border-2 bg-cream-100/60 px-4 py-3 text-left text-sm text-roast-900 placeholder:text-roast-900/30 transition-all focus:outline-none focus:ring-4 ${
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
                {savedAddresses.length > 0 && (
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    {savedAddresses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAddress(a.text)}
                        className="flex items-center gap-1.5 rounded-full border border-gold-600/35 bg-gold-500/10 px-3.5 py-1.5 text-[11px] font-bold text-gold-700 transition-all hover:bg-gold-500/25 active:scale-95"
                      >
                        <PinIcon className="h-3.5 w-3.5" />
                        {a.title} — {a.receiver}
                      </button>
                    ))}
                  </div>
                )}
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
                      {freeShipping ? "رایگان 🎉" : m.cost === 0 ? "رایگان" : formatToman(m.cost)}
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

            {/* کد تخفیف */}
            <div className="mt-4 border-t border-roast-900/10 pt-4">
              {coupon ? (
                <div className="animate-fade-up flex items-center justify-between gap-3 rounded-xl bg-olive-600/12 px-4 py-3">
                  <p className="text-xs font-bold text-olive-700">
                    کد <span dir="ltr">{coupon.code}</span> اعمال شد — {faDigits(coupon.percent)}٪ تخفیف
                  </p>
                  <button
                    type="button"
                    onClick={() => setCoupon(null)}
                    aria-label="حذف کد تخفیف"
                    className="rounded-full p-1 text-olive-700 transition-all hover:bg-olive-600/15 active:scale-90"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyCoupon();
                        }
                      }}
                      placeholder="کد تخفیف (مثلاً ATASH10)"
                      aria-label="کد تخفیف"
                      dir="ltr"
                      className="min-w-0 flex-1 rounded-full border border-roast-900/15 bg-cream-100 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-roast-900 placeholder:font-sans placeholder:font-medium placeholder:normal-case placeholder:tracking-normal transition-all focus:border-gold-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="rounded-full bg-roast-900 px-5 py-2.5 text-xs font-bold text-cream-50 transition-all hover:bg-roast-800 active:scale-95"
                    >
                      اعمال
                    </button>
                  </div>
                  {couponError ? (
                    <p className="animate-fade-up mt-2 text-[11px] font-bold text-brick-600">{couponError}</p>
                  ) : (
                    <p className="mt-2 text-[11px] text-roast-600">
                      کد پیشنهادی امروز:{" "}
                      <strong dir="ltr" className="font-bold text-gold-700">
                        ATASH10
                      </strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            <dl className="mt-2 space-y-2.5 border-t border-roast-900/10 pt-4 text-sm">
              <div className="flex justify-between text-roast-600">
                <dt>جمع کالاها</dt>
                <dd className="font-bold text-roast-900">{formatToman(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="animate-fade-up flex justify-between text-olive-700">
                  <dt>
                    تخفیف (<span dir="ltr">{coupon?.code}</span>)
                  </dt>
                  <dd className="font-extrabold">− {formatToman(discount)}</dd>
                </div>
              )}
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
              ) : payment === "online" ? (
                <>
                  <CardIcon className="h-5 w-5" />
                  پرداخت آنلاین و ثبت سفارش
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  تأیید و ثبت سفارش
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-roast-600">
              درگاه پرداخت این نسخه شبیه‌سازی شده و مبلغی از حساب شما کسر نمی‌شود.
            </p>
          </div>
        </aside>
      </form>

      {/* ═══ درگاه پرداخت بانکی ═══ */}
      <PaymentGateway
        open={gatewayOpen}
        amount={total}
        onSuccess={() => {
          setGatewayOpen(false);
          void finalize();
        }}
        onCancel={() => {
          setGatewayOpen(false);
          pushToast("پرداخت لغو شد؛ سفارش ثبت نشد", "error");
        }}
      />
    </div>
  );
}
