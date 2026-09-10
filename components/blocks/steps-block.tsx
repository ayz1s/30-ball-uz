"use client";

import { useState } from "react";
import type { z } from "zod";
import type { stepsBlockSchema } from "@/content/schema/blocks";

type StepsBlockData = z.infer<typeof stepsBlockSchema>;

export function StepsBlock({ block }: { block: StepsBlockData }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ol className="space-y-2">
      {block.steps.map((step, i) => (
        <li key={i} className="rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => setOpenIndex((idx) => (idx === i ? null : i))}
            className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="text-neutral-900">
              <span className="mr-2 text-neutral-400">{i + 1}.</span>
              {step.text}
            </span>
            <span className="text-neutral-400">{openIndex === i ? "–" : "+"}</span>
          </button>
          {openIndex === i && (
            <p className="border-t border-neutral-100 px-4 py-3 text-sm text-neutral-600">{step.explanation}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
