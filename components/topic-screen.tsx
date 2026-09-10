"use client";

import { useState } from "react";
import Link from "next/link";
import { BlockRenderer, type RawBlock } from "@/components/blocks/registry";
import { BLOCK_TAB } from "@/content/schema/blocks";
import { TopicQuestion, type TopicQuestionData } from "@/components/topic-question";
import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";

type TabId = "theory" | "scheme" | "cards" | "questions";

const TAB_ORDER: TabId[] = ["theory", "scheme", "cards", "questions"];
const TAB_LABEL_KEY: Record<TabId, "tabTheory" | "tabScheme" | "tabCards" | "tabQuestions"> = {
  theory: "tabTheory",
  scheme: "tabScheme",
  cards: "tabCards",
  questions: "tabQuestions",
};

export function TopicScreen({
  topicId,
  title,
  blocks,
  questions,
  locale,
  initialDone,
  nextTopic,
  errorCount,
}: {
  topicId: string;
  title: string;
  blocks: RawBlock[];
  questions: TopicQuestionData[];
  locale: Locale;
  initialDone: boolean;
  nextTopic: { slug: string; title: string } | null;
  errorCount: number;
}) {
  const [tab, setTab] = useState<TabId>("theory");
  const [done, setDone] = useState(initialDone);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const blocksByTab: Record<Exclude<TabId, "questions">, RawBlock[]> = {
    theory: [],
    scheme: [],
    cards: [],
  };
  for (const block of blocks) {
    const target = BLOCK_TAB[block.type as keyof typeof BLOCK_TAB] ?? "scheme";
    blocksByTab[target].push(block);
  }

  async function markDone() {
    if (done || saving) return;
    setSaving(true);
    setSaveFailed(false);
    setDone(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, status: "done" }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setDone(false);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-dvh pb-24">
      <header className="border-b border-neutral-100 dark:border-neutral-800 px-6 py-4">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
      </header>

      <nav className="flex gap-1 border-b border-neutral-100 dark:border-neutral-800 px-4">
        {TAB_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-11 flex-1 rounded-t-lg px-2 py-3 text-sm font-medium ${
              tab === id ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-400" : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {t(locale, TAB_LABEL_KEY[id])}
          </button>
        ))}
      </nav>

      <div className="space-y-4 px-4 py-4">
        {tab === "questions"
          ? questions.length > 0
            ? questions.map((q) => <TopicQuestion key={q.id} question={q} locale={locale} />)
            : <p className="px-2 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "tabEmpty")}</p>
          : blocksByTab[tab].length > 0
            ? blocksByTab[tab].map((block, i) => <BlockRenderer key={i} block={block} locale={locale} />)
            : <p className="px-2 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "tabEmpty")}</p>}
      </div>

      <div className="space-y-2 px-4 pt-2">
        <button
          type="button"
          onClick={markDone}
          disabled={done}
          className={`min-h-12 w-full rounded-xl text-sm font-medium ${
            done ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
          }`}
        >
          {done ? t(locale, "topicDoneMark") : t(locale, "topicDoneButton")}
        </button>
        {saveFailed && (
          <p className="text-center text-sm text-red-700 dark:text-red-400">
            {t(locale, "saveError")}{" "}
            <button type="button" onClick={markDone} className="underline">
              {t(locale, "retryButton")}
            </button>
          </p>
        )}

        {nextTopic ? (
          <Link
            href={`/topic/${nextTopic.slug}`}
            className="block min-h-12 w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-medium text-white"
          >
            {t(locale, "nextTopicButton", { title: nextTopic.title })}
          </Link>
        ) : (
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "nextTopicNone")}</p>
        )}
      </div>

      <BottomNav locale={locale} errorCount={errorCount} />
    </main>
  );
}
