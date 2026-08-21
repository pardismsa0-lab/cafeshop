import { useCallback, useMemo, useRef, useState } from "react";
import CartDrawer, { type CartItem } from "./components/CartDrawer";
import Checkout from "./components/Checkout";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import ProductDetail from "./components/ProductDetail";
import { BeanIcon, CheckIcon, CloseIcon } from "./components/icons";
import { CATEGORY_LABELS, PRODUCTS, type CategoryId, type Product, type SortKey } from "./data/products";
import { usePersistentCart } from "./lib/hooks";
import { normalizeFa } from "./lib/utils";

type View = { type: "home" } | { type: "product"; id: string } | { type: "checkout" };
type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const MAX_QTY = 10;

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });
  const [cart, setCart] = usePersistentCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  /* ───── اعلان‌ها ───── */
  const pushToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  /* ───── ناوبری ───── */
  const goHome = useCallback(() => {
    setView({ type: "home" });
    window.scrollTo({ top: 0 });
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const doScroll = () => {
        if (id === "top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      if (view.type !== "home") {
        setView({ type: "home" });
        window.setTimeout(doScroll, 120);
      } else {
        doScroll();
      }
    },
    [view.type],
  );

  const openProduct = useCallback((id: string) => {
    setView({ type: "product", id });
    window.scrollTo({ top: 0 });
  }, []);

  const goCheckout = useCallback(() => {
    setCartOpen(false);
    setView({ type: "checkout" });
    window.scrollTo({ top: 0 });
  }, []);

  /* ───── سبد خرید ───── */
  const addToCart = useCallback(
    (product: Product, qty = 1, openDrawer = false) => {
      setCart((prev) => {
        const existing = prev.find((l) => l.id === product.id);
        if (existing) {
          return prev.map((l) =>
            l.id === product.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
          );
        }
        return [...prev, { id: product.id, qty: Math.min(MAX_QTY, qty) }];
      });
      pushToast(`«${product.shortName}» به سبد خرید اضافه شد`);
      if (openDrawer) setCartOpen(true);
    },
    [pushToast, setCart],
  );

  const setLineQty = useCallback(
    (id: string, qty: number) => {
      if (qty < 1) {
        setCart((prev) => prev.filter((l) => l.id !== id));
        pushToast("محصول از سبد حذف شد", "info");
        return;
      }
      setCart((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)));
    },
    [pushToast, setCart],
  );

  const removeLine = useCallback(
    (id: string) => {
      setCart((prev) => prev.filter((l) => l.id !== id));
      pushToast("محصول از سبد حذف شد", "info");
    },
    [pushToast, setCart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    pushToast("سبد خرید تخلیه شد", "info");
  }, [pushToast, setCart]);

  const cartItems: CartItem[] = useMemo(
    () =>
      cart
        .map((l) => ({ product: PRODUCTS.find((p) => p.id === l.id), qty: l.qty }))
        .filter((i): i is CartItem => Boolean(i.product)),
    [cart],
  );
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.qty * i.product.price, 0);

  /* ───── جستجو، فیلتر و مرتب‌سازی ───── */
  const changeQuery = useCallback(
    (q: string) => {
      setQuery(q);
      if (view.type !== "home") setView({ type: "home" });
    },
    [view.type],
  );

  const selectCategory = useCallback((id: CategoryId | "all") => {
    setCategory(id);
  }, []);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => category === "all" || p.category === category);
    const q = normalizeFa(query);
    if (q) {
      list = list.filter((p) =>
        normalizeFa(
          [p.name, CATEGORY_LABELS[p.category], p.description, p.details.origin, p.details.roastLevel, p.details.tastingNotes.join(" ")].join(" "),
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
  }, [query, category, sort]);

  const currentProduct =
    view.type === "product" ? PRODUCTS.find((p) => p.id === view.id) : undefined;

  return (
    <div className="min-h-dvh font-sans text-roast-900 selection:bg-gold-500/40">
      <Header
        cartCount={cartCount}
        query={query}
        onQueryChange={changeQuery}
        onCartOpen={() => setCartOpen(true)}
        onHome={goHome}
        onNav={scrollToSection}
      />

      <main>
        {view.type === "home" && (
          <Home
            products={filtered}
            query={query}
            onQueryChange={changeQuery}
            category={category}
            onCategoryChange={selectCategory}
            sort={sort}
            onSortChange={setSort}
            onOpenProduct={openProduct}
            onAddToCart={(p) => addToCart(p)}
            onNav={scrollToSection}
            onToast={(msg, kind) => pushToast(msg, kind ?? "success")}
          />
        )}

        {view.type === "product" && currentProduct && (
          <ProductDetail
            key={currentProduct.id}
            product={currentProduct}
            onBack={() => scrollToSection("shop")}
            onAdd={(p, q) => addToCart(p, q, true)}
          />
        )}

        {view.type === "checkout" && (
          <Checkout
            items={cartItems}
            subtotal={subtotal}
            onBack={() => scrollToSection("shop")}
            onGoHome={goHome}
            onComplete={() => setCart([])}
          />
        )}
      </main>

      <Footer
        onHome={goHome}
        onNav={scrollToSection}
        onCategory={(id) => {
          selectCategory(id as CategoryId);
          scrollToSection("shop");
        }}
      />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        count={cartCount}
        subtotal={subtotal}
        onClose={() => setCartOpen(false)}
        onSetQty={setLineQty}
        onRemove={removeLine}
        onClear={clearCart}
        onCheckout={goCheckout}
        onGoShop={() => {
          setCartOpen(false);
          scrollToSection("shop");
        }}
      />

      {/* اعلان‌ها */}
      <div className="pointer-events-none fixed bottom-5 left-5 z-[70] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-lift ${
              t.kind === "error"
                ? "border-brick-500/40 bg-brick-600 text-cream-50"
                : "border-gold-500/30 bg-roast-900 text-cream-100"
            }`}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                t.kind === "error"
                  ? "bg-cream-50/20"
                  : t.kind === "info"
                    ? "bg-gold-500/20 text-gold-400"
                    : "bg-olive-600 text-cream-50"
              }`}
            >
              {t.kind === "error" ? (
                <CloseIcon className="h-4 w-4" />
              ) : t.kind === "info" ? (
                <BeanIcon className="h-4 w-4" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
            </span>
            <p className="leading-6">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
