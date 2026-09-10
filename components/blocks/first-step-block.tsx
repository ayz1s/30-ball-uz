"use client";

import { useState } from "react";
import type { z } from "zod";
import type { firstStepBlockSchema } from "@/content/schema/blocks";
import { t, type Locale } from "@/lib/i18n";

type FirstStepBlockData = z.infer<typeof firstStepBlockSchema>;
type Choice = FirstStepBlockData["firstChoices"][number];

function ChoiceList({
  title,
  choices,
  isLast,
  onNext,
  locale,
}: {
  title: string;
  choices: Choice[];
  isLast: boolean;
  onNext: () => void;
  locale: Locale;
}) {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const picked = pickedIndex === null ? null : choices[pickedIndex];

  return (
    <div className="space-y-2">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{title}</p>
      <div className="grid gap-2">
        {choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPickedIndex(i)}
            className={`min-h-12 rounded-lg px-4 py-3 text-left text-sm font-medium ${
              pickedIndex === i
                ? choice.correct
                  ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {picked && (
        <div className="space-y-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{picked.feedback}</p>
          {picked.correct &&
            (isLast ? (
              <p className="text-sm font-medium text-green-700 dark:text-green-400">{t(locale, "blockDone")}</p>
            ) : (
              <button type="button" onClick={onNext} className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t(locale, "blockNext")}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export function FirstStepBlock({ block, locale }: { block: FirstStepBlockData; locale: Locale }) {
  const [stage, setStage] = useState<"first" | "second">("first");

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <p className="text-neutral-800 dark:text-neutral-200">{block.problem}</p>
      {stage === "first" ? (
        <ChoiceList
          title={t(locale, "blockFirstStepPrompt1")}
          choices={block.firstChoices}
          isLast={false}
          onNext={() => setStage("second")}
          locale={locale}
        />
      ) : (
        <ChoiceList
          title={t(locale, "blockFirstStepPrompt2")}
          choices={block.secondChoices}
          isLast
          onNext={() => {}}
          locale={locale}
        />
      )}
    </div>
  );
}
