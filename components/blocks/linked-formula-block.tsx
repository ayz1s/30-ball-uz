"use client";

import { useState } from "react";
import type { z } from "zod";
import type { linkedFormulaBlockSchema } from "@/content/schema/blocks";

type LinkedFormulaBlockData = z.infer<typeof linkedFormulaBlockSchema>;

export function LinkedFormulaBlock({ block }: { block: LinkedFormulaBlockData }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 p-4">
      <p className="text-neutral-800">{block.problem}</p>
      <div className="flex flex-wrap gap-2">
        {block.links.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => setActiveId((id) => (id === link.id ? null : link.id))}
            className={`min-h-11 rounded-full px-3 py-2 text-sm font-medium ${
              activeId === link.id ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {link.problemLabel}
          </button>
        ))}
      </div>
      <p className="rounded-lg bg-neutral-50 p-3 text-center font-mono text-lg text-neutral-900">{block.formula}</p>
      <div className="flex flex-wrap gap-2">
        {block.links.map((link) => (
          <span
            key={link.id}
            className={`rounded-full px-3 py-2 text-sm font-medium ${
              activeId === link.id ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {link.formulaLabel}
          </span>
        ))}
      </div>
    </div>
  );
}
