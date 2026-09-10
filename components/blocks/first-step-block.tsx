"use client";

import { useState } from "react";
import type { z } from "zod";
import type { firstStepBlockSchema } from "@/content/schema/blocks";

type FirstStepBlockData = z.infer<typeof firstStepBlockSchema>;
type Choice = FirstStepBlockData["firstChoices"][number];

function ChoiceList({
  title,
  choices,
  isLast,
  onNext,
}: {
  title: string;
  choices: Choice[];
  isLast: boolean;
  onNext: () => void;
}) {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const picked = pickedIndex === null ? null : choices[pickedIndex];

  return (
    <div className="space-y-2">
      <p className="font-medium text-neutral-900">{title}</p>
      <div className="grid gap-2">
        {choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPickedIndex(i)}
            className={`min-h-12 rounded-lg px-4 py-3 text-left text-sm font-medium ${
              pickedIndex === i
                ? choice.correct
                  ? "bg-green-100 text-green-900"
                  : "bg-red-100 text-red-900"
                : "bg-neutral-100 text-neutral-800"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {picked && (
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">{picked.feedback}</p>
          {picked.correct &&
            (isLast ? (
              <p className="text-sm font-medium text-green-700">Готово ✓</p>
            ) : (
              <button type="button" onClick={onNext} className="text-sm font-medium text-blue-600">
                Дальше →
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export function FirstStepBlock({ block }: { block: FirstStepBlockData }) {
  const [stage, setStage] = useState<"first" | "second">("first");

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 p-4">
      <p className="text-neutral-800">{block.problem}</p>
      {stage === "first" ? (
        <ChoiceList
          title="Выбери первое действие"
          choices={block.firstChoices}
          isLast={false}
          onNext={() => setStage("second")}
        />
      ) : (
        <ChoiceList title="Выбери второе действие" choices={block.secondChoices} isLast onNext={() => {}} />
      )}
    </div>
  );
}
