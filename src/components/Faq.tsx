import { useState } from "react";
import { MinusIcon, PlusIcon } from "./icons";

const FAQS = [
  {
    q: "قهوه‌ها چقدر تازه هستند و تاریخ برشت کجاست؟",
    a: "هر لات حداکثر ۷ روز پس از برشت ارسال می‌شود و تاریخ دقیق برشت روی پاکت چاپ شده است. پاکت‌ها دارای سوپاپ یک‌طرفه‌ی تازه‌نگهدار هستند تا گاز دی‌اکسیدکربن خارج و عطر حفظ شود.",
  },
  {
    q: "امکان آسیاب سفارشی برای موکاپات، کمکس یا اسپرسو دارید؟",
    a: "بله؛ هنگام ثبت سفارش در بخش «توضیحات» بنویسید برای چه روش دمی می‌خواهید تا همان روز برشت، با درجه‌ی آسیاب مناسب برایتان آماده کنیم. بدون هزینه‌ی اضافه.",
  },
  {
    q: "ارسال به شهرستان چقدر طول می‌کشد؟",
    a: "سفارش‌های پست پیشتاز معمولاً ۲ تا ۴ روز کاری بعد به دستتان می‌رسد. برای تهران، پیک موتوری همان روز تحویل می‌دهد. بالای ۵۰۰ هزار تومان، هزینه‌ی ارسال رایگان است.",
  },
  {
    q: "اگر از طعم قهوه راضی نبودم چه می‌شود؟",
    a: "تا ۷ روز پس از دریافت، اگر بسته باز نشده باشد، بدون قید و شرط مرجوع می‌کنیم و مبلغ را برمی‌گردانیم. اگر بسته باز شده و طعم مطابق پروفایل اعلامی نبود، با تیم پشتیبانی تماس بگیرید؛ لات بعدی را مهمان ما هستید.",
  },
  {
    q: "دکف سوئیس‌واتر واقعاً بدون کافئین است؟",
    a: "روش سوئیس‌واتر ۹۹٫۹٪ کافئین را فقط با آب خالص حذف می‌کند — بدون هیچ حلال شیمیایی. برای نوشیدن عصرگاهی و شبانه کاملاً بی‌دغدغه است.",
  },
  {
    q: "قهوه را چطور نگهداری کنم؟",
    a: "در همان پاکت سوپاپ‌دار، درِ بسته، دور از نور و گرما (کابینت آشپزخانه عالی است). برخلاف باور عمومی، یخچال و فریزر رطوبت وارد قهوه می‌کنند و عطرش را می‌گیرند.",
  },
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 pb-4">
      <div className="reveal text-center">
        <p className="inline-flex items-center gap-2 text-xs font-bold text-gold-700">
          <span className="h-px w-8 bg-gold-600" />
          پشتیبانی
          <span className="h-px w-8 bg-gold-600" />
        </p>
        <h2 className="font-display mt-3 text-3xl text-roast-900 md:text-4xl">پرسش‌های پرتکرار</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-roast-600">
          پاسخ چیزهایی که بیشتر از ما می‌پرسید — از تازگی دانه تا شیوه‌ی نگهداری
        </p>
      </div>

      <div className="reveal mt-9 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={f.q}
              className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                isOpen
                  ? "border-gold-600/50 bg-cream-50 shadow-lift"
                  : "border-roast-900/10 bg-cream-50/70 shadow-card hover:border-gold-600/40"
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
              >
                <span
                  className={`text-[15px] font-extrabold transition-colors ${
                    isOpen ? "text-gold-700" : "text-roast-900"
                  }`}
                >
                  {f.q}
                </span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                    isOpen
                      ? "rotate-180 bg-gold-600 text-roast-950"
                      : "bg-roast-900/8 text-roast-700"
                  }`}
                >
                  {isOpen ? <MinusIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="border-t border-roast-900/8 px-5 pb-5 pt-3.5 text-sm leading-8 text-roast-600">
                    {f.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="reveal mt-6 text-center text-xs text-roast-600">
        پاسختان را پیدا نکردید؟ با شماره‌ی <strong className="font-bold text-gold-700" dir="ltr">۰۲۱-۹۱۰۰-۸۴۲۰</strong> تماس بگیرید؛ باریستای ما پاسخ می‌دهد.
      </p>
    </section>
  );
}
