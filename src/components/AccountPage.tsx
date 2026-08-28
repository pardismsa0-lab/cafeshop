import { useEffect, useState } from "react";
import { api, ORDER_STATUS_LABELS, stockOf, type Address, type StoredOrder } from "../lib/api";
import { usePageMeta } from "../lib/seo";
import { useShop } from "../lib/shop-context";
import { faDigits, formatToman, toEnDigits } from "../lib/utils";
import {
  CartIcon,
  CheckIcon,
  HeartIcon,
  LogoutIcon,
  PackageIcon,
  PinIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
} from "./icons";

export default function AccountPage() {
  usePageMeta(
    "حساب کاربری | آتش‌ودانه",
    "مدیریت حساب کاربری، علاقه‌مندی‌ها، آدرس‌ها و سفارش‌های برشت‌خانه‌ی آتش‌ودانه",
  );

  const { user, setUser, products, productsLoading, wishlist, toggleWishlist, addToCart, setAuthOpen, pushToast } =
    useShop();

  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addr, setAddr] = useState({ title: "خانه", receiver: "", phone: "", text: "" });
  const [addrError, setAddrError] = useState("");

  useEffect(() => {
    if (!user) return;
    setAddresses(api.getAddresses(user.phone));
    setOrders(api.getUserOrders(user.phone));
    setName(user.name);
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="animate-floaty mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-gold-600/50 bg-cream-50 text-gold-700 shadow-card">
          <UserIcon className="h-11 w-11" />
        </span>
        <h1 className="font-display mt-7 text-3xl text-roast-900">وارد حساب‌تان شوید</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-8 text-roast-600">
          با ورود، علاقه‌مندی‌ها، آدرس‌ها و تاریخچه‌ی سفارش‌هایتان یک‌جا در دسترس‌تان خواهد بود.
        </p>
        <button
          onClick={() => setAuthOpen(true)}
          className="mt-8 rounded-full bg-gold-600 px-9 py-3.5 text-sm font-bold text-roast-950 shadow-[0_12px_28px_-10px_rgb(168_124_78/0.8)] transition-all hover:bg-gold-500 active:scale-95"
        >
          ورود با شماره‌ی موبایل
        </button>
      </div>
    );
  }

  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  const saveName = async () => {
    setSavingName(true);
    await api.saveProfile({ ...user, name: name.trim() });
    setUser({ ...user, name: name.trim() });
    setSavingName(false);
    pushToast("نام شما ذخیره شد");
  };

  const submitAddress = async () => {
    if (addr.receiver.trim().length < 3) {
      setAddrError("نام گیرنده را کامل وارد کنید.");
      return;
    }
    if (addr.text.trim().length < 10) {
      setAddrError("آدرس را دقیق‌تر بنویسید (حداقل ۱۰ حرف).");
      return;
    }
    setAddrError("");
    const saved = await api.saveAddress(user.phone, addr);
    setAddresses((a) => [...a, saved]);
    setShowAddrForm(false);
    setAddr({ title: "خانه", receiver: "", phone: "", text: "" });
    pushToast("آدرس جدید ذخیره شد");
  };

  const removeAddress = async (id: string) => {
    await api.deleteAddress(user.phone, id);
    setAddresses((a) => a.filter((x) => x.id !== id));
    pushToast("آدرس حذف شد", "info");
  };

  const doLogout = async () => {
    await api.logout();
    setUser(null);
    pushToast("از حساب خارج شدید", "info");
  };

  return (
    <div className="animate-fade-up mx-auto max-w-5xl px-4 py-10">
      {/* سربرگ حساب */}
      <div className="overflow-hidden rounded-xl bg-roast-900 text-cream-100 shadow-lift">
        <div className="flex flex-col items-center gap-5 px-6 py-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display grid h-16 w-16 place-items-center rounded-full bg-gold-500 text-3xl text-roast-950 shadow-card">
              {(user.name.trim() || user.phone).slice(0, 1)}
            </span>
            <div className="text-center sm:text-start">
              <h1 className="font-display text-2xl text-cream-50">
                {user.name.trim() || "قهوه‌دوست عزیز"}
              </h1>
              <p className="mt-1 text-xs text-cream-200/60" dir="ltr">
                {faDigits(user.phone)}
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-sm items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام و نام‌خانوادگی"
              aria-label="نام و نام‌خانوادگی"
              className="min-w-0 flex-1 rounded-full border border-gold-500/25 bg-roast-800 px-4 py-2.5 text-sm text-cream-100 placeholder:text-cream-100/35 transition-all focus:border-gold-500/70 focus:outline-none"
            />
            <button
              onClick={() => void saveName()}
              disabled={savingName}
              className="rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold text-roast-950 transition-all hover:bg-gold-400 active:scale-95 disabled:opacity-50"
            >
              {savingName ? "…" : "ذخیره"}
            </button>
          </div>

          <button
            onClick={() => void doLogout()}
            className="flex items-center gap-2 rounded-full border border-brick-500/40 px-5 py-2.5 text-xs font-bold text-brick-500 transition-all hover:bg-brick-600 hover:text-cream-50"
          >
            <LogoutIcon className="h-4 w-4" />
            خروج از حساب
          </button>
        </div>
        <div className="flex items-center justify-center gap-8 border-t border-gold-500/15 bg-roast-950/40 px-6 py-3.5 text-[11px] font-bold text-cream-200/70">
          <span>
            {faDigits(wishlist.length)} علاقه‌مندی
          </span>
          <span className="h-1 w-1 rounded-full bg-gold-500" />
          <span>{faDigits(orders.length)} سفارش</span>
          <span className="h-1 w-1 rounded-full bg-gold-500" />
          <span>{faDigits(addresses.length)} آدرس</span>
        </div>
      </div>

      {/* علاقه‌مندی‌ها */}
      <section className="mt-12">
        <h2 className="font-display flex items-center gap-2.5 text-2xl text-roast-900">
          <HeartIcon className="h-6 w-6 text-brick-500" />
          علاقه‌مندی‌های من
        </h2>
        {productsLoading ? (
          <div className="mt-5 grid h-28 animate-pulse grid-cols-2 gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-roast-900/10" />
            ))}
          </div>
        ) : wishedProducts.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-roast-900/20 bg-cream-50/60 px-5 py-8 text-center text-sm text-roast-600">
            هنوز محصولی را نشان نکرده‌اید؛ روی ♥ کارت محصولات بزنید تا اینجا جمع شوند.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wishedProducts.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3.5 rounded-xl border border-roast-900/10 bg-cream-50 p-3.5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <img src={p.image} alt={p.shortName} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-extrabold text-roast-900">{p.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-gold-700">
                    <StarIcon className="h-3 w-3 text-gold-500" />
                    {faDigits(p.rating.toFixed(1))}
                    <span className="ms-1 text-roast-600">· {formatToman(p.price)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => addToCart(p)}
                    disabled={stockOf(p) === 0}
                    aria-label="افزودن به سبد"
                    className="grid h-8 w-8 place-items-center rounded-full bg-roast-900 text-cream-50 transition-all hover:bg-gold-600 hover:text-roast-950 active:scale-90 disabled:opacity-30"
                  >
                    <CartIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(p)}
                    aria-label="حذف از علاقه‌مندی‌ها"
                    className="grid h-8 w-8 place-items-center rounded-full border border-roast-900/15 text-brick-600 transition-all hover:bg-brick-600/10 active:scale-90"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* آدرس‌ها */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2.5 text-2xl text-roast-900">
            <PinIcon className="h-6 w-6 text-gold-700" />
            آدرس‌های من
          </h2>
          <button
            onClick={() => setShowAddrForm((v) => !v)}
            className="rounded-full bg-roast-900 px-5 py-2.5 text-xs font-bold text-cream-50 transition-all hover:bg-roast-800 active:scale-95"
          >
            {showAddrForm ? "بستن فرم" : "+ آدرس جدید"}
          </button>
        </div>

        {showAddrForm && (
          <div className="animate-fade-up mt-5 space-y-3.5 rounded-xl border border-gold-600/40 bg-cream-50 p-5 shadow-lift">
            <div className="flex flex-wrap items-center gap-2">
              {["خانه", "محل کار", "سایر"].map((t) => (
                <button
                  key={t}
                  onClick={() => setAddr((a) => ({ ...a, title: t }))}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    addr.title === t
                      ? "bg-gold-600 text-roast-950"
                      : "border border-roast-900/15 text-roast-700 hover:border-gold-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <input
                value={addr.receiver}
                onChange={(e) => setAddr((a) => ({ ...a, receiver: e.target.value }))}
                placeholder="نام گیرنده"
                className="rounded-xl border border-roast-900/15 bg-cream-100 px-4 py-3 text-sm transition-all focus:border-gold-600 focus:outline-none"
              />
              <input
                value={addr.phone}
                onChange={(e) => setAddr((a) => ({ ...a, phone: toEnDigits(e.target.value) }))}
                placeholder="تلفن (اختیاری)"
                dir="ltr"
                className="rounded-xl border border-roast-900/15 bg-cream-100 px-4 py-3 text-center text-sm transition-all focus:border-gold-600 focus:outline-none"
              />
            </div>
            <textarea
              value={addr.text}
              onChange={(e) => setAddr((a) => ({ ...a, text: e.target.value }))}
              placeholder="آدرس کامل پستی…"
              rows={2}
              className="w-full resize-none rounded-xl border border-roast-900/15 bg-cream-100 px-4 py-3 text-sm leading-7 transition-all focus:border-gold-600 focus:outline-none"
            />
            {addrError && <p className="text-[11px] font-bold text-brick-600">{addrError}</p>}
            <button
              onClick={() => void submitAddress()}
              className="rounded-full bg-gold-600 px-7 py-3 text-xs font-bold text-roast-950 transition-all hover:bg-gold-500 active:scale-95"
            >
              ذخیره‌ی آدرس
            </button>
          </div>
        )}

        {addresses.length === 0 && !showAddrForm ? (
          <p className="mt-4 rounded-xl border border-dashed border-roast-900/20 bg-cream-50/60 px-5 py-8 text-center text-sm text-roast-600">
            آدرسی ثبت نکرده‌اید؛ با افزودن آدرس، تسویه‌حساب سریع‌تر می‌شود.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-roast-900/10 bg-cream-50 p-4 shadow-card">
                <div>
                  <p className="flex items-center gap-2 text-sm font-extrabold text-roast-900">
                    <span className="rounded-full bg-gold-500/20 px-2.5 py-0.5 text-[10px] font-bold text-gold-700">
                      {a.title}
                    </span>
                    {a.receiver}
                  </p>
                  <p className="mt-1.5 text-xs leading-6 text-roast-600">{a.text}</p>
                </div>
                <button
                  onClick={() => void removeAddress(a.id)}
                  aria-label="حذف آدرس"
                  className="shrink-0 rounded-full p-2 text-brick-600 transition-all hover:bg-brick-600/10 active:scale-90"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* سفارش‌های کاربر */}
      <section className="mt-12 pb-6">
        <h2 className="font-display flex items-center gap-2.5 text-2xl text-roast-900">
          <PackageIcon className="h-6 w-6 text-gold-700" />
          سفارش‌های من
        </h2>
        {orders.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-roast-900/20 bg-cream-50/60 px-5 py-8 text-center text-sm text-roast-600">
            با این شماره سفارشی ثبت نشده است.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {orders.map((o) => (
              <li key={o.code} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-roast-900/10 bg-cream-50 p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="font-display rounded-lg bg-roast-900 px-3 py-1.5 text-lg tracking-[0.12em] text-gold-400">
                    {o.code}
                  </span>
                  <div>
                    <p className="text-xs text-roast-600">{o.date}</p>
                    <p className="text-xs font-bold text-roast-900">{faDigits(o.items.reduce((s, i) => s + i.qty, 0))} قلم کالا</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1.5 text-[11px] font-bold text-gold-700">
                    <CheckIcon className="h-3.5 w-3.5" />
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                  <span className="text-sm font-extrabold text-gold-700">{formatToman(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
