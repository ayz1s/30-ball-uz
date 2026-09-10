"use client";

import { useState } from "react";
import type { z } from "zod";
import type { letterChainBlockSchema } from "@/content/schema/blocks";

type LetterChainBlockData = z.infer<typeof letterChainBlockSchema>;

export function LetterChainBlock({ block }: { block: LetterChainBlockData }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <p className="font-medium text-neutral-900">{block.title}</p>
      <div className="flex flex-wrap gap-2">
        {block.letters.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex((idx) => (idx === i ? null : i))}
            className={`h-11 w-11 rounded-full text-lg font-bold ${
              activeIndex === i ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-800"
            }`}
          >
            {item.letter}
          </button>
        ))}
      </div>
      {activeIndex !== null && <p className="text-sm text-neutral-600">{block.letters[activeIndex].meaning}</p>}
    </div>
  );
}
