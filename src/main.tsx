import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { runSelfTests } from "./lib/self-test.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

/* خودآزمایی منطق فروشگاه در حالت توسعه */
if (import.meta.env.DEV) {
  runSelfTests();
}

/* ثبت Service Worker برای پشتیبانی آفلاین (فقط در نسخه‌ی تولید) */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* ثبت SW اختیاری است */
    });
  });
}
