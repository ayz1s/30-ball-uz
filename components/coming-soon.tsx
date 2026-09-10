import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";

export function ComingSoon({ locale }: { locale: Locale }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 pb-20 text-center">
      <h1 className="text-lg font-semibold text-neutral-900">{t(locale, "comingSoonTitle")}</h1>
      <p className="max-w-xs text-sm text-neutral-500">{t(locale, "comingSoonBody")}</p>
      <BottomNav locale={locale} />
    </main>
  );
}
