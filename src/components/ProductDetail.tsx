import { useState } from "react";
import { CATEGORY_LABELS, type Product } from "../data/products";
import { faDigits, formatNumber, formatToman } from "../lib/utils";
import {
  BackIcon,
  CartIcon,
  FlameIcon,
  LeafIcon,
  MinusIcon,
  PackageIcon,
  PinIcon,
  PlusIcon,
  ScaleIcon,
  ShieldIcon,
  StarIcon,
  SteamIcon,
  TruckIcon,
} from "./icons";

interface Props {
  product: Product;
  onBack: () => void;
  onAdd: (product: Product, qty: number) => void;
}

const MAX_QTY = 10;

export default function ProductDetail({ product, onBack, onAdd }: Props) {
  const [qty, setQty] = useState(1);

  const spec = [
    { icon: FlameIcon, label: "تاریخ برشت", value: product.details.roastDate },
    { icon: PinIcon, label: "خاستگاه", value: product.details.origin },
    { icon: LeafIcon, label: "روش فرآوری", value: product.details.process },
    { icon: ScaleIcon, label: "ارتفاع کشت", value: product.details.altitude },
  ];

  return (
    <div className="animate-fade-up mx-auto max-w-6xl px-4 py-10">
      {/* بازگشت */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-roast-900/15 bg-cream-50 px-4 py-2.5 text-sm font-bold text-roast-700 shadow-card transition-all duration-300 hover:border-gold-600 hover:text-gold-700 active:scale-95"
      >
        <BackIcon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
        بازگشت به فروشگاه
      </button>

      {/* breadcrumb */}
      <nav className="mt-5 flex items-center gap-2 text-xs text-roast-600" aria-label="مسیر">
        <button onClick={onBack} className="transition-colors hover:text-gold-700">
          فروشگاه
        </button>
        <span className="text-roast-900/30">/</span>
        <span className="transition-colors">{CATEGORY_LABELS[product.category]}</span>
        <span className="text-roast-900/30">/</span>
        <span className="font-bold text-gold-700">{product.shortName}</span>
      </nav>

      <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* تصویر */}
        <div className="relative">
          <div className="absolute -inset-4 rotate-1 rounded-[22px] border border-gold-600/25" aria-hidden />
          <div className="relative overflow-hidden rounded-xl shadow-lift">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
            {product.badge && (
              <span
                className={`absolute top-4 start-4 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-card ${
                  product.badge === "bestseller"
                    ? "bg-gold-500 text-roast-950"
                    : "bg-olive-600 text-cream-50"
                }`}
              >
                {product.badge === "bestseller" ? "پرفروش" : "جدید"}
              </span>
            )}
          </div>
          <SteamIcon className="pointer-events-none absolute -top-3 start-1/4 h-14 w-14 text-roast-900/40" />
          <span className="animate-floaty absolute -bottom-5 end-6 flex items-center gap-2 rounded-full bg-roast-900 px-5 py-2.5 text-xs font-bold text-cream-100 shadow-lift">
            <FlameIcon className="h-4 w-4 text-gold-400" />
            برشت: {product.details.roastDate}
          </span>
        </div>

        {/* اطلاعات */}
        <div className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-gold-500/20 px-3.5 py-1.5 text-[11px] font-bold text-gold-700">
              {CATEGORY_LABELS[product.category]}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-roast-700">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i <= Math.round(product.rating) ? "text-gold-500" : "text-roast-900/15"}`}
                  />
                ))}
              </span>
              {faDigits(product.rating.toFixed(1))}
              <span className="font-medium text-roast-600">
                ({faDigits(product.reviews)} نظر)
              </span>
            </span>
          </div>

          <h1 className="font-display mt-4 text-3xl leading-[1.4] text-roast-900 md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-[15px] leading-8 text-roast-600">{product.longDescription}</p>

          <p className="mt-6 text-[24px] font-extrabold leading-none text-gold-700">
            {formatNumber(product.price)}
            <span className="text-sm font-bold text-gold-700/75"> تومان</span>
            <span className="ms-3 align-middle text-[11px] font-semibold text-olive-600">
              ● موجود در انبار برشت‌خانه
            </span>
          </p>

          {/* مشخصات */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            {spec.map((s) => (
              <div
                key={s.label}
                className="group rounded-xl border border-roast-900/10 bg-cream-50 p-4 shadow-card transition-all duration-300 hover:border-gold-600/50"
              >
                <p className="flex items-center gap-2 text-[11px] font-bold text-roast-600">
                  <s.icon className="h-4 w-4 text-gold-600 transition-transform duration-300 group-hover:scale-110" />
                  {s.label}
                </p>
                <p className="mt-1.5 text-sm font-extrabold text-roast-900">{s.value}</p>
              </div>
            ))}
            {/* شدت برشت */}
            <div className="col-span-2 flex items-center justify-between gap-4 rounded-xl border border-roast-900/10 bg-roast-900 p-4 text-cream-100 shadow-card">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold text-cream-200/70">
                  <FlameIcon className="h-4 w-4 text-gold-400" />
                  شدت برشت: {product.details.roastLevel}
                </p>
                <p className="mt-1.5 text-xs text-cream-200/60">
                  روی پاکت با دانه‌های طلایی نشان داده می‌شود
                </p>
              </div>
              <span className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`h-4 w-4 rounded-full ${i <= product.details.intensity ? "bg-gold-500" : "bg-cream-100/20"}`}
                  />
                ))}
              </span>
            </div>
          </div>

          {/* نت‌های طعمی */}
          <div className="mt-6">
            <p className="text-xs font-bold text-roast-600">نت‌های طعمی این لات:</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {product.details.tastingNotes.map((n) => (
                <span
                  key={n}
                  className="rounded-full border border-gold-600/35 bg-gold-500/12 px-4 py-1.5 text-xs font-bold text-gold-700 transition-colors hover:bg-gold-500/25"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* تعداد + افزودن */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border-2 border-roast-900/15 bg-cream-50 shadow-card">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="کاهش تعداد"
                className="grid h-12 w-12 place-items-center rounded-full text-roast-800 transition-all hover:text-brick-600 active:scale-90 disabled:opacity-25 disabled:hover:text-roast-800"
              >
                <MinusIcon className="h-4.5 w-4.5" />
              </button>
              <span key={qty} className="animate-pop w-10 text-center text-lg font-extrabold text-roast-900">
                {faDigits(qty)}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                disabled={qty >= MAX_QTY}
                aria-label="افزایش تعداد"
                className="grid h-12 w-12 place-items-center rounded-full text-roast-800 transition-all hover:text-olive-600 active:scale-90 disabled:opacity-25 disabled:hover:text-roast-800"
              >
                <PlusIcon className="h-4.5 w-4.5" />
              </button>
            </div>

            <button
              onClick={() => onAdd(product, qty)}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-full bg-gold-600 px-6 py-3.5 text-sm font-bold text-roast-950 shadow-[0_12px_28px_-10px_rgb(168_124_78/0.8)] transition-all duration-300 hover:bg-gold-500 active:scale-[0.97] min-w-52"
            >
              <CartIcon className="h-5 w-5" />
              افزودن به سبد — {formatToman(product.price * qty)}
            </button>
          </div>
          {qty >= MAX_QTY && (
            <p className="mt-2.5 text-xs font-semibold text-brick-600">
              حداکثر {faDigits(10)} عدد از هر محصول قابل سفارش است.
            </p>
          )}

          {/* اعتماد */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-roast-900/10 pt-6 text-xs font-semibold text-roast-600">
            <span className="flex items-center gap-2">
              <TruckIcon className="h-4.5 w-4.5 text-gold-700" /> ارسال ۲۴ تا ۴۸ ساعته
            </span>
            <span className="flex items-center gap-2">
              <ShieldIcon className="h-4.5 w-4.5 text-gold-700" /> ضمانت اصالت دانه
            </span>
            <span className="flex items-center gap-2">
              <PackageIcon className="h-4.5 w-4.5 text-gold-700" /> سوپاپ تازه‌نگهدار
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
