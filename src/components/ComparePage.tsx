import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORY_LABELS, CUPPING_SCORES, type Product } from "../data/products";
import { stockOf } from "../lib/api";
import { usePageMeta } from "../lib/seo";
import { useShop } from "../lib/shop-context";
import { faDigits, formatNumber } from "../lib/utils";
import { BeanIcon, CartIcon, ChevronDownIcon, CloseIcon, FlameIcon, ScaleIcon, StarIcon } from "./icons";

function CuppingBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-roast-600 dark:text-cream-200/70">{label}</span>
        <span className="text-gold-700 dark:text-gold-400">{faDigits(value)} از ۵</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
              i <= value ? "bg-gradient-to-l from-gold-500 to-gold-600" : "bg-roast-900/10 dark:bg-cream-100/10"
            }`}
            style={{ transitionDelay: `${delay + i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  usePageMeta("مقایسه‌ی قهوه‌ها | آتش‌ودانه", "دو قهوه را کنار هم بگذارید؛ اسیدیته، بدنه، شیرینی و نت‌های طعمی را مقایسه کنید.");
  const navigate = useNavigate();
  const { products, productsLoading, compareIds, toggleCompare, clearCompare, addToCart } = useShop();

  const [colA, setColA] = useState<string | null>(null);
  const [colB, setColB] = useState<string | null>(null);

  const idA = colA ?? compareIds[0];
  const idB = colB ?? compareIds[1];
  const productA = products.find((p) => p.id === idA);
  const productB = products.find((p) => p.id === idB);
  const columns = [productA, productB].filter((p): p is Product => Boolean(p));

  const pick = (slot: "a" | "b") => (id: string) => {
    if (!id) return;
    const other = slot === "a" ? idB : idA;
    if (other === id) {
      /* جابه‌جایی دو ستون */
      if (slot === "a") {
        setColA(id);
        setColB(idA ?? null);
      } else {
        setColB(id);
        setColA(idB ?? null);
      }
      return;
    }
    if (slot === "a") setColA(id);
    else setColB(id);
  };

  const swapSelect = (slot: "a" | "b", current: string) => (
    <span className="relative block">
      <select
        value={current}
        onChange={(e) => pick(slot)(e.target.value)}
        aria-label="تغییر محصول ستون"
        className="w-full cursor-pointer appearance-none rounded-full border border-roast-900/15 bg-cream-100 py-2 ps-4 pe-9 text-xs font-bold text-roast-900 transition-colors hover:border-gold-600 focus:border-gold-600 focus:outline-none dark:border-gold-500/20 dark:bg-roast-900 dark:text-cream-100"
      >
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.shortName}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute end-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gold-700 dark:text-gold-400" />
    </span>
  );

  return (
    <div className="animate-fade-up mx-auto max-w-5xl px-4 py-10 dark:text-cream-100">
      <button
        onClick={() => navigate("/", { state: { scrollTo: "shop" } })}
        className="group flex items-center gap-2 rounded-full border border-roast-900/15 bg-cream-50 px-4 py-2.5 text-sm font-bold text-roast-700 shadow-card transition-all hover:border-gold-600 hover:text-gold-700 active:scale-95 dark:border-gold-500/20 dark:bg-roast-800 dark:text-cream-200"
      >
        <CloseIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
        بازگشت به فروشگاه
      </button>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-gold-700 dark:text-gold-400">
            <ScaleIcon className="h-4.5 w-4.5" />
            برگه‌ی کاپینگ
          </p>
          <h1 className="font-display mt-2 text-3xl text-roast-900 md:text-4xl dark:text-cream-50">
            دو فنجان، رو در رو
          </h1>
          <p className="mt-2 text-sm text-roast-600 dark:text-cream-200/70">
            امتیازهای حسی هر لات را — مثل جلسه‌ی کاپینگ برشت‌خانه — کنار هم ببینید.
          </p>
        </div>
        {compareIds.length > 0 && (
          <button
            onClick={() => {
              clearCompare();
              setColA(null);
              setColB(null);
            }}
            className="text-xs font-bold text-brick-600 underline decoration-brick-600/40 underline-offset-4 hover:text-brick-500"
          >
            پاک‌کردن انتخاب‌ها
          </button>
        )}
      </div>

      {productsLoading ? (
        <div className="mt-8 grid animate-pulse gap-6 md:grid-cols-2">
          <div className="h-96 rounded-xl bg-roast-900/10 dark:bg-cream-100/10" />
          <div className="h-96 rounded-xl bg-roast-900/10 dark:bg-cream-100/10" />
        </div>
      ) : columns.length < 2 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border-2 border-dashed border-gold-600/40 bg-cream-50/70 px-6 py-16 text-center dark:bg-roast-800/50">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400">
            <ScaleIcon className="h-9 w-9" />
          </span>
          <h2 className="font-display mt-6 text-2xl text-roast-900 dark:text-cream-50">یک فنجان دیگر لازم است!</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-roast-600 dark:text-cream-200/70">
            برای مقایسه، از فروشگاه روی دکمه‌ی ترازوی دو محصول بزنید — یا همین‌جا از فهرست انتخاب کنید:
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {products
              .filter((p) => !columns.some((c) => c.id === p.id))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => pick(columns.length === 0 ? "a" : "b")(p.id)}
                  className="rounded-full border border-roast-900/15 bg-cream-50 px-4 py-2 text-xs font-bold text-roast-800 transition-all hover:border-gold-600 hover:text-gold-700 active:scale-95 dark:border-gold-500/20 dark:bg-roast-800 dark:text-cream-100"
                >
                  + {p.shortName}
                </button>
              ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {columns.map((p, colIdx) => {
            const scores = CUPPING_SCORES[p.id] ?? { acidity: 3, body: 3, sweetness: 3, aroma: 3 };
            const stock = stockOf(p);
            const soldOut = stock === 0;
            return (
              <article
                key={p.id}
                className="animate-fade-up overflow-hidden rounded-xl border border-roast-900/10 bg-cream-50 shadow-card dark:border-gold-500/15 dark:bg-roast-800"
                style={{ animationDelay: `${colIdx * 0.12}s` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-cream-200 dark:bg-roast-900">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.05]"
                  />
                  <button
                    onClick={() => {
                      toggleCompare(p.id);
                      if (colIdx === 0) setColA(null);
                      else setColB(null);
                    }}
                    aria-label={`حذف ${p.shortName} از مقایسه`}
                    className="absolute top-3 end-3 grid h-9 w-9 place-items-center rounded-full bg-roast-950/80 text-cream-50 backdrop-blur-sm transition-all hover:bg-brick-600 active:scale-90"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-3 start-3 rounded-full bg-cream-50/95 px-3 py-1.5 text-[11px] font-extrabold text-roast-900 shadow-card">
                    {CATEGORY_LABELS[p.category]}
                  </span>
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-extrabold leading-7 text-roast-900 dark:text-cream-50">{p.name}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-roast-700 dark:text-cream-200">
                        <StarIcon className="h-3.5 w-3.5 text-gold-500" />
                        {faDigits(p.rating.toFixed(1))}
                        <span className="text-roast-600/80 dark:text-cream-200/60">({faDigits(p.reviews)} نظر)</span>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="shrink-0 text-[11px] font-bold text-gold-700 underline decoration-gold-600/50 underline-offset-4 hover:text-gold-600 dark:text-gold-400"
                    >
                      جزئیات
                    </button>
                  </div>

                  {swapSelect(colIdx === 0 ? "a" : "b", p.id)}

                  <div className="space-y-3 rounded-xl bg-cream-100/70 p-4 dark:bg-roast-900/60">
                    <CuppingBar label="اسیدیته" value={scores.acidity} delay={colIdx * 150} />
                    <CuppingBar label="بدنه" value={scores.body} delay={colIdx * 150 + 80} />
                    <CuppingBar label="شیرینی" value={scores.sweetness} delay={colIdx * 150 + 160} />
                    <CuppingBar label="عطر" value={scores.aroma} delay={colIdx * 150 + 240} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-roast-900 px-4 py-3 text-cream-100">
                    <span className="flex items-center gap-2 text-[11px] font-bold text-cream-200/75">
                      <FlameIcon className="h-4 w-4 text-gold-400" />
                      برشت {p.details.roastLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <BeanIcon
                          key={i}
                          className={`h-4 w-4 rotate-45 ${i <= p.details.intensity ? "text-gold-400" : "text-cream-100/20"}`}
                        />
                      ))}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {p.details.tastingNotes.map((n) => (
                      <span
                        key={n}
                        className="rounded-full border border-gold-600/35 bg-gold-500/10 px-3 py-1 text-[11px] font-bold text-gold-700 dark:text-gold-400"
                      >
                        {n}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-roast-900/10 pt-4 dark:border-gold-500/15">
                    <p className="text-xl font-extrabold text-gold-700 dark:text-gold-400">
                      {formatNumber(p.price)}
                      <span className="text-[11px] font-bold text-gold-700/75 dark:text-gold-400/75"> تومان</span>
                    </p>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={soldOut}
                      className="flex items-center gap-1.5 rounded-full bg-roast-900 px-4 py-2.5 text-xs font-bold text-cream-50 transition-all hover:bg-gold-600 hover:text-roast-950 active:scale-95 disabled:opacity-40 dark:bg-gold-600 dark:text-roast-950 dark:hover:bg-gold-500"
                    >
                      <CartIcon className="h-4 w-4" />
                      {soldOut ? "ناموجود" : "افزودن به سبد"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
