"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getRawInitData } from "@/lib/telegram-env";
import { t, type Locale } from "@/lib/i18n";
import { getAppConfigByKey } from "@/apps.config";
import { BottomNav } from "@/components/bottom-nav";

interface HomeSubject {
  key: string;
  title: string;
  titleUz: string;
  total: number;
  done: number;
}

interface AuthResponse {
  firstName: string | null;
  languageCode: string;
  home: { subjects: HomeSubject[]; doneTotal: number; totalTopics: number };
  errorCount: number;
}

async function fetchAuth(initData: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  if (!res.ok) throw new Error("auth_failed");
  return res.json();
}

// TelegramGate уже убедился, что мы внутри Telegram, до монтирования этого
// компонента — читаем initData один раз при монтировании, без хрупкой
// обвязки SDK (см. lib/telegram-env.ts).
function useRawInitData(): string | undefined {
  const [initData] = useState<string | undefined>(() => getRawInitData());
  return initData;
}

function ScreenState({ text, onRetry, retryText }: { text: string; onRetry?: () => void; retryText?: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{text}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-800 dark:text-neutral-200"
        >
          {retryText}
        </button>
      )}
    </main>
  );
}

function daysUntil(dateIso: string): number {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function HomeScreen() {
  const rawInitData = useRawInitData();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["auth", rawInitData],
    queryFn: () => fetchAuth(rawInitData!),
    enabled: Boolean(rawInitData),
    retry: 1,
  });

  const locale: Locale = data?.languageCode === "ru" ? "ru" : "uz";

  if (!rawInitData || isLoading) {
    return <ScreenState text={t(locale, "loading")} />;
  }

  if (isError || !data) {
    return (
      <ScreenState text={t(locale, "authError")} onRetry={() => refetch()} retryText={t(locale, "retryButton")} />
    );
  }

  const appConfig = getAppConfigByKey(process.env.NEXT_PUBLIC_APP_KEY!);
  const days = daysUntil(appConfig.examDate);

  return (
    <main className="min-h-dvh px-6 py-8 pb-24">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {t(locale, "greeting", { name: data.firstName ?? "" })}
      </h1>

      <div className="mt-4 flex gap-3 text-sm">
        <div className="flex-1 rounded-xl bg-blue-50 dark:bg-blue-950 p-3 text-blue-900 dark:text-blue-200">
          {t(locale, "topicsDoneOfTotal", {
            done: String(data.home.doneTotal),
            total: String(data.home.totalTopics),
          })}
        </div>
        <div className="flex-1 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-3 text-neutral-700 dark:text-neutral-300">
          {t(locale, "daysToExam", { days: String(days) })}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.home.subjects.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "homeEmptySubjects")}</p>
        )}
        {data.home.subjects.map((subject) => {
          const title = locale === "ru" ? subject.title : subject.titleUz;
          const pct = subject.total > 0 ? Math.round((subject.done / subject.total) * 100) : 0;
          return (
            <Link
              key={subject.key}
              href={`/subject/${subject.key}`}
              className="block rounded-xl border border-neutral-200 dark:border-neutral-700 p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{title}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {subject.done}/{subject.total}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
              </div>
            </Link>
          );
        })}
      </div>

      <BottomNav locale={locale} errorCount={data.errorCount} />
    </main>
  );
}
