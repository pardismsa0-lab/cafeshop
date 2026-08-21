import { useEffect, useRef, useState } from "react";

export interface CartLine {
  id: string;
  qty: number;
}

const CART_KEY = "atash-o-daneh-cart";

/** سبد خرید با ماندگاری در localStorage */
export function usePersistentCart() {
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
      return Array.isArray(parsed) ? parsed.filter((l) => l && l.id && l.qty > 0) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* حافظه‌ی مرورگر در دسترس نیست */
    }
  }, [cart]);

  return [cart, setCart] as const;
}

/** ظهور نرم عناصر هنگام ورود به viewport */
export function useReveal<T extends HTMLElement>(deps: readonly unknown[] = []) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // با تغییر فهرست محصولات، کارت‌های تازه دوباره مشاهده می‌شوند
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
