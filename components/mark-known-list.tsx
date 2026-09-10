"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

export interface MarkKnownTopic {
  id: string;
  title: string;
  classTitle: string;
  chapterTitle: string;
  known: boolean;
}

export function MarkKnownList({ topics, locale }: { topics: MarkKnownTopic[]; locale: Locale }) {
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set(topics.filter((t) => t.known).map((t) => t.id)));
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [failedId, setFailedId] = useState<string | null>(null);

  async function markKnown(topicId: string) {
    if (knownIds.has(topicId)) return;
    setFailedId(null);
    setKnownIds((prev) => new Set(prev).add(topicId));
    setPendingIds((prev) => new Set(prev).add(topicId));
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, status: "known" }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setKnownIds((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
      setFailedId(topicId);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

  if (topics.length === 0) {
    return (
      <p className="px-2 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        {t(locale, "markKnownEmpty")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {topics.map((topic) => {
        const known = knownIds.has(topic.id);
        return (
          <div key={topic.id}>
            <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-3">
              <div>
                <p className="text-neutral-900 dark:text-neutral-100">{topic.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {topic.classTitle} · {topic.chapterTitle}
                </p>
              </div>
              <button
                type="button"
                disabled={known || pendingIds.has(topic.id)}
                onClick={() => markKnown(topic.id)}
                className={`min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                  known
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                    : "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                }`}
              >
                {known ? t(locale, "markKnownDone") : t(locale, "markKnownButton")}
              </button>
            </div>
            {failedId === topic.id && (
              <p className="mt-1 px-1 text-xs text-red-700 dark:text-red-400">{t(locale, "saveError")}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
