import { useEffect, useMemo, useState } from "react";
import { BRAND } from "../data/products";
import { faDigits, formatToman, toEnDigits } from "../lib/utils";
import { CardIcon, CheckIcon, CloseIcon, LockIcon } from "./icons";

interface Props {
  open: boolean;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const luhn = (num: string): boolean => {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return num.length === 16 && sum % 10 === 0;
};

const TEST_CARD = "4111111111111111";

type Phase = "form" | "processing" | "success";

export default function PaymentGateway({ open, amount, onSuccess, onCancel }: Props) {
  const [phase, setPhase] = useState<Phase>("form");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<{ card?: string; expiry?: string; cvv?: string }>({});
  const [seconds, setSeconds] = useState(600);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timer = useMemo(
    () => `${faDigits(String(minutes).padStart(2, "0"))}:${faDigits(String(secs).padStart(2, "0"))}`,
    [minutes, secs],
  );

  useEffect(() => {
    if (open) {
      setPhase("form");
      setCard("");
      setExpiry("");
      setCvv("");
      setErrors({});
      setSeconds(600);
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "form") return;
    const t = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [open, phase]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const formatCard = (raw: string) =>
    toEnDigits(raw)
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (raw: string) => {
    const d = toEnDigits(raw).replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validate = () => {
    const next: typeof errors = {};
    const digits = card.replace(/\s/g, "");
    if (!luhn(digits)) next.card = "شماره کارت نامعتبر است (۱۶ رقم).";
    const m = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) next.expiry = "تاریخ انقضا نامعتبر است.";
    if (!/^\d{3,4}$/.test(cvv)) next.cvv = "CVV2 باید ۳ یا ۴ رقم باشد.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const pay = () => {
    if (phase !== "form" || seconds === 0) return;
    if (!validate()) return;
    setPhase("processing");
    window.setTimeout(() => {
      setPhase("success");
      window.setTimeout(onSuccess, 1400);
    }, 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-roast-950/85 p-4 backdrop-blur-sm">
      <div className="animate-fade-up w-full max-w-md overflow-hidden rounded-xl bg-cream-50 shadow-lift">
        {/* سربرگ بانک */}
        <div className="bg-roast-900 px-6 py-5 text-cream-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-cream-50/10 ring-1 ring-gold-500/30">
                <LockIcon className="h-5.5 w-5.5 text-gold-400" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-cream-50">درگاه پرداخت امن بانکی</p>
                <p className="mt-0.5 text-[11px] text-cream-200/60">شبیه‌سازی — هیچ مبلغی کسر نمی‌شود</p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 font-display text-lg tracking-widest ${
                seconds < 60 ? "bg-brick-600/25 text-brick-500" : "bg-gold-500/15 text-gold-300"
              }`}
              dir="ltr"
            >
              {timer}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-roast-800/70 px-4 py-3 text-xs">
            <span className="text-cream-200/70">پذیرنده: {BRAND}</span>
            <span className="font-extrabold text-gold-300">{formatToman(amount)}</span>
          </div>
        </div>

        {phase === "form" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              pay();
            }}
            className="space-y-4 p-6"
          >
            <div>
              <label htmlFor="gw-card" className="mb-1.5 flex items-center justify-between text-xs font-bold text-roast-700">
                شماره کارت
                <button
                  type="button"
                  onClick={() => {
                    setCard(formatCard(TEST_CARD));
                    setErrors((er) => ({ ...er, card: undefined }));
                  }}
                  className="text-[10px] font-bold text-gold-700 underline decoration-gold-600/50 underline-offset-2 hover:text-gold-600"
                >
                  پر کردن کارت آزمایشی
                </button>
              </label>
              <div className="relative">
                <CardIcon className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-700" />
                <input
                  id="gw-card"
                  dir="ltr"
                  inputMode="numeric"
                  value={card}
                  onChange={(e) => {
                    setCard(formatCard(e.target.value));
                    setErrors((er) => ({ ...er, card: undefined }));
                  }}
                  placeholder="6037 9911 •••• ••••"
                  className={`w-full rounded-xl border bg-cream-100 py-3.5 pe-4 ps-11 text-center text-lg font-bold tracking-[0.08em] text-roast-900 transition-all focus:outline-none ${
                    errors.card
                      ? "border-brick-600"
                      : "border-roast-900/15 focus:border-gold-600 focus:shadow-[0_0_0_4px_rgb(196_154_108/0.15)]"
                  }`}
                />
              </div>
              {errors.card && <p className="mt-1.5 text-[11px] font-bold text-brick-600">{errors.card}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gw-exp" className="mb-1.5 block text-xs font-bold text-roast-700">
                  انقضا (ماه/سال)
                </label>
                <input
                  id="gw-exp"
                  dir="ltr"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => {
                    setExpiry(formatExpiry(e.target.value));
                    setErrors((er) => ({ ...er, expiry: undefined }));
                  }}
                  placeholder="06/08"
                  className={`w-full rounded-xl border bg-cream-100 px-4 py-3.5 text-center text-base font-bold text-roast-900 transition-all focus:outline-none ${
                    errors.expiry ? "border-brick-600" : "border-roast-900/15 focus:border-gold-600"
                  }`}
                />
                {errors.expiry && <p className="mt-1.5 text-[11px] font-bold text-brick-600">{errors.expiry}</p>}
              </div>
              <div>
                <label htmlFor="gw-cvv" className="mb-1.5 block text-xs font-bold text-roast-700">
                  CVV2
                </label>
                <input
                  id="gw-cvv"
                  dir="ltr"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(toEnDigits(e.target.value).replace(/\D/g, "").slice(0, 4));
                    setErrors((er) => ({ ...er, cvv: undefined }));
                  }}
                  placeholder="•••"
                  className={`w-full rounded-xl border bg-cream-100 px-4 py-3.5 text-center text-base font-bold tracking-[0.3em] text-roast-900 transition-all focus:outline-none ${
                    errors.cvv ? "border-brick-600" : "border-roast-900/15 focus:border-gold-600"
                  }`}
                />
                {errors.cvv && <p className="mt-1.5 text-[11px] font-bold text-brick-600">{errors.cvv}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={seconds === 0}
              className="w-full rounded-full bg-olive-600 py-4 text-sm font-extrabold text-cream-50 shadow-[0_12px_28px_-10px_rgb(85_139_47/0.7)] transition-all duration-300 hover:bg-olive-500 active:scale-[0.98] disabled:opacity-40"
            >
              پرداخت {formatToman(amount)}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-full border border-roast-900/15 py-3 text-xs font-bold text-roast-700 transition-all hover:border-brick-600 hover:text-brick-600"
            >
              انصراف و بازگشت به فروشگاه
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-roast-600/80">
              <LockIcon className="h-3.5 w-3.5" />
              اتصال امن TLS — اطلاعات کارت شما ذخیره نمی‌شود
            </p>
          </form>
        )}

        {phase === "processing" && (
          <div className="grid place-items-center px-6 py-16 text-center">
            <span className="relative grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-gold-500/25 border-t-gold-600" />
              <CardIcon className="h-8 w-8 text-gold-700" />
            </span>
            <p className="font-display mt-6 text-xl text-roast-900">در حال پردازش پرداخت…</p>
            <p className="mt-2 text-xs text-roast-600">لطفاً پنجره را نبندید</p>
          </div>
        )}

        {phase === "success" && (
          <div className="grid place-items-center px-6 py-16 text-center">
            <span className="animate-pop grid h-20 w-20 place-items-center rounded-full bg-olive-600 text-cream-50 shadow-[0_20px_50px_-15px_rgb(85_139_47/0.7)]">
              <CheckIcon className="h-9 w-9" strokeWidth={2.6} />
            </span>
            <p className="font-display mt-6 text-xl text-roast-900">پرداخت با موفقیت انجام شد</p>
            <p className="mt-2 text-xs text-roast-600">در حال بازگشت به فروشگاه…</p>
          </div>
        )}

        {phase === "form" && seconds === 0 && (
          <div className="border-t border-brick-600/20 bg-brick-600/10 px-6 py-3 text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-bold text-brick-600">
              <CloseIcon className="h-4 w-4" /> زمان جلسه تمام شد؛ دوباره از فروشگاه تلاش کنید.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
