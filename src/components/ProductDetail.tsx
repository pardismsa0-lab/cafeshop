import { useMemo, useState } from "react";
import { CATEGORY_LABELS, PRODUCTS, type Product } from "../data/products";
import { faDigits, formatNumber, formatToman } from "../lib/utils";
import {
  BackIcon,
  CartIcon,
  CheckIcon,
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
  onOpenProduct: (id: string) => void;
}

const MAX_QTY = 10;

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`امتیاز ${faDigits(rating.toFixed(1))} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          className={`${size} ${i <= Math.round(rating) ? "text-gold-500" : "text-roast-900/15"}`}
        />
      ))}
    </span>
  );
}

export default function ProductDetail({ product, onBack, onAdd, onOpenProduct }: Props) {
  const [qty, setQty] = useState(1);
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const spec = [
    { icon: FlameIcon, label: "تاریخ برشت", value: product.details.roastDate },
    { icon: PinIcon, label: "خاستگاه", value: product.details.origin },
    { icon: LeafIcon, label: "روش فرآوری", value: product.details.process },
    { icon: ScaleIcon, label: "ارتفاع کشت", value: product.details.altitude },
  ];

  const related = useMemo(() => {
    const others = PRODUCTS.filter((p) => p.id !== product.id);
    const sameCategory = others.filter((p) => p.category === product.category);
    const rest = others.filter((p) => p.category !== product.category);
    return [...sameCategory, ...rest.sort((a, b) => b.popularity - a.popularity)].slice(0, 3);
  }, [product]);

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
              <Stars rating={product.rating} />
              {faDigits(product.rating.toFixed(1))}
              <a
                href="#reviews"
                className="font-medium text-roast-600 underline decoration-gold-600/50 underline-offset-4 transition-colors hover:text-gold-700"
              >
                ({faDigits(product.reviews)} نظر)
              </a>
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

      {/* ═══════════ نظرات مشتریان ═══════════ */}
      <section id="reviews" className="mt-16 scroll-mt-44 grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-gold-700">
            <span className="h-px w-8 bg-gold-600" />
            دیدگاه خریداران
          </p>
          <h2 className="font-display mt-3 text-3xl text-roast-900">نظرات مشتریان</h2>

          <div className="mt-5 rounded-xl border border-roast-900/10 bg-roast-900 p-6 text-cream-100 shadow-lift">
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl leading-none text-gold-400">
                {faDigits(product.rating.toFixed(1))}
              </span>
              <div className="pb-1">
                <Stars rating={product.rating} size="h-4.5 w-4.5" />
                <p className="mt-1.5 text-[11px] text-cream-200/60">
                  از مجموع {faDigits(product.reviews)} نظر ثبت‌شده
                </p>
              </div>
            </div>
            <p className="mt-4 border-t border-gold-500/15 pt-4 text-xs leading-6 text-cream-200/70">
              همه‌ی نظرات پس از تأیید خرید، بدون دستکاری منتشر می‌شوند.
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          {product.customerReviews.map((r, idx) => {
            const hasVoted = voted[r.id];
            return (
              <li
                key={r.id}
                className="animate-fade-up rounded-xl border border-roast-900/10 bg-cream-50 p-5 shadow-card transition-all duration-300 hover:border-gold-600/40 hover:shadow-lift"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-display grid h-11 w-11 place-items-center rounded-full bg-gold-500/25 text-xl text-gold-700">
                      {r.author.trim()[0]}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-roast-900">
                        {r.author}
                        {r.verified && (
                          <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-olive-600/12 px-2 py-0.5 text-[10px] font-bold text-olive-600">
                            <CheckIcon className="h-3 w-3" strokeWidth={3} />
                            خرید تأییدشده
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-roast-600">{r.date}</p>
                    </div>
                  </div>
                  <Stars rating={r.rating} size="h-3.5 w-3.5" />
                </div>
                <p className="mt-3.5 text-sm leading-8 text-roast-700">{r.text}</p>
                <button
                  onClick={() => setVoted((v) => ({ ...v, [r.id]: true }))}
                  disabled={hasVoted}
                  className={`mt-3.5 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all duration-300 active:scale-95 ${
                    hasVoted
                      ? "bg-olive-600/15 text-olive-600"
                      : "bg-roast-900/6 text-roast-600 hover:bg-gold-500/20 hover:text-gold-700"
                  }`}
                >
                  {hasVoted ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                  {hasVoted ? "رأی شما ثبت شد" : "مفید بود"} ({faDigits(r.helpful + (hasVoted ? 1 : 0))})
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ═══════════ شاید بپسندید ═══════════ */}
      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold text-gold-700">
              <span className="h-px w-8 bg-gold-600" />
              پیشنهاد برشت‌خانه
            </p>
            <h2 className="font-display mt-3 text-3xl text-roast-900">شاید این‌ها را هم بپسندید</h2>
          </div>
          <button
            onClick={onBack}
            className="hidden rounded-full border border-roast-900/15 px-5 py-2.5 text-xs font-bold text-roast-700 transition-all hover:border-gold-600 hover:text-gold-700 sm:block"
          >
            دیدن همه‌ی محصولات
          </button>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-3">
          {related.map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-xl border border-roast-900/8 bg-cream-50 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
            >
              <button
                onClick={() => onOpenProduct(p.id)}
                className="block aspect-[4/3] w-full overflow-hidden bg-cream-200"
                aria-label={`مشاهده‌ی ${p.name}`}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                />
              </button>
              <div className="p-4">
                <h3 className="line-clamp-1 text-sm font-extrabold text-roast-900">
                  <button
                    onClick={() => onOpenProduct(p.id)}
                    className="transition-colors hover:text-gold-700"
                  >
                    {p.name}
                  </button>
                </h3>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-gold-700">
                    {formatNumber(p.price)}
                    <span className="text-[10px] font-bold text-gold-700/75"> تومان</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onAdd(p, 1)}
                      aria-label={`افزودن ${p.shortName} به سبد`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-roast-800 text-cream-50 transition-all duration-300 hover:bg-gold-600 hover:text-roast-950 active:scale-90"
                    >
                      <CartIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenProduct(p.id)}
                      className="rounded-full border border-roast-900/15 px-3.5 py-2 text-[11px] font-bold text-roast-700 transition-all hover:border-gold-600 hover:text-gold-700 active:scale-95"
                    >
                      مشاهده
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
