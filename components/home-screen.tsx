"use client";

import { useRawInitData } from "@telegram-apps/sdk-react";
import { useQuery } from "@tanstack/react-query";
import { ensureTelegramSdkInit } from "@/lib/telegram-boot";
import { t, type Locale } from "@/lib/i18n";

ensureTelegramSdkInit();

interface AuthResponse {
  firstName: string | null;
  languageCode: string;
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

  if (isError) {
    return <ScreenState text={t(locale, "authError")} />;
  }

  return (
    <main className="min-h-dvh px-6 py-8">
      <h1 className="text-xl font-semibold text-neutral-900">
        {t(locale, "greeting", { name: data?.firstName ?? "" })}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">{t(locale, "homePlaceholder")}</p>
    </main>
  );
}
