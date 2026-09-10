"use client";

import { useState } from "react";
import type { z } from "zod";
import type { morphemesBlockSchema } from "@/content/schema/blocks";

type MorphemesBlockData = z.infer<typeof morphemesBlockSchema>;

const KIND_COLORS = [
  "bg-blue-100 text-blue-900",
  "bg-amber-100 text-amber-900",
  "bg-green-100 text-green-900",
  "bg-purple-100 text-purple-900",
];

function colorFor(kind: string, kinds: string[]) {
  return KIND_COLORS[kinds.indexOf(kind) % KIND_COLORS.length];
}

export function MorphemesBlock({ block }: { block: MorphemesBlockData }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const kinds = [...new Set(block.parts.map((p) => p.kind))];

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
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
        <p className="text-sm text-neutral-600">
          <span className="font-medium">{block.parts[activeIndex].kind}:</span>{" "}
          {block.parts[activeIndex].explanation}
        </p>
      )}
    </div>
  );
}
