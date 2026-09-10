"use client";

import { useState } from "react";
import type { z } from "zod";
import type { flashcardsBlockSchema } from "@/content/schema/blocks";
import { t, type Locale } from "@/lib/i18n";

type FlashcardsBlockData = z.infer<typeof flashcardsBlockSchema>;

export function FlashcardsBlock({ block, locale }: { block: FlashcardsBlockData; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = block.cards[index];

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => (i + delta + block.cards.length) % block.cards.length);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="min-h-32 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 text-left shadow-sm"
      >
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {flipped ? t(locale, "blockFlashcardAnswer") : t(locale, "blockFlashcardQuestion")} · {index + 1}/
          {block.cards.length}
        </p>
        <p className="mt-2 text-lg text-neutral-900 dark:text-neutral-100">{flipped ? card.answer : card.question}</p>
      </button>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className="flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t(locale, "blockFlashcardBack")}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t(locale, "blockFlashcardNext")}
        </button>
      </div>
    </div>
  );
}
