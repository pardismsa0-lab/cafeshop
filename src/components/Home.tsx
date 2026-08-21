import { useMemo, useState } from "react";
import {
  CATEGORY_FILTERS,
  HERO_IMAGE,
  PRODUCTS,
  SORT_OPTIONS,
  type CategoryId,
  type Product,
  type SortKey,
} from "../data/products";
import { useReveal } from "../lib/hooks";
import { faDigits, formatNumber } from "../lib/utils";
import {
  ArrowIcon,
  BeanIcon,
  CartIcon,
  ChevronDownIcon,
  FlameIcon,
  LeafIcon,
  PackageIcon,
  ScaleIcon,
  SearchIcon,
  StarIcon,
  SteamIcon,
} from "./icons";

interface Props {
  products: Product[];
  query: string;
  onQueryChange: (q: string) => void;
  category: CategoryId | "all";
  onCategoryChange: (c: CategoryId | "all") => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  onOpenProduct: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onNav: (id: string) => void;
  onToast: (msg: string, kind?: "success" | "error") => void;
}

const MARQUEE_ITEMS = [
  "برشت تازه‌ی هفتگی، سه‌شنبه‌ها",
  "ارسال رایگان بالای ۵۰۰ هزار تومان",
  "ضمانت اصالت و تازگی دانه",
  "بسته‌بندی با سوپاپ تازه‌نگهدار",
  "مشاوره‌ی رایگان دم‌آوری",
  "خرید مستقیم از کشاورز",
];

const ROAST_STEPS = [
  {
    title: "انتخاب دانه‌ی سبز",
    text: "خرید مستقیم از کشاورز؛ فقط لات‌هایی با امتیاز SCA بالای ۸۴.",
  },
  {
    title: "برشت در دسته‌های کوچک",
    text: "هر ۱۲ کیلوگرم جداگانه و با پروفایل دماییِ اختصاصی همان خاستگاه.",
  },
  {
    title: "استراحت و کنترل کیفی",
    text: "۲۴ ساعت گاززدایی، سپس چشایی آزمایشگاهی توسط تیم کیوگریدر.",
  },
  {
    title: "بسته‌بندی با سوپاپ",
    text: "همان روز برشت، با درج تاریخ روی پاکت و سوپاپ یک‌طرفه‌ی عطر.",
  },
];

const INTENSITY_GUIDE = [
  {
    label: "برشت روشن",
    level: 2,
    text: "اسیدیته‌ی روشن و عطر گلی؛ بهترین انتخاب برای دم‌آوری‌های دمی مثل V60.",
  },
  {
    label: "برشت مدیوم",
    level: 3,
    text: "تعادل شیرینی و بدنه؛ قهوه‌ای همه‌فن‌حریف برای موکاپات و فرنچ‌پرس.",
  },
  {
    label: "برشت تیره",
    level: 5,
    text: "تلخی دلپذیر کاکائویی و کرمای فراوان؛ ساخته‌شده برای شات اسپرسو.",
  },
];

function ProductCard({
  product,
  onOpen,
  onAdd,
}: {
  product: Product;
  onOpen: (id: string) => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <article className="reveal group flex flex-col overflow-hidden rounded-xl border border-roast-900/8 bg-cream-50 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-cream-200"
        onClick={() => onOpen(product.id)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-roast-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {product.badge && (
          <span
            className={`absolute top-3 start-3 rounded-full px-3 py-1 text-[11px] font-bold shadow-card ${
              product.badge === "bestseller"
                ? "bg-gold-500 text-roast-950"
                : "bg-olive-600 text-cream-50"
            }`}
          >
            {product.badge === "bestseller" ? "پرفروش" : "جدید"}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          aria-label={`افزودن ${product.shortName} به سبد خرید`}
          className="absolute bottom-3 end-3 grid h-11 w-11 place-items-center rounded-full bg-roast-900/90 text-cream-50 shadow-lift backdrop-blur-sm transition-all duration-300 hover:bg-gold-600 hover:text-roast-950 active:scale-90 max-md:opacity-100 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <CartIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-gold-700">
            {product.category === "whole"
              ? "دانه‌ی کامل"
              : product.category === "ground"
                ? "آسیاب‌شده"
                : "کپسولی"}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-roast-700">
            <StarIcon className="h-3.5 w-3.5 text-gold-500" />
            {faDigits(product.rating.toFixed(1))}
          </span>
        </div>

        <h3 className="mt-2 text-start text-lg font-extrabold leading-8 text-roast-900">
          <button
            onClick={() => onOpen(product.id)}
            className="text-start transition-colors duration-300 hover:text-gold-700"
          >
            {product.name}
          </button>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-roast-600/90">{product.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-roast-900/8 pt-4">
          <p className="text-[20px] font-extrabold leading-none text-gold-700">
            {formatNumber(product.price)}
            <span className="text-xs font-bold text-gold-700/75"> تومان</span>
          </p>
          <button
            onClick={() => onAdd(product)}
            className="flex items-center gap-1.5 rounded-full bg-roast-800 px-4 py-2.5 text-xs font-bold text-cream-50 transition-all duration-300 hover:bg-gold-600 hover:text-roast-950 active:scale-95"
          >
            <CartIcon className="h-4 w-4" />
            افزودن به سبد
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Home(props: Props) {
  const {
    products,
    query,
    onQueryChange,
    category,
    onCategoryChange,
    sort,
    onSortChange,
    onOpenProduct,
    onAddToCart,
    onNav,
    onToast,
  } = props;

  const ref = useReveal<HTMLDivElement>([props.products, props.category, props.sort]);
  const [email, setEmail] = useState("");

  const counts = useMemo(() => {
    const c: Record<CategoryId | "all", number> = { all: PRODUCTS.length, whole: 0, ground: 0, capsule: 0 };
    PRODUCTS.forEach((p) => c[p.category]++);
    return c;
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      onToast("نشانی ایمیل معتبر نیست؛ دوباره تلاش کنید.", "error");
      return;
    }
    onToast("عضویت شما ثبت شد؛ خوش آمدید به خانواده‌ی آتش‌ودانه ☕");
    setEmail("");
  };

  return (
    <div ref={ref}>
      {/* ═══════════ بنر خوش‌آمدگویی ═══════════ */}
      <section id="top" className="relative overflow-hidden bg-roast-900 text-cream-100">
        {/* حلقه‌های قهوه‌ی پس‌زمینه */}
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -top-28 -end-28 h-96 w-96 text-gold-500/12"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <circle cx="100" cy="100" r="92" strokeWidth="8" />
          <circle cx="100" cy="100" r="62" strokeWidth="4" />
          <circle cx="100" cy="100" r="30" strokeWidth="2" />
        </svg>
        <BeanIcon className="animate-floaty pointer-events-none absolute top-24 start-[8%] hidden h-10 w-10 rotate-45 text-gold-500/25 lg:block" />
        <BeanIcon
          className="animate-floaty pointer-events-none absolute bottom-16 start-[44%] hidden h-7 w-7 -rotate-12 text-gold-500/20 lg:block"
          style={{ animationDelay: "1.6s" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 lg:grid-cols-12 lg:py-24">
          {/* متن */}
          <div className="animate-fade-up lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold text-gold-300">
              <FlameIcon className="h-4 w-4" />
              برشت‌خانه‌ی تخصصی از {faDigits(1398)}
            </p>
            <h1 className="font-display mt-6 text-[42px] leading-[1.28] text-cream-50 sm:text-5xl xl:text-[62px]">
              از شعله تا فنجان؛
              <br />
              <span className="text-gold-400">فقط {faDigits(48)} ساعت</span> فاصله است
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-8 text-cream-200/75">
              دانه‌های سبز را از شش خاستگاهِ برتر جهان انتخاب می‌کنیم، در دسته‌های کوچک برشته
              می‌کنیم و وقتی هنوز عطر برشت رویشان است، راهی خانه‌ی شما می‌کنیم.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNav("shop")}
                className="group flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-roast-950 shadow-[0_12px_30px_-10px_rgb(196_154_108/0.7)] transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_16px_36px_-10px_rgb(212_165_116/0.8)] active:scale-95"
              >
                دیدن قهوه‌های تازه
                <ArrowIcon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
              <button
                onClick={() => onNav("roast")}
                className="rounded-full border border-cream-100/25 px-7 py-3.5 text-sm font-semibold text-cream-100 transition-all duration-300 hover:border-gold-400 hover:text-gold-300"
              >
                راهنمای برشت
              </button>
            </div>

            <dl className="mt-11 flex flex-wrap gap-x-10 gap-y-5">
              {[
                { value: faDigits(6), label: "خاستگاه فعال" },
                { value: faDigits("4.6"), label: "میانگین امتیاز مشتریان" },
                { value: faDigits(48), label: "ساعت، از برشت تا ارسال" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-3xl text-gold-400">{s.value}</dd>
                  <dd className="mt-1 text-xs text-cream-200/60">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* تصویر */}
          <div className="animate-fade-up relative lg:col-span-6" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-4 -rotate-2 rounded-[22px] border border-gold-500/20" aria-hidden />
            <img
              src={HERO_IMAGE}
              alt="صحنه‌ی برشت و دم‌آوری قهوه در برشت‌خانه‌ی آتش‌ودانه"
              className="relative aspect-[4/3] w-full rounded-xl object-cover shadow-lift"
            />
            <SteamIcon className="pointer-events-none absolute top-5 start-1/3 h-14 w-14 text-cream-50/85" />
            <span className="animate-floaty absolute -top-5 end-6 flex items-center gap-2 rounded-full border border-gold-500/30 bg-roast-800/95 px-4 py-2 text-xs font-bold text-cream-100 shadow-lift backdrop-blur-sm">
              <BeanIcon className="h-4 w-4 text-gold-400" />
              تازه‌برشت؛ برداشت {faDigits(2025)}
            </span>
            <div className="animate-floaty absolute -bottom-7 start-5 flex items-center gap-3 rounded-xl bg-cream-50 p-4 pe-6 text-roast-900 shadow-lift">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-500/20 text-gold-700">
                <FlameIcon className="h-5.5 w-5.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-roast-600">برشت این هفته</p>
                <p className="text-sm font-extrabold">اتیوپی یرگاچف</p>
                <span className="mt-0.5 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} className="h-3 w-3 text-gold-500" />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ نوار متحرک ═══════════ */}
      <div dir="ltr" className="overflow-hidden border-y border-gold-500/15 bg-roast-950 py-3.5">
        <div className="animate-marquee flex w-max items-center">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-8 pe-8 text-sm font-medium whitespace-nowrap text-gold-400/90">
              <span dir="rtl">{item}</span>
              <BeanIcon className="h-3.5 w-3.5 text-gold-600" />
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════ فروشگاه ═══════════ */}
      <section id="shop" className="mx-auto max-w-6xl scroll-mt-44 px-4 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="reveal">
            <p className="flex items-center gap-2 text-xs font-bold text-gold-700">
              <span className="h-px w-8 bg-gold-600" />
              فروشگاه
            </p>
            <h2 className="font-display mt-3 text-3xl text-roast-900 md:text-4xl">تازه‌برشت‌های این هفته</h2>
            <p className="mt-2 text-sm text-roast-600">
              شش لاتِ برگزیده؛ برشتِ روزهای اخیر با تاریخ روی پاکت
            </p>
          </div>
        </div>

        {/* نوار ابزار: فیلتر دسته + مرتب‌سازی */}
        <div className="reveal mt-9 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap gap-2" role="group" aria-label="فیلتر دسته‌بندی">
            {CATEGORY_FILTERS.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onCategoryChange(c.id)}
                  aria-pressed={active}
                  className={`flex items-center rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                    active
                      ? "border-roast-900 bg-roast-900 text-cream-50 shadow-card"
                      : "border-roast-900/15 bg-cream-50 text-roast-700 hover:border-gold-600 hover:text-gold-700"
                  }`}
                >
                  {c.label}
                  <span
                    className={`ms-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active ? "bg-gold-500 text-roast-950" : "bg-roast-900/8 text-roast-600"
                    }`}
                  >
                    {faDigits(counts[c.id])}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-3 text-sm text-roast-600">
            <span className="whitespace-nowrap font-semibold">مرتب‌سازی:</span>
            <span className="relative">
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortKey)}
                className="cursor-pointer appearance-none rounded-full border border-roast-900/15 bg-cream-50 py-2.5 ps-4 pe-10 text-sm font-semibold text-roast-900 shadow-card transition-colors hover:border-gold-600 focus:border-gold-600 focus:outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-700" />
            </span>
          </label>
        </div>

        {/* شمارش نتایج */}
        <p className="mt-6 text-sm text-roast-600" aria-live="polite">
          نمایش <strong className="font-extrabold text-roast-900">{faDigits(products.length)}</strong>{" "}
          محصول
          {query.trim() && (
            <>
              {" "}
              برای «<strong className="font-bold text-gold-700">{query.trim()}</strong>»
            </>
          )}
        </p>

        {/* شبکه‌ی محصولات */}
        {products.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={onOpenProduct} onAdd={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-roast-900/20 bg-cream-50/60 px-6 py-20 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-gold-600/50 text-gold-700">
              <SearchIcon className="h-8 w-8" />
            </span>
            <h3 className="font-display mt-6 text-2xl text-roast-900">چیزی پیدا نشد!</h3>
            <p className="mt-2 max-w-sm text-sm leading-7 text-roast-600">
              عبارت دیگری را امتحان کنید یا فیلترها را پاک کنید؛ شاید قهوه‌ی محبوبتان همین نزدیکی‌هاست.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onQueryChange("")}
                className="rounded-full bg-roast-900 px-6 py-3 text-sm font-bold text-cream-50 transition-all hover:bg-roast-800 active:scale-95"
              >
                پاک‌کردن جستجو
              </button>
              <button
                onClick={() => onCategoryChange("all")}
                className="rounded-full border border-roast-900/20 px-6 py-3 text-sm font-bold text-roast-800 transition-all hover:border-gold-600 hover:text-gold-700 active:scale-95"
              >
                نمایش همه‌ی محصولات
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════ روند برشت ═══════════ */}
      <section id="roast" className="relative scroll-mt-40 overflow-hidden bg-roast-800 text-cream-100">
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -bottom-32 -start-32 h-96 w-96 text-gold-500/10"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <circle cx="100" cy="100" r="92" strokeWidth="8" />
          <circle cx="100" cy="100" r="58" strokeWidth="4" />
        </svg>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="reveal">
            <p className="flex items-center gap-2 text-xs font-bold text-gold-400">
              <span className="h-px w-8 bg-gold-500" />
              روند برشت
            </p>
            <h2 className="font-display mt-3 text-3xl text-cream-50 md:text-4xl">
              آتش، صبر و یک‌دومِ گرم دقت
            </h2>
            <p className="mt-4 max-w-md text-sm leading-8 text-cream-200/70">
              برشتِ خوب یعنی شنیدنِ دانه؛ از اولین تَرقِ خشک شدن تا لحظه‌ای که عطر کارامل از
              درام بیرون می‌زند. هر خاستگاه، پروفایل خودش را دارد و ما به آن وفاداریم.
            </p>

            <ol className="mt-9 space-y-6">
              {ROAST_STEPS.map((step, i) => (
                <li key={step.title} className="group flex gap-4">
                  <span className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-500 text-xl text-roast-950 shadow-[0_8px_20px_-8px_rgb(196_154_108/0.9)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    {faDigits(i + 1)}
                  </span>
                  <div className="pt-0.5">
                    <h3 className="font-bold text-cream-50 transition-colors group-hover:text-gold-300">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-cream-200/65">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="reveal">
            <div className="rounded-xl border border-gold-500/20 bg-roast-900/70 p-7 shadow-lift">
              <div className="flex items-center gap-2.5">
                <ScaleIcon className="h-6 w-6 text-gold-400" />
                <h3 className="font-display text-2xl text-gold-400">شدت برشت کدام است؟</h3>
              </div>
              <p className="mt-2 text-xs leading-6 text-cream-200/60">
                روی پاکت هر قهوه، شدت برشت را با دانه‌های طلایی نشان می‌دهیم تا انتخاب راحت‌تری داشته باشید.
              </p>

              <div className="mt-4">
                {INTENSITY_GUIDE.map((g) => (
                  <div key={g.label} className="border-b border-gold-500/10 py-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-sm font-bold text-cream-50">{g.label}</h4>
                      <span className="flex items-center gap-1.5" aria-label={`شدت ${faDigits(g.level)} از ۵`}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`h-3.5 w-3.5 rounded-full transition-transform duration-300 ${
                              i <= g.level ? "bg-gold-500" : "bg-cream-100/15"
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-cream-200/60">{g.text}</p>
                  </div>
                ))}
              </div>

              <blockquote className="mt-6 rounded-lg border border-gold-500/25 bg-gold-500/10 p-4 text-sm leading-7 text-cream-100">
                <strong className="text-gold-300">نکته‌ی باریستا: </strong>
                برای دم‌آوری دمی، آب {faDigits(92)} درجه و نسبت ۱ به {faDigits(16)} قهوه به آب را از یاد نبرید.
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ درباره‌ی ما ═══════════ */}
      <section id="about" className="scroll-mt-40">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="reveal relative order-2 lg:order-1">
            <img
              src={HERO_IMAGE}
              alt="فضای برشت‌خانه‌ی آتش‌ودانه"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover shadow-lift"
            />
            <div className="absolute -bottom-6 end-6 rounded-xl bg-roast-900 px-6 py-4 text-cream-50 shadow-lift">
              <p className="font-display text-3xl leading-none text-gold-400">{faDigits(6)}+</p>
              <p className="mt-1.5 text-[11px] font-semibold text-cream-200/80">سال برشتِ بی‌وقفه</p>
            </div>
          </div>

          <div className="reveal order-1 lg:order-2">
            <p className="flex items-center gap-2 text-xs font-bold text-gold-700">
              <span className="h-px w-8 bg-gold-600" />
              درباره‌ی ما
            </p>
            <h2 className="font-display mt-3 text-3xl text-roast-900 md:text-4xl">
              ما قهوه را جدی می‌گیریم؛ شما فقط بنوشید
            </h2>
            <p className="mt-5 text-sm leading-8 text-roast-600">
              آتش‌ودانه از یک علاقه‌ی ساده شروع شد: چرا قهوه‌ی تازه‌برشت باید این‌قدر دور از دسترس
              باشد؟ امروز با شش خاستگاه قرارداد مستقیم داریم، هفته‌ای دو بار برشت می‌کنیم و هر
              پاکت را با تاریخ همان روز می‌بندیم.
            </p>
            <p className="mt-3 text-sm leading-8 text-roast-600">
              تیم کیوگریدر ما هر لات را پیش از ارسال می‌چشد؛ اگر لاتی به استاندارد نرسد، راهی
              فروشگاه نمی‌شود. ساده و بی‌تعارف.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-4">
              {[
                { icon: FlameIcon, value: `${faDigits("12,400")}+`, label: "فنجان در ماه" },
                { icon: LeafIcon, value: faDigits(6), label: "خاستگاه فعال" },
                { icon: StarIcon, value: faDigits("4.6"), label: "میانگین امتیاز" },
                { icon: PackageIcon, value: `٪${faDigits(98)}`, label: "مشتریان بازگشتی" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="group rounded-xl border border-roast-900/10 bg-cream-50 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <s.icon className="h-6 w-6 text-gold-600 transition-transform duration-300 group-hover:scale-110" />
                  <p className="font-display mt-3 text-2xl text-roast-900">{s.value}</p>
                  <p className="mt-1 text-xs font-semibold text-roast-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* خبرنامه */}
        <div className="mx-auto max-w-6xl px-4 pb-16 lg:pb-24">
          <div className="reveal relative overflow-hidden rounded-xl bg-roast-900 p-8 text-cream-100 shadow-lift md:p-10">
            <BeanIcon className="animate-floaty pointer-events-none absolute -top-4 -end-4 h-24 w-24 rotate-12 text-gold-500/15" />
            <div className="relative flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-start">
              <div>
                <h3 className="font-display text-2xl text-cream-50 md:text-3xl">
                  از برشت‌های سه‌شنبه باخبر شوید
                </h3>
                <p className="mt-2 text-sm text-cream-200/65">
                  هر هفته پروفایل برشت تازه و یک نکته‌ی دم‌آوری؛ بدون اسپم، قول می‌دهیم.
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ایمیل شما"
                  aria-label="ایمیل برای عضویت در خبرنامه"
                  className="min-w-0 flex-1 rounded-full border border-gold-500/25 bg-roast-800 px-5 py-3.5 text-sm text-cream-100 placeholder:text-cream-100/40 transition-all focus:border-gold-500/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-roast-950 transition-all duration-300 hover:bg-gold-400 active:scale-95"
                >
                  عضویت
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
