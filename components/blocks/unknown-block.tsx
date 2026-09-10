import { t, type Locale } from "@/lib/i18n";

export function UnknownBlock({ type, locale }: { type: string; locale: Locale }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
      {t(locale, "blockUnknownType", { type })}
    </div>
  );
}
