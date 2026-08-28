import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND } from "../data/products";
import { useShop } from "../lib/shop-context";
import { faDigits } from "../lib/utils";
import {
  CartIcon,
  CloseIcon,
  CupIcon,
  MenuIcon,
  MoonIcon,
  PackageIcon,
  SearchIcon,
  SunIcon,
  TruckIcon,
  UserIcon,
} from "./icons";

const NAV = [
  { label: "خانه", id: "top" },
  { label: "فروشگاه", id: "shop" },
  { label: "روند برشت", id: "roast" },
  { label: "درباره‌ی ما", id: "about" },
];

export default function Header() {
  const navigate = useNavigate();
  const { cartCount, query, setQuery, setCartOpen, setOrdersOpen, setAuthOpen, user } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("aod-dark");
      if (saved !== null) return saved === "1";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("aod-dark", next ? "1" : "0");
      } catch {
        /* — */
      }
      return next;
    });
  };

  /* اعمال سلیقه‌ی ذخیره‌شده هنگام بارگذاری */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goSection = (id: string) => {
    setMenuOpen(false);
    navigate("/", { state: { scrollTo: id } });
  };

  const searchBox = (extra?: string) => (
    <div className={`relative ${extra ?? ""}`}>
      <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gold-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="جستجوی قهوه، خاستگاه، نت‌های طعمی…"
        aria-label="جستجوی محصولات"
        className="w-full rounded-full border border-gold-500/25 bg-roast-800/80 py-2.5 pe-4 ps-10 text-sm text-cream-100 placeholder:text-cream-100/40 transition-all duration-300 focus:border-gold-500/70 focus:bg-roast-800 focus:shadow-[0_0_0_4px_rgb(196_154_108/0.15)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
    </div>
  );

  return (
    <header className="sticky top-0 z-40">
      {/* نوار اعلان */}
      <div className="bg-roast-950 text-center text-[11px] font-medium text-cream-200/90">
        <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-1.5">
          <TruckIcon className="h-3.5 w-3.5 text-gold-400" />
          ارسال رایگان برای سفارش‌های بالای ۵۰۰,۰۰۰ تومان — برشتِ تازه، هر سه‌شنبه
        </p>
      </div>

      {/* نوار اصلی */}
      <div className="border-b border-gold-500/15 bg-roast-900/95 shadow-[0_10px_30px_-18px_rgb(30_15_9/0.9)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:gap-5">
          {/* منوی موبایل */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            className="rounded-lg p-2 text-cream-100 transition-colors hover:bg-roast-800 hover:text-gold-400 md:hidden"
          >
            {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>

          {/* لوگو */}
          <button onClick={() => navigate("/")} className="group flex items-center gap-2.5" aria-label="صفحه‌ی اصلی">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gold-500 text-roast-950 shadow-[0_6px_18px_-6px_rgb(196_154_108/0.8)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <CupIcon className="h-5.5 w-5.5" strokeWidth={1.6} />
            </span>
            <span className="text-start leading-none">
              <span className="font-display block text-[22px] text-cream-50 transition-colors group-hover:text-gold-300">
                {BRAND}
              </span>
              <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] text-gold-400/90">
                برشت‌خانه‌ی تخصصی
              </span>
            </span>
          </button>

          {/* ناوبری دسکتاپ */}
          <nav className="ms-4 hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => goSection(item.id)}
                className="relative rounded-full px-3.5 py-2 text-sm font-medium text-cream-100/85 transition-all duration-300 after:absolute after:bottom-1 after:start-1/2 after:h-0.5 after:w-0 after:translate-x-1/2 after:rounded-full after:bg-gold-400 after:transition-all after:duration-300 hover:text-gold-300 hover:after:w-5"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/subscribe")}
              className="relative rounded-full bg-gold-500/15 px-3.5 py-2 text-sm font-bold text-gold-300 ring-1 ring-gold-500/30 transition-all duration-300 hover:bg-gold-500 hover:text-roast-950"
            >
              اشتراک ماهانه
            </button>
          </nav>

          {/* جستجوی دسکتاپ */}
          <div className="ms-auto hidden w-full max-w-xs lg:block">{searchBox()}</div>

          {/* حالت تاریک */}
          <button
            onClick={toggleDark}
            aria-label={dark ? "حالت روشن" : "حالت تاریک"}
            title={dark ? "حالت روشن" : "حالت تاریک"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold-500/30 bg-roast-800 text-gold-300 transition-all duration-300 hover:border-gold-500/70 hover:text-gold-200 active:scale-90"
          >
            {dark ? <SunIcon className="h-5 w-5 transition-transform duration-500 hover:rotate-45" /> : <MoonIcon className="h-5 w-5 transition-transform duration-500 hover:-rotate-12" />}
          </button>

          {/* حساب کاربری */}
          <button
            onClick={() => (user ? navigate("/account") : setAuthOpen(true))}
            aria-label="حساب کاربری"
            className="group relative ms-auto flex items-center gap-2 rounded-full border border-gold-500/30 bg-roast-800 px-3.5 py-2.5 text-cream-100 transition-all duration-300 hover:border-gold-500/70 hover:bg-gold-600 hover:text-roast-950 md:ms-0"
          >
            <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span className="hidden max-w-24 truncate text-sm font-semibold sm:block">
              {user ? (user.name.trim() || faDigits(user.phone).slice(0, 6) + "…") : "ورود"}
            </span>
          </button>

          {/* سفارش‌های من */}
          <button
            onClick={() => setOrdersOpen(true)}
            aria-label="سفارش‌های من"
            className="group hidden items-center gap-2 rounded-full border border-gold-500/30 bg-roast-800 px-3.5 py-2.5 text-cream-100 transition-all duration-300 hover:border-gold-500/70 hover:bg-gold-600 hover:text-roast-950 md:flex"
          >
            <PackageIcon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" />
            <span className="hidden text-sm font-semibold xl:block">سفارش‌ها</span>
          </button>

          {/* سبد خرید */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="باز کردن سبد خرید"
            className="group relative flex items-center gap-2 rounded-full border border-gold-500/30 bg-roast-800 px-3.5 py-2.5 text-cream-100 transition-all duration-300 hover:border-gold-500/70 hover:bg-gold-600 hover:text-roast-950"
          >
            <CartIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span className="hidden text-sm font-semibold sm:block">سبد خرید</span>
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="animate-pop absolute -top-1.5 -start-1.5 grid h-5.5 min-w-5.5 place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-roast-950 ring-2 ring-roast-900"
              >
                {faDigits(cartCount)}
              </span>
            )}
          </button>
        </div>

        {/* جستجوی موبایل (همیشه در دسترس زیر هدر) */}
        <div className="px-4 pb-3 md:hidden">{searchBox()}</div>

        {/* منوی موبایل */}
        <div
          className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:hidden ${
            menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <nav className="min-h-0 overflow-hidden" aria-label="ناوبری موبایل">
            <ul className="space-y-1 border-t border-gold-500/15 px-4 py-3">
              {NAV.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => goSection(item.id)}
                    className="w-full rounded-lg px-3 py-2.5 text-start text-sm font-medium text-cream-100/90 transition-colors hover:bg-roast-800 hover:text-gold-300"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="flex gap-2 pt-1.5">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setOrdersOpen(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-roast-800 px-3 py-2.5 text-sm font-bold text-gold-300 transition-colors hover:bg-roast-700"
                >
                  <PackageIcon className="h-4.5 w-4.5" />
                  سفارش‌های من
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/admin");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gold-500/25 px-3 py-2.5 text-sm font-bold text-cream-200/80 transition-colors hover:text-gold-300"
                >
                  <SearchIcon className="hidden" />
                  پنل مدیریت
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
