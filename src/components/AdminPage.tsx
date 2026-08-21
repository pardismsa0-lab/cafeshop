import { useCallback, useEffect, useState } from "react";
import {
  api,
  ORDER_STATUS_LABELS,
  type OrderStatus,
  type StoredOrder,
} from "../lib/api";
import type { Product } from "../data/products";
import { usePageMeta } from "../lib/seo";
import { useShop } from "../lib/shop-context";
import { faDigits, formatNumber, formatToman, toEnDigits } from "../lib/utils";
import {
  BeanIcon,
  ChartIcon,
  CheckIcon,
  LockIcon,
  LogoutIcon,
  PackageIcon,
  RefreshIcon,
  SettingsIcon,
  TruckIcon,
} from "./icons";

type Tab = "dashboard" | "products" | "orders";

export default function AdminPage() {
  usePageMeta("پنل مدیریت | آتش‌ودانه", "پنل مدیریت برشت‌خانه‌ی آتش‌ودانه — محصولات، سفارش‌ها و آمار فروش");

  const { refreshProducts, pushToast, sendSms } = useShop();
  const [authed, setAuthed] = useState(() => api.isAdmin());
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.getStats>> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { price: string; stock: string }>>({});
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    void api.getStats().then(setStats);
    void api.getProducts().then((list) => {
      setProducts(list);
      setDrafts(
        Object.fromEntries(
          list.map((p) => [p.id, { price: String(p.price), stock: String(p.stock ?? 10) }]),
        ),
      );
    });
    setOrders(api.getOrders());
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  const login = async () => {
    setBusy(true);
    const ok = await api.adminLogin(pass);
    setBusy(false);
    if (ok) {
      setAuthed(true);
      setPassError("");
      pushToast("به پنل مدیریت خوش آمدید");
    } else {
      setPassError("رمز عبور نادرست است.");
    }
  };

  const saveProduct = async (p: Product) => {
    const d = drafts[p.id];
    const price = Number(toEnDigits(d.price).replace(/[^\d]/g, ""));
    const stock = Number(toEnDigits(d.stock).replace(/[^\d]/g, ""));
    if (!price || price < 1000) {
      pushToast("قیمت معتبر نیست", "error");
      return;
    }
    await api.updateProduct(p.id, { price, stock: Math.max(0, stock) });
    refreshProducts();
    loadAll();
    setSavedFlash(p.id);
    window.setTimeout(() => setSavedFlash(null), 1600);
    pushToast(`«${p.shortName}» به‌روزرسانی شد`);
  };

  const changeStatus = async (order: StoredOrder, status: OrderStatus) => {
    await api.updateOrderStatus(order.code, status);
    setOrders(api.getOrders());
    sendSms(
      `آتش‌ودانه\nسفارش ${order.code} → وضعیت جدید: «${ORDER_STATUS_LABELS[status]}»\n${
        status === "delivered" ? "نوش جان! منتظر نظر شما هستیم ☕" : "به‌زودی اطلاع‌رسانی بعدی را دریافت می‌کنید."
      }`,
    );
    pushToast(`وضعیت سفارش ${order.code} تغییر کرد`);
  };

  /* ═══ دروازه‌ی ورود ═══ */
  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="animate-fade-up rounded-xl border border-roast-900/10 bg-cream-50 p-7 text-center shadow-lift">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-roast-900 text-gold-400 shadow-card">
            <LockIcon className="h-7 w-7" />
          </span>
          <h1 className="font-display mt-5 text-2xl text-roast-900">پنل مدیریت برشت‌خانه</h1>
          <p className="mt-2 text-xs leading-6 text-roast-600">
            این بخش فقط برای تیم آتش‌ودانه است.
            <br />
            <span className="font-bold text-gold-700">رمز دمو: ۱۲۳۴</span>
          </p>
          <input
            type="password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setPassError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && void login()}
            placeholder="رمز عبور"
            aria-label="رمز عبور مدیریت"
            className={`mt-5 w-full rounded-xl border bg-cream-100 px-4 py-3.5 text-center text-lg font-bold tracking-[0.3em] transition-all focus:outline-none ${
              passError ? "border-brick-600" : "border-roast-900/15 focus:border-gold-600"
            }`}
          />
          {passError && <p className="mt-2 text-[11px] font-bold text-brick-600">{passError}</p>}
          <button
            onClick={() => void login()}
            disabled={busy}
            className="mt-4 w-full rounded-full bg-roast-900 py-3.5 text-sm font-bold text-cream-50 transition-all hover:bg-roast-800 active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "در حال بررسی…" : "ورود به پنل"}
          </button>
        </div>
      </div>
    );
  }

  const maxRevenue = stats?.topProducts[0]?.revenue ?? 1;

  return (
    <div className="animate-fade-up mx-auto max-w-6xl px-4 py-10">
      {/* سربرگ پنل */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-2.5 text-3xl text-roast-900">
            <SettingsIcon className="h-7 w-7 text-gold-700" />
            پنل مدیریت
          </h1>
          <p className="mt-1 text-xs text-roast-600">محصولات، سفارش‌ها و آمار فروش برشت‌خانه</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAll}
            className="flex items-center gap-2 rounded-full border border-roast-900/15 bg-cream-50 px-5 py-2.5 text-xs font-bold text-roast-700 shadow-card transition-all hover:border-gold-600 hover:text-gold-700 active:scale-95"
          >
            <RefreshIcon className="h-4 w-4" />
            تازه‌سازی
          </button>
          <button
            onClick={() => {
              api.adminLogout();
              setAuthed(false);
              pushToast("از پنل مدیریت خارج شدید", "info");
            }}
            className="flex items-center gap-2 rounded-full border border-brick-500/40 px-5 py-2.5 text-xs font-bold text-brick-600 transition-all hover:bg-brick-600 hover:text-cream-50 active:scale-95"
          >
            <LogoutIcon className="h-4 w-4" />
            خروج
          </button>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="mt-7 flex gap-2 overflow-x-auto no-scrollbar">
        {(
          [
            { id: "dashboard", label: "داشبورد", icon: ChartIcon },
            { id: "products", label: "محصولات", icon: BeanIcon },
            { id: "orders", label: "سفارش‌ها", icon: PackageIcon },
          ] as { id: Tab; label: string; icon: typeof ChartIcon }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 active:scale-95 ${
              tab === t.id
                ? "bg-roast-900 text-cream-50 shadow-card"
                : "border border-roast-900/15 bg-cream-50 text-roast-700 hover:border-gold-600 hover:text-gold-700"
            }`}
          >
            <t.icon className="h-4.5 w-4.5" />
            {t.label}
            {t.id === "orders" && orders.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  tab === t.id ? "bg-gold-500 text-roast-950" : "bg-roast-900/10"
                }`}
              >
                {faDigits(orders.length)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ داشبورد ═══ */}
      {tab === "dashboard" && (
        <div className="mt-6 space-y-6">
          {!stats ? (
            <div className="grid h-32 animate-pulse grid-cols-2 gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-roast-900/10" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "تعداد سفارش‌ها", value: faDigits(stats.orderCount), icon: PackageIcon },
                  { label: "درآمد کل", value: formatToman(stats.revenue), icon: ChartIcon },
                  { label: "میانگین هر سفارش", value: formatToman(stats.avgOrder), icon: BeanIcon },
                  { label: "سفارش‌های در راه", value: faDigits(orders.filter((o) => o.status !== "delivered").length), icon: TruckIcon },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="animate-fade-up group rounded-xl border border-roast-900/10 bg-cream-50 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <s.icon className="h-6 w-6 text-gold-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                    <p className="font-display mt-3 truncate text-xl text-roast-900 md:text-2xl">{s.value}</p>
                    <p className="mt-1 text-[11px] font-bold text-roast-600">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-roast-900/10 bg-cream-50 p-6 shadow-card">
                <h2 className="font-display text-xl text-roast-900">فروش بر اساس محصول</h2>
                {stats.topProducts.length === 0 ? (
                  <p className="mt-6 rounded-lg border border-dashed border-roast-900/20 px-5 py-8 text-center text-sm text-roast-600">
                    هنوز فروشی ثبت نشده؛ اولین سفارش که بیاید این نمودار جان می‌گیرد!
                  </p>
                ) : (
                  <ul className="mt-5 space-y-4">
                    {stats.topProducts.map((tp, i) => (
                      <li key={tp.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="font-extrabold text-roast-900">
                            <span className="ms-1 text-gold-700">{faDigits(i + 1)}.</span> {tp.name}
                          </span>
                          <span className="whitespace-nowrap font-bold text-roast-600">
                            {faDigits(tp.qty)} عدد · {formatNumber(tp.revenue)} تومان
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-roast-900/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-gold-400 to-gold-600 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max(6, Math.round((tp.revenue / maxRevenue) * 100))}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ محصولات ═══ */}
      {tab === "products" && (
        <ul className="mt-6 space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-roast-900/10 bg-cream-50 p-4 shadow-card transition-shadow hover:shadow-lift"
            >
              <img src={p.image} alt={p.shortName} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-extrabold text-roast-900">{p.name}</h3>
                <p className="mt-1 text-[11px] text-roast-600">
                  موجودی فعلی: <strong className={p.stock !== undefined && p.stock <= 5 ? "text-brick-600" : "text-roast-900"}>{faDigits(p.stock ?? 10)}</strong> عدد
                  {(p.stock ?? 10) === 0 && <span className="ms-2 rounded-full bg-brick-600/15 px-2 py-0.5 font-bold text-brick-600">ناموجود</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-[11px] font-bold text-roast-600">
                  قیمت
                  <span className="relative">
                    <input
                      dir="ltr"
                      inputMode="numeric"
                      value={drafts[p.id]?.price ?? ""}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [p.id]: { ...d[p.id], price: toEnDigits(e.target.value).replace(/[^\d]/g, "") } }))
                      }
                      className="w-28 rounded-lg border border-roast-900/15 bg-cream-100 px-3 py-2 text-center text-sm font-bold transition-all focus:border-gold-600 focus:outline-none"
                    />
                  </span>
                </label>
                <label className="flex items-center gap-2 text-[11px] font-bold text-roast-600">
                  موجودی
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={drafts[p.id]?.stock ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [p.id]: { ...d[p.id], stock: toEnDigits(e.target.value).replace(/[^\d]/g, "") } }))
                    }
                    className="w-16 rounded-lg border border-roast-900/15 bg-cream-100 px-3 py-2 text-center text-sm font-bold transition-all focus:border-gold-600 focus:outline-none"
                  />
                </label>
                <button
                  onClick={() => void saveProduct(p)}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                    savedFlash === p.id
                      ? "bg-olive-600 text-cream-50"
                      : "bg-roast-900 text-cream-50 hover:bg-gold-600 hover:text-roast-950"
                  }`}
                >
                  {savedFlash === p.id ? <CheckIcon className="h-4 w-4" /> : null}
                  {savedFlash === p.id ? "ذخیره شد" : "ذخیره"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ═══ سفارش‌ها ═══ */}
      {tab === "orders" && (
        <div className="mt-6">
          {orders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-roast-900/20 bg-cream-50/60 px-5 py-14 text-center text-sm text-roast-600">
              هنوز سفارشی ثبت نشده است.
            </p>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.code} className="rounded-xl border border-roast-900/10 bg-cream-50 p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-display rounded-lg bg-roast-900 px-3 py-1.5 text-lg tracking-[0.12em] text-gold-400">
                        {o.code}
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-roast-900">{o.name}</p>
                        <p className="text-[11px] text-roast-600">
                          {o.date} · <span dir="ltr">{faDigits(o.phone)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-extrabold text-gold-700">{formatToman(o.total)}</span>
                      <div className="flex gap-1.5">
                        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => o.status !== s && void changeStatus(o, s)}
                            className={`rounded-full px-3.5 py-2 text-[11px] font-bold transition-all active:scale-95 ${
                              o.status === s
                                ? s === "delivered"
                                  ? "bg-olive-600 text-cream-50"
                                  : "bg-gold-600 text-roast-950"
                                : "border border-roast-900/15 text-roast-600 hover:border-gold-600 hover:text-gold-700"
                            }`}
                          >
                            {ORDER_STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 border-t border-dashed border-roast-900/15 pt-3 text-xs text-roast-600">
                    {o.items.map((i) => `${i.name} × ${faDigits(i.qty)}`).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
