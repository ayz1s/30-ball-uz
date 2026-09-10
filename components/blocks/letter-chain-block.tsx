"use client";

import { useState } from "react";
import type { z } from "zod";
import type { letterChainBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type LetterChainBlockData = z.infer<typeof letterChainBlockSchema>;

export function LetterChainBlock({ block }: { block: LetterChainBlockData; locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{block.title}</p>
      <div className="flex flex-wrap gap-2">
        {block.letters.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex((idx) => (idx === i ? null : i))}
            className={`h-11 w-11 rounded-full text-lg font-bold ${
              activeIndex === i ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            }`}
          >
            {item.letter}
          </button>
        ))}
      </div>
      {activeIndex !== null && <p className="text-sm text-neutral-600 dark:text-neutral-300">{block.letters[activeIndex].meaning}</p>}
    </div>
  );
}
