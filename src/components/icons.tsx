import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P): P => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...props,
});

/** دانه‌ی قهوه */
export const BeanIcon = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="12" rx="5.6" ry="8" transform="rotate(28 12 12)" />
    <path d="M8.6 5.4c3.6 2.3 3.7 5 1.6 7.2s-1.8 4.9 1 7.1" />
  </svg>
);

/** لوگو: فنجان با بخار */
export const CupIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 10h12v4.6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V10z" />
    <path d="M16.5 11h1.4a2.6 2.6 0 0 1 0 5.2h-1.7" />
    <path d="M3.5 21.5h14" />
    <path d="M8.4 3.6c-.9 1.1-.9 2.1 0 3.2M12.6 3.6c-.9 1.1-.9 2.1 0 3.2" />
  </svg>
);

/** بخار متحرک (برای قرار گرفتن روی تصاویر) */
export const SteamIcon = (p: P) => (
  <svg {...base(p)}>
    <path className="animate-steam" d="M6 16c-1.4 1.7-1.4 3.4 0 5.2" />
    <path className="animate-steam" style={{ animationDelay: "0.7s" }} d="M12 14c-1.4 1.7-1.4 3.4 0 5.2" />
    <path className="animate-steam" style={{ animationDelay: "1.4s" }} d="M18 16c-1.4 1.7-1.4 3.4 0 5.2" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m15.5 15.5 4.6 4.6" />
  </svg>
);

export const CartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.8 3.5h2.3l2.2 11.6a1.8 1.8 0 0 0 1.8 1.5h8.2a1.8 1.8 0 0 0 1.8-1.4l1.6-7.2H6" />
    <circle cx="9.6" cy="20" r="1.4" />
    <circle cx="17.4" cy="20" r="1.4" />
  </svg>
);

export const StarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.6l2.9 5.9 6.5 1-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-1L12 2.6z" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const MinusIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 12h13" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5h16M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M6.2 6.5l.9 12.2a1.8 1.8 0 0 0 1.8 1.7h6.2a1.8 1.8 0 0 0 1.8-1.7l.9-12.2" />
    <path d="M10 10.5v6M14 10.5v6" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const BackIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const ArrowIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const FlameIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21c3.9 0 6.5-2.5 6.5-6.2 0-2.6-1.5-4.5-2.9-6.3C14.2 6.7 13 4.9 13 2.5c-3.3 1.6-4.6 4.5-4.2 7.2-.9-.3-1.6-1-1.9-2.3-1 1.3-1.4 3-1.4 4.7C5.5 18.5 8.1 21 12 21z" />
    <path d="M12 21c1.9 0 3.2-1.3 3.2-3.1 0-1.6-1.1-2.6-2-3.8-.5-.7-1-1.5-1.2-2.5-1.6 1.2-3.2 3.5-3.2 6.2 0 1.8 1.3 3.2 3.2 3.2z" />
  </svg>
);

export const TruckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6h11.5v10H2.5zM14 9.5h4l2.5 3.5v3h-2.7" />
    <circle cx="6.6" cy="17.6" r="1.7" />
    <circle cx="16.6" cy="17.6" r="1.7" />
    <path d="M8.3 17.6h5.7" />
  </svg>
);

export const LeafIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 19C5 9.5 11 4.5 20 4.5c0 9.5-6 14.5-15 14.5z" />
    <path d="M5 19c3.2-5.5 6.5-8.8 10.5-11" />
  </svg>
);

export const PackageIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 3.5 7.2v9.6L12 21l8.5-4.2V7.2L12 3z" />
    <path d="M3.5 7.2 12 11.5l8.5-4.3M12 11.5V21" />
    <path d="m7.8 5.2 8.4 4.2" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 5 5.8v5.4c0 4.6 3 7.8 7 9.3 4-1.5 7-4.7 7-9.3V5.8L12 3z" />
    <path d="m8.8 11.6 2.3 2.3 4.1-4.4" />
  </svg>
);

export const PhoneIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.2 3.5h3.4l1.6 4.2-2.1 1.6a12.8 12.8 0 0 0 6.6 6.6l1.6-2.1 4.2 1.6v3.4a1.8 1.8 0 0 1-2 1.8C10.4 19.8 4.2 13.6 3.4 5.5a1.8 1.8 0 0 1 1.8-2z" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21.5s-6.8-6-6.8-11a6.8 6.8 0 1 1 13.6 0c0 5-6.8 11-6.8 11z" />
    <circle cx="12" cy="10.3" r="2.4" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2.2" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

export const CardIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
    <path d="M3 10h18M6.5 14.5h4" />
  </svg>
);

export const CashIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="6.5" width="18.4" height="11" rx="1.8" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9.5h.01M18 14.5h.01" />
  </svg>
);

export const StoreIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5 5.5 4h13L20 9.5M4 9.5a2.6 2.6 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.6 2.6 0 0 0 5.3 0M5 12v8h14v-8" />
    <path d="M9.5 20v-5h5v5" />
  </svg>
);

export const ScaleIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v16M7 20h10" />
    <path d="M5 7h14M5 7 3 12.5a2.8 2.8 0 0 0 4 0L5 7zM19 7l-2 5.5a2.8 2.8 0 0 0 4 0L19 7z" />
  </svg>
);

export const InstagramIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r="0.4" fill="currentColor" />
  </svg>
);

export const TelegramIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m21 4.5-3.2 15.2a.8.8 0 0 1-1.2.5l-4.4-3.3-2.4 2.4a.8.8 0 0 1-1.3-.5L7.6 14 3.4 12.6a.8.8 0 0 1 0-1.5l16.5-7a.8.8 0 0 1 1.1.9z" />
    <path d="m7.6 14 10-8.4-7.7 9.4" />
  </svg>
);
