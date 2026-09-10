"use client";

import { useState } from "react";
import { BlockRenderer, type RawBlock } from "@/components/blocks/registry";
import { BLOCK_TAB } from "@/content/schema/blocks";
import { TopicQuestion, type TopicQuestionData } from "@/components/topic-question";
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
  title,
  blocks,
  questions,
  locale,
}: {
  title: string;
  blocks: RawBlock[];
  questions: TopicQuestionData[];
  locale: Locale;
}) {
  const [tab, setTab] = useState<TabId>("theory");

  const blocksByTab: Record<Exclude<TabId, "questions">, RawBlock[]> = {
    theory: [],
    scheme: [],
    cards: [],
  };
  for (const block of blocks) {
    const target = BLOCK_TAB[block.type as keyof typeof BLOCK_TAB] ?? "scheme";
    blocksByTab[target].push(block);
  }

  return (
    <main className="min-h-dvh pb-24">
      <header className="border-b border-neutral-100 px-6 py-4">
        <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
      </header>

      <nav className="flex gap-1 border-b border-neutral-100 px-4">
        {TAB_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-11 flex-1 rounded-t-lg px-2 py-3 text-sm font-medium ${
              tab === id ? "border-b-2 border-blue-600 text-blue-700" : "text-neutral-500"
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
            : <p className="px-2 py-8 text-center text-sm text-neutral-500">{t(locale, "tabEmpty")}</p>
          : blocksByTab[tab].length > 0
            ? blocksByTab[tab].map((block, i) => <BlockRenderer key={i} block={block} />)
            : <p className="px-2 py-8 text-center text-sm text-neutral-500">{t(locale, "tabEmpty")}</p>}
      </div>
    </main>
  );
}
