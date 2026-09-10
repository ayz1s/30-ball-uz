"use client";

import { useState } from "react";
import type { z } from "zod";
import type { flashcardsBlockSchema } from "@/content/schema/blocks";

type FlashcardsBlockData = z.infer<typeof flashcardsBlockSchema>;

export function FlashcardsBlock({ block }: { block: FlashcardsBlockData }) {
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
        className="min-h-32 w-full rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-sm"
      >
        <p className="text-xs text-neutral-400">
          {flipped ? "Ответ" : "Вопрос"} · {index + 1}/{block.cards.length}
        </p>
        <p className="mt-2 text-lg text-neutral-900">{flipped ? card.answer : card.question}</p>
      </button>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className="flex-1 rounded-lg bg-neutral-100 py-3 text-sm font-medium text-neutral-700"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="flex-1 rounded-lg bg-neutral-100 py-3 text-sm font-medium text-neutral-700"
        >
          Дальше
        </button>
      </div>
    </div>
  );
}
