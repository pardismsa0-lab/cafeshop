import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { api, stockOf, type User } from "./api";
import { track } from "./analytics";
import { usePersistentCart } from "./hooks";
import type { Product } from "../data/products";
import AuthModal from "../components/AuthModal";
import CartDrawer, { type CartItem } from "../components/CartDrawer";
import OrderHistory from "../components/OrderHistory";
import { BeanIcon, CheckIcon, CloseIcon, SmsIcon } from "../components/icons";

const MAX_QTY = 10;

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}
interface Sms {
  id: number;
  body: string;
}

interface ShopCtxType {
  products: Product[];
  productsLoading: boolean;
  refreshProducts: () => void;

  query: string;
  setQuery: (q: string) => void;

  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  addToCart: (product: Product, qty?: number, openDrawer?: boolean) => void;
  setLineQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;

  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  ordersOpen: boolean;
  setOrdersOpen: (v: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;

  user: User | null;
  setUser: (u: User | null) => void;

  wishlist: string[];
  toggleWishlist: (product: Product) => void;

  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  pushToast: (message: string, kind?: ToastKind) => void;
  sendSms: (body: string) => void;
}

const ShopCtx = createContext<ShopCtxType | null>(null);

export function useShop(): ShopCtxType {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error("useShop باید داخل ShopProvider استفاده شود");
  return ctx;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  /* ───── محصولات از «سرور» ───── */
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    void api.getProducts().then((list) => {
      setProducts(list);
      setProductsLoading(false);
    });
  }, []);

  useEffect(loadProducts, [loadProducts]);

  /* ───── اعلان‌ها و پیامک‌ها ───── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [smsList, setSmsList] = useState<Sms[]>([]);
  const seq = useRef(0);

  const pushToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const sendSms = useCallback((body: string) => {
    const id = ++seq.current;
    setSmsList((s) => [...s, { id, body }]);
    window.setTimeout(() => setSmsList((s) => s.filter((x) => x.id !== id)), 7000);
  }, []);

  /* ───── کاربر ───── */
  const [user, setUser] = useState<User | null>(() => api.getUser());

  /* ───── علاقه‌مندی‌ها ───── */
  const who = user?.phone ?? "guest";
  const [wishlist, setWishlist] = useState<string[]>(() => api.getWishlist(who));

  useEffect(() => {
    setWishlist(api.getWishlist(who));
  }, [who]);

  const toggleWishlist = useCallback(
    (product: Product) => {
      const wished = wishlist.includes(product.id);
      void api.toggleWishlist(who, product.id).then(setWishlist);
      pushToast(
        wished
          ? `«${product.shortName}» از علاقه‌مندی‌ها حذف شد`
          : `«${product.shortName}» به علاقه‌مندی‌ها اضافه شد ♥`,
        "info",
      );
    },
    [wishlist, who, pushToast],
  );

  /* ───── جستجوی سراسری ───── */
  const [query, setQueryRaw] = useState("");
  const setQuery = useCallback(
    (q: string) => {
      setQueryRaw(q);
      /* شروع جستجو از هر صفحه‌ای، کاربر را به فروشگاه می‌آورد */
      const hash = window.location.hash;
      if (q && hash !== "#/" && hash !== "") {
        navigate("/", { state: { scrollTo: "shop" } });
      }
    },
    [navigate],
  );

  /* ───── مقایسه‌ی محصولات ───── */
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = useCallback(
    (id: string) => {
      setCompareIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 2) {
          pushToast("حداکثر ۲ محصول قابل مقایسه است؛ ابتدا یکی را حذف کنید", "info");
          return prev;
        }
        return [...prev, id];
      });
    },
    [pushToast],
  );

  const clearCompare = useCallback(() => setCompareIds([]), []);

  /* ───── پنل‌ها ───── */
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  /* ───── سبد خرید ───── */
  const [cart, setCart] = usePersistentCart();

  const addToCart = useCallback(
    (product: Product, qty = 1, openDrawer = false) => {
      const max = Math.min(MAX_QTY, stockOf(product));
      const current = cart.find((l) => l.id === product.id)?.qty ?? 0;
      if (current >= max) {
        pushToast(`بیش از ${max} عدد از «${product.shortName}» موجود نیست`, "error");
        return;
      }
      setCart((prev) => {
        const existing = prev.find((l) => l.id === product.id);
        if (existing) {
          return prev.map((l) =>
            l.id === product.id ? { ...l, qty: Math.min(max, l.qty + qty) } : l,
          );
        }
        return [...prev, { id: product.id, qty: Math.min(max, qty) }];
      });
      pushToast(`«${product.shortName}» به سبد خرید اضافه شد`);
      if (openDrawer) setCartOpen(true);
    },
    [cart, pushToast, setCart],
  );

  const setLineQty = useCallback(
    (id: string, qty: number) => {
      if (qty < 1) {
        setCart((prev) => prev.filter((l) => l.id !== id));
        pushToast("محصول از سبد حذف شد", "info");
        return;
      }
      const product = products.find((p) => p.id === id);
      const max = product ? Math.min(MAX_QTY, stockOf(product)) : MAX_QTY;
      setCart((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.min(max, qty) } : l)));
    },
    [products, pushToast, setCart],
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
        .map((l) => ({ product: products.find((p) => p.id === l.id), qty: l.qty }))
        .filter((i): i is CartItem => Boolean(i.product)),
    [cart, products],
  );
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.qty * i.product.price, 0);

  /* ───── مقدار ارائه‌شده ───── */
  const value: ShopCtxType = {
    products,
    productsLoading,
    refreshProducts: loadProducts,
    query,
    setQuery,
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    setLineQty,
    removeLine,
    clearCart,
    cartOpen,
    setCartOpen,
    ordersOpen,
    setOrdersOpen,
    authOpen,
    setAuthOpen,
    user,
    setUser,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
    clearCompare,
    pushToast,
    sendSms,
  };

  return (
    <ShopCtx.Provider value={value}>
      {children}

      {/* ═══ سبد خرید ═══ */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        count={cartCount}
        subtotal={subtotal}
        onClose={() => setCartOpen(false)}
        onSetQty={setLineQty}
        onRemove={removeLine}
        onClear={clearCart}
        onCheckout={() => {
          setCartOpen(false);
          navigate("/checkout");
        }}
        onGoShop={() => {
          setCartOpen(false);
          navigate("/", { state: { scrollTo: "shop" } });
        }}
      />

      {/* ═══ تاریخچه‌ی سفارش‌ها ═══ */}
      <OrderHistory
        open={ordersOpen}
        onClose={() => setOrdersOpen(false)}
        onGoShop={() => {
          setOrdersOpen(false);
          navigate("/", { state: { scrollTo: "shop" } });
        }}
      />

      {/* ═══ ورود / ثبت‌نام ═══ */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ═══ اعلان‌های درون‌برنامه‌ای ═══ */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[75] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast pointer-events-auto flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold shadow-lift ${
              t.kind === "success"
                ? "bg-olive-600 text-cream-50"
                : t.kind === "error"
                  ? "bg-brick-600 text-cream-50"
                  : "bg-roast-900 text-cream-100"
            }`}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                t.kind === "info" ? "bg-gold-500 text-roast-950" : "bg-cream-50/20"
              }`}
            >
              {t.kind === "info" ? (
                <BeanIcon className="h-4 w-4" />
              ) : t.kind === "error" ? (
                <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
              ) : (
                <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
              )}
            </span>
            <span className="leading-6">{t.message}</span>
          </div>
        ))}
      </div>

      {/* ═══ پیامک‌های شبیه‌سازی‌شده ═══ */}
      <div className="pointer-events-none fixed top-4 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {smsList.map((s) => (
          <div
            key={s.id}
            role="status"
            className="animate-toast pointer-events-auto w-full overflow-hidden rounded-xl bg-roast-950/95 text-cream-50 shadow-lift ring-1 ring-gold-500/25 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 border-b border-gold-500/15 px-4 py-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-gold-500 text-roast-950">
                <SmsIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <span className="text-[11px] font-bold text-gold-300">پیامک · برشت‌خانه‌ی آتش‌ودانه</span>
              <span className="ms-auto text-[10px] text-cream-200/50">همین حالا</span>
            </div>
            <p className="px-4 py-3 text-[13px] leading-6 whitespace-pre-line">{s.body}</p>
          </div>
        ))}
      </div>
    </ShopCtx.Provider>
  );
}
