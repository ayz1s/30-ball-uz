import { getCurrentUser } from "@/lib/auth";
import { getErrorsOverview } from "@/lib/quiz";
import { ErrorsList } from "@/components/errors-list";
import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";

export default async function ErrorsPage() {
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";

  const { open, fixed } = user ? await getErrorsOverview(user.id) : { open: [], fixed: [] };

  return (
    <main className="min-h-dvh px-5 py-6 pb-28">
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">{t(locale, "navErrors")}</h1>
      <ErrorsList open={open} fixed={fixed} locale={locale} />
      <BottomNav locale={locale} errorCount={open.length} />
    </main>
  );
}
