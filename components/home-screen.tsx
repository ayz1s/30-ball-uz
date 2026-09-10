"use client";

import Link from "next/link";
import { useRawInitData } from "@telegram-apps/sdk-react";
import { useQuery } from "@tanstack/react-query";
import { ensureTelegramSdkInit } from "@/lib/telegram-boot";
import { t, type Locale } from "@/lib/i18n";
import { getAppConfigByKey } from "@/apps.config";
import { BottomNav } from "@/components/bottom-nav";

ensureTelegramSdkInit();

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

function useSafeRawInitData(): string | undefined {
  try {
    return useRawInitData();
  } catch {
    return undefined;
  }
}

function ScreenState({ text }: { text: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm text-neutral-500">{text}</p>
    </main>
  );
}

function daysUntil(dateIso: string): number {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function HomeScreen() {
  const rawInitData = useSafeRawInitData();

  const { data, isLoading, isError } = useQuery({
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
    return <ScreenState text={t(locale, "authError")} />;
  }

  const appConfig = getAppConfigByKey(process.env.NEXT_PUBLIC_APP_KEY!);
  const days = daysUntil(appConfig.examDate);

  return (
    <main className="min-h-dvh px-6 py-8 pb-24">
      <h1 className="text-xl font-semibold text-neutral-900">
        {t(locale, "greeting", { name: data.firstName ?? "" })}
      </h1>

      <div className="mt-4 flex gap-3 text-sm">
        <div className="flex-1 rounded-xl bg-blue-50 p-3 text-blue-900">
          {t(locale, "topicsDoneOfTotal", {
            done: String(data.home.doneTotal),
            total: String(data.home.totalTopics),
          })}
        </div>
        <div className="flex-1 rounded-xl bg-neutral-50 p-3 text-neutral-700">
          {t(locale, "daysToExam", { days: String(days) })}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.home.subjects.length === 0 && (
          <p className="text-sm text-neutral-500">{t(locale, "homeEmptySubjects")}</p>
        )}
        {data.home.subjects.map((subject) => {
          const title = locale === "ru" ? subject.title : subject.titleUz;
          const pct = subject.total > 0 ? Math.round((subject.done / subject.total) * 100) : 0;
          return (
            <Link
              key={subject.key}
              href={`/subject/${subject.key}`}
              className="block rounded-xl border border-neutral-200 p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-neutral-900">{title}</span>
                <span className="text-xs text-neutral-500">
                  {subject.done}/{subject.total}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
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
