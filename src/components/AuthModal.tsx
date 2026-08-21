import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useShop } from "../lib/shop-context";
import { faDigits, isValidPhone, toEnDigits } from "../lib/utils";
import { BeanIcon, CloseIcon, LogoutIcon, RefreshIcon, SmsIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: Props) {
  const { setUser, pushToast, sendSms } = useShop();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  /* شمارش معکوس ارسال دوباره */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  /* ریست هنگام باز شدن */
  useEffect(() => {
    if (open) {
      setStep("phone");
      setDigits(["", "", "", "", ""]);
      setPhoneError("");
      setOtpError("");
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const requestOtp = async (target?: string) => {
    const p = (target ?? phone).trim();
    if (!isValidPhone(p)) {
      setPhoneError("شماره‌ی موبایل معتبر نیست؛ مثال: ۰۹۱۲۳۴۵۶۷۸۹");
      return;
    }
    setPhoneError("");
    setBusy(true);
    await api.requestOtp(p);
    /* شبیه‌سازی دریافت پیامک — کد همین‌جا «به دستتان می‌رسد» */
    sendSms(`کد ورود به آتش‌ودانه:\n${faDigits(api.getOtpCode() ?? "")}\nاین کد تا ۲ دقیقه معتبر است.`);
    setBusy(false);
    setStep("otp");
    setCountdown(30);
    window.setTimeout(() => inputsRef.current[0]?.focus(), 120);
  };

  const setDigit = (idx: number, raw: string) => {
    const v = toEnDigits(raw).replace(/\D/g, "").slice(-1);
    setOtpError("");
    setDigits((d) => {
      const next = [...d];
      next[idx] = v;
      return next;
    });
    if (v && idx < 4) inputsRef.current[idx + 1]?.focus();
  };

  const onPaste = (raw: string) => {
    const code = toEnDigits(raw).replace(/\D/g, "").slice(0, 5);
    if (code.length < 2) return;
    setDigits(code.split("").concat(Array(5 - code.length).fill("")));
    inputsRef.current[Math.min(code.length, 4)]?.focus();
  };

  const verify = async () => {
    const code = digits.join("");
    if (code.length < 5) {
      setOtpError("کد ۵ رقمی را کامل وارد کنید.");
      return;
    }
    setBusy(true);
    try {
      const user = await api.verifyOtp(phone.trim(), code);
      setUser(user);
      pushToast(`خوش آمدید! ورود با شماره‌ی ${faDigits(user.phone)} انجام شد`);
      onClose();
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "خطایی رخ داد؛ دوباره تلاش کنید.");
      setDigits(["", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  /* تأیید خودکار هنگام کامل شدن کد */
  useEffect(() => {
    if (step === "otp" && digits.every((d) => d !== "") && !busy) void verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, step]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-roast-950/65 backdrop-blur-[3px] transition-opacity duration-400 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-label="ورود به حساب کاربری"
        className={`absolute inset-x-3 top-1/2 mx-auto w-auto max-w-md -translate-y-1/2 overflow-hidden rounded-xl bg-cream-50 shadow-lift transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* سربرگ */}
        <div className="relative bg-roast-900 px-6 py-6 text-cream-100">
          <BeanIcon className="pointer-events-none absolute -top-3 -end-3 h-20 w-20 rotate-12 text-gold-500/15" />
          <button
            onClick={onClose}
            aria-label="بستن"
            className="absolute top-4 end-4 grid h-9 w-9 place-items-center rounded-full text-cream-200/70 transition-all hover:bg-roast-800 hover:text-cream-50 active:scale-90"
          >
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-500 text-roast-950 shadow-card">
            {step === "phone" ? <SmsIcon className="h-6 w-6" /> : <LogoutIcon className="h-6 w-6" />}
          </span>
          <h2 className="font-display mt-4 text-2xl text-cream-50">
            {step === "phone" ? "ورود به حساب کاربری" : "کد تأیید را وارد کنید"}
          </h2>
          <p className="mt-1.5 text-xs leading-6 text-cream-200/65">
            {step === "phone"
              ? "شماره‌ی موبایل‌تان را وارد کنید؛ کد ورود برایتان پیامک می‌شود."
              : `کد ۵ رقمی ارسال‌شده به شماره‌ی ${faDigits(phone)} را وارد کنید.`}
          </p>
        </div>

        <div className="p-6">
          {step === "phone" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void requestOtp();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="login-phone" className="mb-2 block text-xs font-bold text-roast-700">
                  شماره‌ی موبایل
                </label>
                <input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => {
                    setPhone(toEnDigits(e.target.value));
                    setPhoneError("");
                  }}
                  placeholder="09123456789"
                  className={`w-full rounded-xl border bg-cream-100 px-4 py-3.5 text-center text-lg font-bold tracking-[0.15em] text-roast-900 transition-all focus:outline-none ${
                    phoneError
                      ? "border-brick-600 shadow-[0_0_0_4px_rgb(211_47_47/0.12)]"
                      : "border-roast-900/15 focus:border-gold-600 focus:shadow-[0_0_0_4px_rgb(196_154_108/0.15)]"
                  }`}
                />
                {phoneError && (
                  <p className="animate-fade-up mt-2 text-[11px] font-bold text-brick-600">{phoneError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-gold-600 py-3.5 text-sm font-bold text-roast-950 transition-all duration-300 hover:bg-gold-500 active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "در حال ارسال کد…" : "ارسال کد ورود"}
              </button>
              <p className="text-center text-[11px] leading-5 text-roast-600">
                ورود شما به‌معنای پذیرش قوانین فروشگاه است.
                <br />
                <span className="text-gold-700">این یک شبیه‌سازی است؛ پیامک واقعی ارسال نمی‌شود.</span>
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              <div dir="ltr" className="flex justify-center gap-2.5">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={d}
                    inputMode="numeric"
                    aria-label={`رقم ${faDigits(i + 1)} کد`}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      onPaste(e.clipboardData.getData("text"));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
                    }}
                    className={`h-14 w-12 rounded-xl border-2 bg-cream-100 text-center text-xl font-extrabold text-roast-900 transition-all focus:outline-none ${
                      otpError
                        ? "border-brick-600"
                        : d
                          ? "border-gold-600 shadow-[0_0_0_4px_rgb(196_154_108/0.15)]"
                          : "border-roast-900/15 focus:border-gold-600"
                    }`}
                  />
                ))}
              </div>
              {otpError && (
                <p className="animate-fade-up text-center text-[11px] font-bold text-brick-600">{otpError}</p>
              )}
              <button
                onClick={() => void verify()}
                disabled={busy}
                className="w-full rounded-full bg-gold-600 py-3.5 text-sm font-bold text-roast-950 transition-all duration-300 hover:bg-gold-500 active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "در حال بررسی…" : "تأیید کد و ورود"}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setStep("phone")}
                  className="font-semibold text-roast-600 underline decoration-gold-600/50 underline-offset-4 transition-colors hover:text-gold-700"
                >
                  تغییر شماره
                </button>
                <button
                  onClick={() => void requestOtp()}
                  disabled={countdown > 0 || busy}
                  className="flex items-center gap-1.5 font-bold text-gold-700 transition-colors hover:text-gold-600 disabled:text-roast-900/35"
                >
                  <RefreshIcon className="h-3.5 w-3.5" />
                  {countdown > 0 ? `ارسال دوباره تا ${faDigits(countdown)} ثانیه` : "ارسال دوباره‌ی کد"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
