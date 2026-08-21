import { useEffect } from "react";

/** تنظیم عنوان و توضیحات صفحه (SEO متاتگ‌ها) */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  }, [title, description]);
}

/** تزریق داده‌ی ساختاریافته‌ی Schema.org (JSON-LD) */
export function useJsonLd(id: string, data: Record<string, unknown> | null) {
  useEffect(() => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    if (!data) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id, data]);
}
