"use client";

import { useState } from "react";
import type { z } from "zod";
import type { stepsBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type StepsBlockData = z.infer<typeof stepsBlockSchema>;

export function StepsBlock({ block }: { block: StepsBlockData; locale: Locale }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {block.condition && (
        <p className="rounded-xl bg-neutral-900 dark:bg-black px-4 py-3 text-sm font-medium text-white">
          {block.condition}
        </p>
      )}
      <ol className="space-y-2">
        {block.steps.map((step, i) => (
          <li key={i} className="rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950">
            <button
              type="button"
              onClick={() => setOpenIndex((idx) => (idx === i ? null : i))}
              className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-indigo-900 dark:text-indigo-100">
                <span className="mr-2 text-indigo-400 dark:text-indigo-500">{i + 1}.</span>
                {step.text}
              </span>
              <span className="text-indigo-400 dark:text-indigo-500">{openIndex === i ? "–" : "+"}</span>
            </button>
            {openIndex === i && (
              <p className="border-t border-indigo-100 dark:border-indigo-900 px-4 py-3 text-sm text-indigo-800 dark:text-indigo-300">{step.explanation}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
