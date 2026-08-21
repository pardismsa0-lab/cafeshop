import { useEffect, useRef, useState } from "react";

const BARISTA_IMG =
  "https://image.qwenlm.ai/generated-images/f04c94a8-041f-4421-80e4-66cee7e88ecc/_result.png";

interface Msg {
  from: "bot" | "me";
  text: string;
}

const SUGGESTIONS = ["پیشنهاد قهوه", "دم‌آوری V60", "پیگیری سفارش", "ساعات کاری"];

const REPLIES: Record<string, string> = {
  "پیشنهاد قهوه":
    "اگر قهوه‌ی روشن و معطر دوست دارید، اتیوپی یرگاچف با نت‌های یاسمین و ترنج عالی است. اگر طعم کلاسیک شکلاتی می‌خواهید، کلمبیا سوپرمو؛ و برای اسپرسوی پرکرم، بارون را امتحان کنید. ☕",
  "دم‌آوری V60":
    "برای V60: ۱۵ گرم قهوه با آسیاب متوسطِ رو به ریز، ۲۵۰ گرم آب ۹۲ درجه. اول ۴۰ گرم آب بریزید و ۳۰ ثانیه صبر کنید (بلوم)، بعد بقیه را طی ۲ دقیقه اضافه کنید. مجموعاً حدود ۳ دقیقه.",
  "پیگیری سفارش":
    "از دکمه‌ی «سفارش‌های من» در بالای صفحه می‌توانید کد پیگیری و وضعیت لحظه‌ای سفارش‌تان را ببینید. اگر مشکلی بود، همین‌جا بنویسید تا باریستا خبر بدهد.",
  "ساعات کاری":
    "برشت‌خانه‌ی ما شنبه تا پنجشنبه از ۹ صبح تا ۹ شب باز است؛ سه‌شنبه‌ها روز برشت تازه است و بوی قهوه تا سر کوچه می‌آید!",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "سلام! من باریستای آتش‌ودانه هستم. در انتخاب قهوه یا روش دم می‌تونم کمکتون کنم. ☕" },
  ]);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const botSay = (text: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text }]);
    }, 1000 + Math.random() * 600);
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { from: "me", text: t }]);
    setInput("");
    botSay(REPLIES[t] ?? "ممنون از پیامتون! باریستای ما به‌زودی جواب می‌ده. برای سفارش فوری هم می‌تونید با ۰۲۱-۹۱۰۰۸۴۲۰ تماس بگیرید.");
  };

  return (
    <>
      {/* دکمه‌ی شناور */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setSeen(true);
        }}
        aria-label={open ? "بستن گفتگو با باریستا" : "گفتگو با باریستا"}
        className={`group fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full shadow-lift transition-all duration-300 active:scale-90 ${
          open ? "rotate-90 bg-roast-900 text-gold-400" : "bg-gold-600 text-roast-950 hover:bg-gold-500"
        }`}
      >
        {!open && !seen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brick-500 opacity-70" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-cream-100 bg-brick-500" />
          </span>
        )}
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" />
          ) : (
            <>
              <path d="M4 5.5h16A1.5 1.5 0 0 1 21.5 7v8.5A1.5 1.5 0 0 1 20 17H9l-4.2 3.4A.6.6 0 0 1 4 19.9V17a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 4 5.5z" />
              <path d="M8 10h8M8 13h5" />
            </>
          )}
        </svg>
      </button>

      {/* پنل گفتگو */}
      <div
        className={`fixed bottom-22 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] origin-bottom-left overflow-hidden rounded-xl bg-cream-50 shadow-lift ring-1 ring-roast-900/10 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
        aria-hidden={!open}
      >
        {/* سربرگ */}
        <div className="relative h-24 overflow-hidden">
          <img src={BARISTA_IMG} alt="باریستای آتش‌ودانه در حال آماده‌سازی قهوه" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-roast-950/90 via-roast-950/35 to-transparent" />
          <div className="absolute bottom-3 start-4 flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-roast-950 ring-2 ring-cream-50/60">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4.5 10h12v4.6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V10z" />
                <path d="M16.5 11h1.4a2.6 2.6 0 0 1 0 5.2h-1.7" />
              </svg>
              <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-roast-950 bg-olive-500" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-cream-50">باریستای آتش‌ودانه</p>
              <p className="text-[10px] font-semibold text-olive-500">آنلاین — پاسخ در چند ثانیه</p>
            </div>
          </div>
        </div>

        {/* پیام‌ها */}
        <div ref={bodyRef} className="slim-scroll h-64 space-y-2.5 overflow-y-auto bg-cream-100/70 p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <p
                className={`animate-fade-up max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-6 ${
                  m.from === "me"
                    ? "rounded-bl-sm bg-roast-900 text-cream-100"
                    : "rounded-br-sm border border-roast-900/10 bg-cream-50 text-roast-800 shadow-card"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <span className="flex items-center gap-1.5 rounded-xl rounded-br-sm border border-roast-900/10 bg-cream-50 px-4 py-3 shadow-card">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-600"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          )}
        </div>

        {/* پیشنهادهای سریع */}
        <div className="flex flex-wrap gap-1.5 border-t border-roast-900/8 bg-cream-50 px-3 pt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-gold-600/35 bg-gold-500/10 px-3 py-1.5 text-[11px] font-bold text-gold-700 transition-all hover:bg-gold-500/25 active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>

        {/* ورودی */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 bg-cream-50 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پیام‌تان را بنویسید…"
            aria-label="پیام به باریستا"
            className="min-w-0 flex-1 rounded-full border border-roast-900/15 bg-cream-100 px-4 py-2.5 text-[13px] transition-all focus:border-gold-600 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="ارسال پیام"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-600 text-roast-950 transition-all hover:bg-gold-500 active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.5 3.5 3.6 9.8a.7.7 0 0 0 0 1.3l6.2 2.2 2.2 6.2a.7.7 0 0 0 1.3 0l6.3-16.9z" />
              <path d="m10 13.5 4.5-4.5" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
