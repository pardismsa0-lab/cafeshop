/**
 * لایه‌ی «بک‌اند» شبیه‌سازی‌شده
 * ------------------------------
 * تمام عملیات به‌صورت ناهمزمان (مانند یک REST API واقعی) انجام می‌شود
 * و داده‌ها در localStorage ماندگارند. با اتصال بک‌اند واقعی،
 * فقط همین فایل جایگزین می‌شود و بقیه‌ی برنامه دست نمی‌خورد.
 */
import { PRODUCTS, type Product } from "../data/products";
import { faDigits, makeTrackingCode, todayFa } from "./utils";

export type OrderStatus = "preparing" | "shipping" | "delivered";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  preparing: "در حال آماده‌سازی",
  shipping: "ارسال شده",
  delivered: "تحویل شده",
};

export interface StoredOrder {
  code: string;
  date: string;
  name: string;
  phone: string;
  shippingLabel: string;
  paymentLabel: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
}

export interface Address {
  id: string;
  title: string;
  receiver: string;
  phone: string;
  text: string;
}

export interface User {
  phone: string;
  name: string;
}

/* ─────────────── ابزارهای داخلی ─────────────── */

const delay = (ms = 380) => new Promise<void>((r) => setTimeout(r, ms + Math.random() * 260));

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* حافظه در دسترس نیست */
  }
}

const K = {
  orders: "atash-o-daneh-orders",
  overrides: "aod-product-overrides",
  user: "aod-user",
  wishlist: (who: string) => `aod-wishlist-${who}`,
  addresses: (phone: string) => `aod-addresses-${phone}`,
  otp: "aod-otp",
  admin: "aod-admin",
};

/** موجودی اولیه‌ی انبار برشت‌خانه */
const DEFAULT_STOCK: Record<string, number> = {
  "ethiopia-yirgacheffe": 14,
  "colombia-supremo": 9,
  "baron-espresso": 22,
  "brazil-santos": 4,
  "lungo-capsule": 35,
  "swiss-water-decaf": 7,
};

interface ProductOverride {
  price?: number;
  stock?: number;
}

/* ─────────────── API عمومی ─────────────── */

export const api = {
  /* ═══ محصولات ═══ */
  async getProducts(): Promise<Product[]> {
    await delay(520);
    const overrides = read<Record<string, ProductOverride>>(K.overrides, {});
    return PRODUCTS.map((p) => ({
      ...p,
      price: overrides[p.id]?.price ?? p.price,
      stock: overrides[p.id]?.stock ?? DEFAULT_STOCK[p.id] ?? 10,
    }));
  },

  async updateProduct(id: string, patch: ProductOverride): Promise<void> {
    await delay(300);
    const overrides = read<Record<string, ProductOverride>>(K.overrides, {});
    overrides[id] = { ...overrides[id], ...patch };
    write(K.overrides, overrides);
  },

  /* ═══ احراز هویت (OTP پیامکی) ═══ */
  async requestOtp(phone: string): Promise<void> {
    await delay(600);
    const code = String(Math.floor(10000 + Math.random() * 90000));
    sessionStorage.setItem(
      K.otp,
      JSON.stringify({ phone, code, expiresAt: Date.now() + 120_000 }),
    );
  },

  getOtpCode(): string | null {
    try {
      const raw = sessionStorage.getItem(K.otp);
      if (!raw) return null;
      const data = JSON.parse(raw) as { code: string; expiresAt: number };
      return Date.now() < data.expiresAt ? data.code : null;
    } catch {
      return null;
    }
  },

  async verifyOtp(phone: string, code: string): Promise<User> {
    await delay(450);
    const expected = api.getOtpCode();
    if (!expected || expected !== code.trim()) {
      throw new Error("کد واردشده نادرست است یا منقضی شده.");
    }
    sessionStorage.removeItem(K.otp);
    const existing = read<User | null>(K.user, null);
    const user: User =
      existing && existing.phone === phone ? existing : { phone, name: "" };
    write(K.user, user);
    return user;
  },

  getUser(): User | null {
    return read<User | null>(K.user, null);
  },

  async saveProfile(user: User): Promise<void> {
    await delay(250);
    write(K.user, user);
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(K.user);
  },

  /* ═══ علاقه‌مندی‌ها ═══ */
  getWishlist(who: string): string[] {
    return read<string[]>(K.wishlist(who), []);
  },

  async toggleWishlist(who: string, productId: string): Promise<string[]> {
    await delay(150);
    const list = api.getWishlist(who);
    const next = list.includes(productId)
      ? list.filter((id) => id !== productId)
      : [...list, productId];
    write(K.wishlist(who), next);
    return next;
  },

  /* ═══ آدرس‌ها ═══ */
  getAddresses(phone: string): Address[] {
    return read<Address[]>(K.addresses(phone), []);
  },

  async saveAddress(phone: string, address: Omit<Address, "id">): Promise<Address> {
    await delay(300);
    const list = api.getAddresses(phone);
    const full: Address = { ...address, id: `addr-${Date.now()}` };
    write(K.addresses(phone), [...list, full]);
    return full;
  },

  async deleteAddress(phone: string, id: string): Promise<void> {
    await delay(200);
    write(
      K.addresses(phone),
      api.getAddresses(phone).filter((a) => a.id !== id),
    );
  },

  /* ═══ سفارش‌ها ═══ */
  getOrders(): StoredOrder[] {
    return read<StoredOrder[]>(K.orders, []);
  },

  getUserOrders(phone: string): StoredOrder[] {
    return api.getOrders().filter((o) => o.phone === phone);
  },

  async submitOrder(
    data: Omit<StoredOrder, "code" | "date" | "status">,
  ): Promise<StoredOrder> {
    await delay(700);
    const order: StoredOrder = {
      ...data,
      code: makeTrackingCode(),
      date: todayFa(),
      status: "preparing",
    };
    /* کاهش موجودی انبار */
    const overrides = read<Record<string, ProductOverride>>(K.overrides, {});
    for (const item of data.items) {
      const product = PRODUCTS.find((p) => p.shortName === item.name);
      if (product) {
        const current = overrides[product.id]?.stock ?? DEFAULT_STOCK[product.id] ?? 10;
        overrides[product.id] = {
          ...overrides[product.id],
          stock: Math.max(0, current - item.qty),
        };
      }
    }
    write(K.overrides, overrides);
    write(K.orders, [order, ...api.getOrders()].slice(0, 30));
    return order;
  },

  async updateOrderStatus(code: string, status: OrderStatus): Promise<void> {
    await delay(300);
    write(
      K.orders,
      api.getOrders().map((o) => (o.code === code ? { ...o, status } : o)),
    );
  },

  /* ═══ آمار (پنل مدیریت) ═══ */
  async getStats() {
    await delay(450);
    const orders = api.getOrders();
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const perProduct = new Map<string, { qty: number; revenue: number }>();
    for (const o of orders) {
      for (const it of o.items) {
        const cur = perProduct.get(it.name) ?? { qty: 0, revenue: 0 };
        perProduct.set(it.name, {
          qty: cur.qty + it.qty,
          revenue: cur.revenue + it.qty * it.price,
        });
      }
    }
    return {
      orderCount: orders.length,
      revenue,
      avgOrder: orders.length ? Math.round(revenue / orders.length) : 0,
      topProducts: [...perProduct.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6),
    };
  },

  /* ═══ پنل مدیریت ═══ */
  isAdmin(): boolean {
    return sessionStorage.getItem(K.admin) === "1";
  },

  async adminLogin(pass: string): Promise<boolean> {
    await delay(500);
    if (pass.trim() === "1234") {
      sessionStorage.setItem(K.admin, "1");
      return true;
    }
    return false;
  },

  adminLogout() {
    sessionStorage.removeItem(K.admin);
  },
};

/** موجودی محصول (با مقدار پیش‌فرض امن) */
export const stockOf = (p: Product): number => p.stock ?? 10;

/** فرمت موجودی به فارسی */
export const faStock = (n: number): string => faDigits(n);
