"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getRawInitData } from "@/lib/telegram-env";
import { t, type Locale } from "@/lib/i18n";
import { getAppConfigByKey } from "@/apps.config";
import { BottomNav } from "@/components/bottom-nav";
import { RingStat } from "@/components/ring-progress";
import { SubjectIcon } from "@/components/subject-icon";

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
    <main className="min-h-dvh px-5 py-6 pb-28">
      <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
        {t(locale, "greeting", { name: data.firstName ?? "" })}
      </h1>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
        <RingStat value={data.home.doneTotal} total={data.home.totalTopics} size={52} />
        <p className="flex-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {t(locale, "topicsDoneOfTotal", {
            done: String(data.home.doneTotal),
            total: String(data.home.totalTopics),
          })}
        </p>
        <span className="shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950 px-3 py-2 text-center text-[11px] font-bold leading-tight text-blue-700 dark:text-blue-400">
          {t(locale, "daysToExam", { days: String(days) })}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        {data.home.subjects.length === 0 && (
          <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "homeEmptySubjects")}</p>
        )}
        {data.home.subjects.map((subject, i) => {
          const title = locale === "ru" ? subject.title : subject.titleUz;
          return (
            <Link
              key={subject.key}
              href={`/subject/${subject.key}`}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <SubjectIcon subjectKey={subject.key} />
              </span>
              <span className="flex-1 font-semibold text-neutral-900 dark:text-neutral-100">{title}</span>
              <RingStat value={subject.done} total={subject.total} size={40} />
            </Link>
          );
        })}
      </div>

      <BottomNav locale={locale} errorCount={data.errorCount} />
    </main>
  );
}
