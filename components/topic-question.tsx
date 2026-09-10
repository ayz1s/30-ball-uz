"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

export interface TopicQuestionData {
  id: string;
  text: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export function TopicQuestion({ question, locale }: { question: TopicQuestionData; locale: Locale }) {
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <p className="font-medium text-neutral-900">{question.text}</p>
      <div className="grid gap-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPickedIdx(i)}
            className={`min-h-12 rounded-lg px-4 py-3 text-left text-sm font-medium ${
              pickedIdx === i
                ? i === question.correctIdx
                  ? "bg-green-100 text-green-900"
                  : "bg-red-100 text-red-900"
                : "bg-neutral-100 text-neutral-800"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {pickedIdx !== null && (
        <p className="text-sm text-neutral-600">
          <span className="font-medium">{t(locale, "questionExplanation")}:</span> {question.explanation}
        </p>
      )}
    </div>
  );
}
