"use client";

import { useState } from "react";
import type { z } from "zod";
import type { decisionTreeBlockSchema } from "@/content/schema/blocks";
import { t, type Locale } from "@/lib/i18n";

type DecisionTreeBlockData = z.infer<typeof decisionTreeBlockSchema>;
type Node = DecisionTreeBlockData["root"];
type Leaf = { method: string; example: string };

function isLeaf(next: Node | Leaf): next is Leaf {
  return "method" in next;
}

export function DecisionTreeBlock({ block, locale }: { block: DecisionTreeBlockData; locale: Locale }) {
  const [stack, setStack] = useState<Node[]>([block.root]);
  const [leaf, setLeaf] = useState<Leaf | null>(null);
  const current = stack[stack.length - 1];

  function choose(next: Node | Leaf) {
    if (isLeaf(next)) {
      setLeaf(next);
    } else {
      setStack((s) => [...s, next]);
    }
  }

  function back() {
    if (leaf) {
      setLeaf(null);
      return;
    }
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      {leaf ? (
        <div className="space-y-2">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{leaf.method}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{leaf.example}</p>
        </div>
      ) : (
        <>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{current.question}</p>
          <div className="grid gap-2">
            {current.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => choose(option.next)}
                className="min-h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-4 py-3 text-left text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
      {(stack.length > 1 || leaf) && (
        <button type="button" onClick={back} className="text-sm text-blue-600 dark:text-blue-400">
          {t(locale, "blockBack")}
        </button>
      )}
    </div>
  );
}
