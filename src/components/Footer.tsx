import { BRAND, CATEGORY_FILTERS } from "../data/products";
import { faDigits } from "../lib/utils";
import { ClockIcon, CupIcon, InstagramIcon, PhoneIcon, PinIcon, TelegramIcon } from "./icons";

interface Props {
  onHome: () => void;
  onNav: (sectionId: string) => void;
  onCategory: (id: string) => void;
}

export default function Footer({ onHome, onNav, onCategory }: Props) {
  return (
    <footer className="relative z-10 overflow-hidden bg-roast-950 text-cream-200">
      {/* حلقه‌ی قهوه‌ی تزئینی */}
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 text-gold-500/10"
        fill="none"
        stroke="currentColor"
        aria-hidden
      >
        <circle cx="100" cy="100" r="92" strokeWidth="10" />
        <circle cx="100" cy="100" r="60" strokeWidth="5" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* برند */}
          <div>
            <button onClick={onHome} className="flex items-center gap-2.5" aria-label="صفحه‌ی اصلی">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500 text-roast-950">
                <CupIcon className="h-5.5 w-5.5" strokeWidth={1.6} />
              </span>
              <span className="font-display text-2xl text-cream-50">{BRAND}</span>
            </button>
            <p className="mt-4 text-sm leading-7 text-cream-200/70">
              از ۱۳۹۸ دانه‌های سبز را مستقیم از کشاورز می‌خریم، در دسته‌های کوچک برشته می‌کنیم و تا
              ۴۸ ساعت به دست شما می‌رسانیم. قهوه برای ما یک صنعت نیست؛ یک آیین است.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {[
                { icon: InstagramIcon, label: "اینستاگرام" },
                { icon: TelegramIcon, label: "تلگرام" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/25 text-gold-400 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:bg-gold-500 hover:text-roast-950"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* دسترسی سریع */}
          <div>
            <h3 className="font-display text-lg text-gold-400">دسترسی سریع</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "صفحه‌ی اصلی", act: onHome },
                { label: "فروشگاه", act: () => onNav("shop") },
                { label: "روند برشت", act: () => onNav("roast") },
                { label: "درباره‌ی ما", act: () => onNav("about") },
              ].map((l) => (
                <li key={l.label}>
                  <button
                    onClick={l.act}
                    className="group inline-flex items-center gap-2 text-cream-200/75 transition-colors hover:text-gold-300"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold-500 transition-all duration-300 group-hover:w-3 group-hover:rounded-full" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* دسته‌بندی‌ها */}
          <div>
            <h3 className="font-display text-lg text-gold-400">دسته‌بندی‌ها</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CATEGORY_FILTERS.filter((c) => c.id !== "all").map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onCategory(c.id)}
                    className="group inline-flex items-center gap-2 text-cream-200/75 transition-colors hover:text-gold-300"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold-500 transition-all duration-300 group-hover:w-3" />
                    قهوه‌ی {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* تماس */}
          <div>
            <h3 className="font-display text-lg text-gold-400">تماس با برشت‌خانه</h3>
            <ul className="mt-4 space-y-3.5 text-sm text-cream-200/75">
              <li className="flex items-start gap-2.5">
                <PinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-500" />
                تهران، خیابان ولی‌عصر، کوچه‌ی برشت، پلاک ۱۲
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="h-4.5 w-4.5 shrink-0 text-gold-500" />
                <span dir="ltr">{faDigits("021-9100-8420")}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ClockIcon className="h-4.5 w-4.5 shrink-0 text-gold-500" />
                شنبه تا پنجشنبه، {faDigits("9")} تا {faDigits("21")}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-gold-500/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-cream-200/55 sm:flex-row">
          <p>© {faDigits(1404)} برشت‌خانه‌ی {BRAND} — تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-1.5">
            ساخته‌شده با <span className="text-brick-500">♥</span> و کمی کافئین اضافه
          </p>
        </div>
      </div>
    </footer>
  );
}
