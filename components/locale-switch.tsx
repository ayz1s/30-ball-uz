"use client";

import type { Locale } from "@/lib/i18n";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "uz", label: "UZ" },
  { value: "ru", label: "RU" },
];

export function LocaleSwitch({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className="inline-flex shrink-0 gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            locale === option.value
              ? "bg-white dark:bg-neutral-700 text-blue-700 dark:text-blue-400 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
