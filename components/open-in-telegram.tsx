import { t } from "@/lib/i18n";

export function OpenInTelegram() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold text-neutral-900">{t("uz", "openInTelegramTitle")}</h1>
      <p className="max-w-xs text-sm text-neutral-500">{t("uz", "openInTelegramBody")}</p>
    </main>
  );
}
