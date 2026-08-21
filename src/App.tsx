import { useEffect, useMemo, useState } from "react";
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import AccountPage from "./components/AccountPage";
import AdminPage from "./components/AdminPage";
import CheckoutPage from "./components/Checkout";
import ChatWidget from "./components/ChatWidget";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import ProductDetail from "./components/ProductDetail";
import { BeanIcon, CupIcon } from "./components/icons";
import { CATEGORY_LABELS, type CategoryId, type SortKey } from "./data/products";
import { usePersistentCart } from "./lib/hooks";
import { ShopProvider, useShop } from "./lib/shop-context";
import { normalizeFa } from "./lib/utils";

/* ═══════════ بارگذار صفحه ═══════════ */
function PageLoader() {
  return (
    <div className="grid min-h-[50dvh] place-items-center">
      <div className="text-center">
        <span className="relative mx-auto grid h-20 w-20 place-items-center text-gold-700">
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-gold-500/20 border-t-gold-600" />
          <CupIcon className="h-9 w-9" />
        </span>
        <p className="font-display mt-5 text-xl text-roast-900">در حال دم‌آوری صفحه…</p>
      </div>
    </div>
  );
}

/* ═══════════ صفحه‌ی ۴۰۴ ═══════════ */
function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-up mx-auto max-w-md px-4 py-24 text-center">
      <BeanIcon className="animate-floaty mx-auto h-16 w-16 rotate-45 text-gold-600" />
      <h1 className="font-display mt-6 text-6xl text-roast-900">۴۰۴</h1>
      <p className="font-display mt-2 text-2xl text-gold-700">این صفحه پیدا نشد!</p>
      <p className="mx-auto mt-4 max-w-xs text-sm leading-8 text-roast-600">
        به‌نظر می‌رسد این مسیر هنوز برشت نشده. بیایید به فروشگاه برگردیم.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-8 rounded-full bg-gold-600 px-8 py-3.5 text-sm font-bold text-roast-950 transition-all hover:bg-gold-500 active:scale-95"
      >
        بازگشت به صفحه‌ی اصلی
      </button>
    </div>
  );
}

/* ═══════════ صفحه‌ی اصلی ═══════════ */
function HomePage() {
  const { products, productsLoading, addToCart, wishlist, toggleWishlist, pushToast, query, setQuery } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortKey>("popular");

  /* اسکرول به بخش یا اعمال دسته از state ناوبری */
  useEffect(() => {
    const state = location.state as { scrollTo?: string; category?: CategoryId | "all" } | null;
    if (!state) return;
    if (state.category) setCategory(state.category);
    if (state.scrollTo) {
      window.setTimeout(() => {
        document.getElementById(state.scrollTo!)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 130);
    }
    navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => category === "all" || p.category === category);
    const q = normalizeFa(query);
    if (q) {
      list = list.filter((p) =>
        normalizeFa(
          [
            p.name,
            CATEGORY_LABELS[p.category],
            p.description,
            p.details.origin,
            p.details.roastLevel,
            p.details.tastingNotes.join(" "),
          ].join(" "),
        ).includes(q),
      );
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case "cheap":
          return a.price - b.price;
        case "expensive":
          return b.price - a.price;
        case "newest":
          return +new Date(b.addedAt) - +new Date(a.addedAt);
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [products, query, category, sort]);

  return (
    <Home
      products={filtered}
      loading={productsLoading}
      query={query}
      onQueryChange={setQuery}
      category={category}
      onCategoryChange={setCategory}
      sort={sort}
      onSortChange={setSort}
      onOpenProduct={(id) => navigate(`/product/${id}`)}
      onAddToCart={(p) => addToCart(p)}
      onNav={(id) => navigate("/", { state: { scrollTo: id } })}
      onToast={(msg, kind) => pushToast(msg, kind ?? "success")}
      wishlist={wishlist}
      onToggleWishlist={toggleWishlist}
    />
  );
}

/* ═══════════ صفحه‌ی محصول ═══════════ */
function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products, productsLoading, addToCart, wishlist, toggleWishlist } = useShop();
  const navigate = useNavigate();

  if (productsLoading) return <PageLoader />;

  const product = products.find((p) => p.id === id);
  if (!product) return <NotFound />;

  return (
    <ProductDetail
      key={product.id}
      product={product}
      related={products.filter((p) => p.id !== product.id)}
      wished={wishlist.includes(product.id)}
      onToggleWishlist={toggleWishlist}
      onBack={() => navigate("/", { state: { scrollTo: "shop" } })}
      onAdd={(p, qty) => addToCart(p, qty)}
      onOpenProduct={(pid) => navigate(`/product/${pid}`)}
    />
  );
}

/* ═══════════ پوسته‌ی اصلی ═══════════ */
function Shell() {
  const navigate = useNavigate();
  const location = useLocation();

  /* اسکرول به بالای صفحه هنگام تغییر مسیر */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh font-sans text-roast-900 selection:bg-gold-500/40">
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer
        onHome={() => navigate("/")}
        onNav={(id) => navigate("/", { state: { scrollTo: id } })}
        onCategory={(id) => navigate("/", { state: { scrollTo: "shop", category: id } })}
      />

      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ShopProvider>
        <Shell />
      </ShopProvider>
    </HashRouter>
  );
}

/* استفاده از هوک‌ها را برای سازگاری تایپ‌ها نگه می‌داریم */
export { usePersistentCart };
