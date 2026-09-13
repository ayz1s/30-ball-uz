const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SubjectIcon({ subjectKey, className }: { subjectKey: string; className?: string }) {
  switch (subjectKey) {
    case "math":
      return (
        <svg {...ICON_PROPS} className={className} aria-hidden>
          <path d="M4 19h16" />
          <path d="M6 19V9l6-5 6 5v10" />
          <path d="M10 19v-6h4v6" />
        </svg>
      );
    case "hist":
      return (
        <svg {...ICON_PROPS} className={className} aria-hidden>
          <path d="M4 20h16" />
          <path d="M6 20V10M10 20V10M14 20V10M18 20V10" />
          <path d="M3 10l9-5 9 5" />
        </svg>
      );
    case "lang":
      return (
        <svg {...ICON_PROPS} className={className} aria-hidden>
          <path d="M5 4h11a2 2 0 0 1 2 2v13.5a1.5 1.5 0 0 1-2.4 1.2L12 18l-3.6 2.7A1.5 1.5 0 0 1 6 19.5V6" />
        </svg>
      );
    default:
      return (
        <svg {...ICON_PROPS} className={className} aria-hidden>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
