import { getCurrentUser } from "@/lib/auth";
import { ComingSoon } from "@/components/coming-soon";
import type { Locale } from "@/lib/i18n";

export default async function TestsPage() {
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";
  return <ComingSoon locale={locale} />;
}
