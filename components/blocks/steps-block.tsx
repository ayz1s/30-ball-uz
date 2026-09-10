"use client";

import { useState } from "react";
import type { z } from "zod";
import type { stepsBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type StepsBlockData = z.infer<typeof stepsBlockSchema>;

export function StepsBlock({ block }: { block: StepsBlockData; locale: Locale }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ol className="space-y-2">
      {block.steps.map((step, i) => (
        <li key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setOpenIndex((idx) => (idx === i ? null : i))}
            className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="text-neutral-900 dark:text-neutral-100">
              <span className="mr-2 text-neutral-400 dark:text-neutral-500">{i + 1}.</span>
              {step.text}
            </span>
            <span className="text-neutral-400 dark:text-neutral-500">{openIndex === i ? "–" : "+"}</span>
          </button>
          {openIndex === i && (
            <p className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{step.explanation}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
