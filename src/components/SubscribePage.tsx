import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SUBSCRIPTION, type SubscriptionPlan } from "../data/products";
import { api } from "../lib/api";
import { track } from "../lib/analytics";
import { usePageMeta } from "../lib/seo";
import { useShop } from "../lib/shop-context";
import { faDigits, formatNumber, todayFa } from "../lib/utils";
import { BeanIcon, CheckIcon, FlameIcon, PackageIcon, SteamIcon, TruckIcon } from "./icons";

export default function SubscribePage() {
  usePageMeta(
    "اشتراک ماهانه‌ی قهوه | آتش‌ودانه",
    "هر ماه یک لات تازه‌برشت با انتخاب باریستا، با تخفیف تا ۱۵٪، دمِ درِ خانه‌ی شما.",
  );
  const navigate = useNavigate();
  const { pushToast, sendSms, user } = useShop();

  const [sizeId, setSizeId] = useState("250");
  const [freqId, setFreqId] = useState("monthly");
  const [profileId, setProfileId] = useState("surprise");
  const [existing, setExisting] = useState<SubscriptionPlan | null>(() => api.getSubscription());
  const [submitting, setSubmitting] = useState(false);

  const size = SUBSCRIPTION.sizes.find((s) => s.id === sizeId)!;
  const freq = SUBSCRIPTION.frequencies.find((f) => f.id === freqId)!;
  const profile = SUBSCRIPTION.profiles.find((p) => p.id === profileId)!;

  const discounted = Math.round((size.price * (100 - freq.percent)) / 100);
  const savingPerYear = (size.price - discounted) * (freqId === "monthly" ? 12 : 26);

  const nextTuesday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7 || 7));
    return new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(d);
  }, []);

  const subscribe = async () => {
    if (submitting) return;
    setSubmitting(true);
    const plan: SubscriptionPlan = {
      sizeId,
      freqId,
      profileId,
      price: discounted,
      percent: freq.percent,
      startedAt: todayFa(),
      nextDelivery: nextTuesday,
    };
    await api.subscribe(plan);
    track("subscribe", { size: size.label, freq: freq.label });
    setExisting(plan);
    setSubmitting(false);
    pushToast("اشتراک شما فعال شد! اولین برشت سه‌شنبه راه می‌افتد ☕");
    sendSms(
      `${user?.name?.trim() || "قهوه‌دوست"} عزیز، اشتراک ${freq.label} «${profile.label}» فعال شد.\nاولین بسته: ${nextTuesday} — برشت‌خانه‌ی آتش‌ودانه`,
    );
  };

  const cancel = async () => {
    await api.cancelSubscription();
    setExisting(null);
    pushToast("اشتراک لغو شد؛ هر وقت خواستید برمی‌گردیم سراغتان!", "info");
  };

  /* ═══════════ وضعیت اشتراک فعال ═══════════ */
  if (existing) {
    const exSize = SUBSCRIPTION.sizes.find((s) => s.id === existing.sizeId)!;
    const exProfile = SUBSCRIPTION.profiles.find((p) => p.id === existing.profileId)!;
    return (
      <div className="animate-fade-up mx-auto max-w-2xl px-4 py-16">
        <div className="relative overflow-hidden rounded-xl bg-roast-900 p-8 text-cream-100 shadow-lift md:p-10">
          <BeanIcon className="animate-floaty pointer-events-none absolute -top-6 -end-6 h-28 w-28 rotate-12 text-gold-500/15" />
          <span className="inline-flex items-center gap-2 rounded-full bg-olive-600/20 px-4 py-1.5 text-xs font-bold text-olive-500 ring-1 ring-olive-500/40">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-olive-500 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-olive-500" />
            </span>
            اشتراک فعال
          </span>
          <h1 className="font-display mt-5 text-3xl text-cream-50 md:text-4xl">
            قهوه‌ی شما، سرِ وقت می‌رسد
          </h1>
          <p className="mt-3 text-sm leading-8 text-cream-200/70">
            پروفایل «{exProfile.label}» · بسته‌ی {exSize.label} — هر برشت، سه‌شنبه‌ها انجام می‌شود و
            همان هفته به دستتان می‌رسد.
          </p>

          <dl className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { label: "شروع اشتراک", value: existing.startedAt },
              { label: "تحویل بعدی", value: existing.nextDelivery },
              { label: "هزینه‌ی هر بسته", value: `${formatNumber(existing.price)} تومان` },
            ].map((r) => (
              <div key={r.label} className="rounded-xl bg-roast-800/80 p-4 ring-1 ring-gold-500/15">
                <dt className="text-[11px] font-bold text-cream-200/60">{r.label}</dt>
                <dd className="mt-1.5 text-sm font-extrabold text-gold-300">{r.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/", { state: { scrollTo: "shop" } })}
              className="rounded-full bg-gold-500 px-7 py-3 text-sm font-bold text-roast-950 transition-all hover:bg-gold-400 active:scale-95"
            >
              خرید تکمیلی از فروشگاه
            </button>
            <button
              onClick={() => void cancel()}
              className="rounded-full border border-brick-500/50 px-7 py-3 text-sm font-bold text-brick-500 transition-all hover:bg-brick-600 hover:text-cream-50"
            >
              لغو اشتراک
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════ پیکربندی اشتراک ═══════════ */
  return (
    <div className="overflow-hidden">
      {/* سربرگ — به‌سبک برچسب پاکت قهوه */}
      <section className="relative bg-roast-900 text-cream-100">
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -top-24 -start-24 h-80 w-80 text-gold-500/10"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <circle cx="100" cy="100" r="92" strokeWidth="8" />
          <circle cx="100" cy="100" r="58" strokeWidth="4" />
        </svg>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 lg:grid-cols-12 lg:py-20">
          <div className="animate-fade-up lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold text-gold-300">
              <FlameIcon className="h-4 w-4" />
              اشتراک برشت‌خانه
            </p>
            <h1 className="font-display mt-5 text-4xl leading-[1.3] text-cream-50 md:text-5xl xl:text-[54px]">
              هر سه‌شنبه، برشتِ تازه؛
              <br />
              <span className="text-gold-400">بی‌آنکه یادتان باشد</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-8 text-cream-200/75">
              پروفایل طعم‌تان را انتخاب کنید؛ باریستای ما هر دوره یک لاتِ تازه‌برشت از همان خانواده
              انتخاب می‌کند و با تخفیف اشتراک، دمِ در می‌فرستد.
            </p>

            {/* مسیر هر دوره */}
            <ol className="mt-9 flex flex-wrap items-center gap-y-4">
              {[
                { icon: BeanIcon, label: "انتخاب پروفایل" },
                { icon: FlameIcon, label: "برشت سه‌شنبه" },
                { icon: PackageIcon, label: "بسته‌بندی با سوپاپ" },
                { icon: TruckIcon, label: "تحویل همان هفته" },
              ].map((s, i, arr) => (
                <li key={s.label} className="flex items-center">
                  <span className="flex flex-col items-center gap-2">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-roast-800 text-gold-400 ring-1 ring-gold-500/25 transition-transform duration-300 hover:-rotate-6 hover:scale-110">
                      <s.icon className="h-5.5 w-5.5" />
                    </span>
                    <span className="text-[11px] font-bold text-cream-200/75">{s.label}</span>
                  </span>
                  {i < arr.length - 1 && (
                    <span className="mx-3 mb-6 h-px w-8 border-t-2 border-dashed border-gold-500/40 sm:w-14" />
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* بلیت اشتراک */}
          <div className="animate-fade-up lg:col-span-5" style={{ animationDelay: "0.15s" }}>
            <div className="animate-floaty relative mx-auto max-w-sm rotate-2 rounded-xl bg-cream-50 p-6 text-roast-900 shadow-lift transition-transform duration-500 hover:rotate-0">
              <SteamIcon className="pointer-events-none absolute -top-4 start-10 h-12 w-12 text-cream-50/80" />
              <div className="flex items-center justify-between">
                <p className="font-display text-xl text-roast-900">بلیت اشتراک</p>
                <span className="rounded-full bg-gold-500 px-3 py-1 text-[11px] font-extrabold text-roast-950">
                  {faDigits(freq.percent)}٪ تخفیف
                </span>
              </div>
              <div className="my-4 border-t-2 border-dashed border-roast-900/20" />
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-roast-600">اندازه‌ی بسته</dt>
                  <dd className="font-extrabold">{size.label}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-roast-600">فرکانس ارسال</dt>
                  <dd className="font-extrabold">{freq.label}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-roast-600">پروفایل طعم</dt>
                  <dd className="font-extrabold">{profile.label}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-roast-600">تحویل بعدی</dt>
                  <dd className="font-extrabold text-gold-700">{nextTuesday}</dd>
                </div>
              </dl>
              <div className="my-4 border-t-2 border-dashed border-roast-900/20" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-bold text-roast-600">
                    <span className="line-through decoration-brick-600/70">{formatNumber(size.price)}</span>{" "}
                    در هر دوره
                  </p>
                  <p className="font-display text-3xl text-gold-700">
                    {formatNumber(discounted)} <span className="text-sm">تومان</span>
                  </p>
                </div>
                <span className="font-display -rotate-6 rounded-lg border-2 border-brick-600 px-3 py-1 text-sm text-brick-600">
                  اشتراکی
                </span>
              </div>
            </div>
            <p className="mt-5 text-center text-xs font-semibold text-cream-200/60">
              صرفه‌جویی سالانه با این تنظیم:{" "}
              <strong className="text-gold-300">{formatNumber(savingPerYear)} تومان</strong>
            </p>
          </div>
        </div>
      </section>

      {/* پیکربنده */}
      <section className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="animate-fade-up space-y-9">
            {/* اندازه */}
            <div>
              <h2 className="font-display text-2xl text-roast-900">۱. اندازه‌ی بسته</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {SUBSCRIPTION.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    aria-pressed={sizeId === s.id}
                    className={`rounded-xl border-2 p-5 text-start transition-all duration-300 active:scale-[0.98] ${
                      sizeId === s.id
                        ? "border-gold-600 bg-gold-500/12 shadow-card"
                        : "border-roast-900/12 bg-cream-50 hover:border-gold-600/50"
                    }`}
                  >
                    <span className="font-display block text-2xl text-roast-900">{s.label}</span>
                    <span className="mt-1 block text-xs text-roast-600">
                      حدود {s.id === "250" ? faDigits(15) : faDigits(30)} فنجان
                    </span>
                    <span className="mt-2 block text-sm font-extrabold text-gold-700">
                      {formatNumber(s.price)} تومان
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* فرکانس */}
            <div>
              <h2 className="font-display text-2xl text-roast-900">۲. فرکانس ارسال</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {SUBSCRIPTION.frequencies.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFreqId(f.id)}
                    aria-pressed={freqId === f.id}
                    className={`relative rounded-xl border-2 p-5 text-start transition-all duration-300 active:scale-[0.98] ${
                      freqId === f.id
                        ? "border-gold-600 bg-gold-500/12 shadow-card"
                        : "border-roast-900/12 bg-cream-50 hover:border-gold-600/50"
                    }`}
                  >
                    <span className="absolute top-3 end-3 rounded-full bg-olive-600 px-2.5 py-1 text-[10px] font-extrabold text-cream-50">
                      {faDigits(f.percent)}٪−
                    </span>
                    <span className="font-display block text-2xl text-roast-900">{f.label}</span>
                    <span className="mt-1 block text-xs leading-6 text-roast-600">
                      {f.id === "monthly" ? "هر ماه یک بسته‌ی تازه" : "هر ۱۴ روز یک بسته‌ی تازه"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* پروفایل */}
            <div>
              <h2 className="font-display text-2xl text-roast-900">۳. پروفایل طعم</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {SUBSCRIPTION.profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProfileId(p.id)}
                    aria-pressed={profileId === p.id}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-start transition-all duration-300 active:scale-[0.98] ${
                      profileId === p.id
                        ? "border-gold-600 bg-gold-500/12 shadow-card"
                        : "border-roast-900/12 bg-cream-50 hover:border-gold-600/50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
                        profileId === p.id ? "border-gold-600 bg-gold-600" : "border-roast-900/25"
                      }`}
                    >
                      {profileId === p.id && <CheckIcon className="h-3 w-3 text-roast-950" strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold text-roast-900">{p.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-roast-600">{p.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* خلاصه و ثبت */}
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="rounded-xl border border-roast-900/10 bg-cream-50 p-7 shadow-card lg:sticky lg:top-32">
              <h3 className="font-display text-2xl text-roast-900">خلاصه‌ی اشتراک</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-roast-600">
                  <dt>بسته‌ی {size.label} · {freq.label}</dt>
                  <dd className="font-bold text-roast-900">{formatNumber(size.price)}</dd>
                </div>
                <div className="flex justify-between text-olive-700">
                  <dt>تخفیف اشتراک ({faDigits(freq.percent)}٪)</dt>
                  <dd className="font-extrabold">− {formatNumber(size.price - discounted)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-roast-900/15 pt-3.5">
                  <dt className="font-extrabold text-roast-900">هر دوره</dt>
                  <dd className="font-display text-3xl text-gold-700">
                    {formatNumber(discounted)} <span className="text-sm">تومان</span>
                  </dd>
                </div>
              </dl>

              <ul className="mt-6 space-y-2.5 text-xs text-roast-600">
                {[
                  "لغو یا تغییر پروفایل، هر زمان که بخواهید",
                  "ارسال رایگان برای مشترک‌ها",
                  "یادداشت دست‌نویس باریستا روی هر بسته",
                  "۷ روز ضمانت بازگشت بدون قید و شرط",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <CheckIcon className="h-4 w-4 shrink-0 text-olive-600" strokeWidth={2.6} />
                    {b}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => void subscribe()}
                disabled={submitting}
                className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-gold-600 py-4 text-sm font-extrabold text-roast-950 shadow-[0_14px_30px_-10px_rgb(168_124_78/0.8)] transition-all duration-300 hover:bg-gold-500 active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-roast-950/25 border-t-roast-950" />
                    در حال فعال‌سازی…
                  </>
                ) : (
                  <>
                    <FlameIcon className="h-5 w-5" />
                    فعال‌سازی اشتراک — {formatNumber(discounted)} تومان
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-[11px] text-roast-600">
                دوره‌ی اول از {nextTuesday} شروع می‌شود؛ مبلغ هنگام ارسال دریافت می‌شود.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
