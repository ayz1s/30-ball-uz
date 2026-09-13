"use client";

import { useState } from "react";
import { TopicQuestion } from "@/components/topic-question";
import type { ErrorEntry } from "@/lib/quiz";
import { t, type Locale } from "@/lib/i18n";

export function ErrorsList({
  open,
  fixed,
  locale,
}: {
  open: ErrorEntry[];
  fixed: ErrorEntry[];
  locale: Locale;
}) {
  const [tab, setTab] = useState<"open" | "fixed">("open");
  const [openItems, setOpenItems] = useState(open);
  const [fixedItems, setFixedItems] = useState(fixed);

  function handleAnswered(item: ErrorEntry, correct: boolean) {
    if (!correct) return;
    setOpenItems((prev) => prev.filter((i) => i.question.id !== item.question.id));
    setFixedItems((prev) => [item, ...prev]);
  }

  const items = tab === "open" ? openItems : fixedItems;

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1">
        <button
          type="button"
          onClick={() => setTab("open")}
          className={`min-h-10 flex-1 rounded-xl text-sm font-bold ${
            tab === "open"
              ? "bg-white dark:bg-neutral-700 text-blue-700 dark:text-blue-400 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {t(locale, "errorsOpen", { count: String(openItems.length) })}
        </button>
        <button
          type="button"
          onClick={() => setTab("fixed")}
          className={`min-h-10 flex-1 rounded-xl text-sm font-bold ${
            tab === "fixed"
              ? "bg-white dark:bg-neutral-700 text-blue-700 dark:text-blue-400 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {t(locale, "errorsFixed", { count: String(fixedItems.length) })}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="px-2 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {t(locale, tab === "open" ? "errorsOpenEmpty" : "errorsFixedEmpty")}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <TopicQuestion
              key={item.question.id}
              question={item.question}
              locale={locale}
              onAnswered={(correct) => handleAnswered(item, correct)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
