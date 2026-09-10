"use client";

import { useState } from "react";
import type { z } from "zod";
import type { morphemesBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type MorphemesBlockData = z.infer<typeof morphemesBlockSchema>;

const KIND_COLORS = [
  "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200",
  "bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200",
  "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200",
  "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-200",
];

function colorFor(kind: string, kinds: string[]) {
  return KIND_COLORS[kinds.indexOf(kind) % KIND_COLORS.length];
}

export function MorphemesBlock({ block }: { block: MorphemesBlockData; locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const kinds = [...new Set(block.parts.map((p) => p.kind))];

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex flex-wrap gap-1 text-2xl font-semibold">
        {block.parts.map((part, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex((idx) => (idx === i ? null : i))}
            className={`min-h-11 rounded-md px-1 ${colorFor(part.kind, kinds)} ${
              activeIndex === i ? "ring-2 ring-neutral-900" : ""
            }`}
          >
            {part.text}
          </button>
        ))}
      </div>
      {activeIndex !== null && (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          <span className="font-medium">{block.parts[activeIndex].kind}:</span>{" "}
          {block.parts[activeIndex].explanation}
        </p>
      )}
    </div>
  );
}
