import Link from "next/link";

export function BackPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
      {label}
    </Link>
  );
}
