"use client";

import { useMemo, useState } from "react";
import type { z } from "zod";
import type { builderBlockSchema } from "@/content/schema/blocks";

type BuilderBlockData = z.infer<typeof builderBlockSchema>;
type Piece = { part: string; correct: boolean; whyWrong: string };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function BuilderBlock({ block }: { block: BuilderBlockData }) {
  const pool = useMemo<Piece[]>(
    () =>
      shuffle([
        ...block.correctParts.map((part) => ({ part, correct: true, whyWrong: "" })),
        ...block.distractorParts.map((d) => ({ part: d.part, correct: false, whyWrong: d.whyWrong })),
      ]),
    [block],
  );
  const [pickedCount, setPickedCount] = useState(0);
  const [pickedParts, setPickedParts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const done = pickedCount === block.correctParts.length;

  function pick(piece: Piece) {
    if (done) return;
    const expected = block.correctParts[pickedCount];
    if (piece.part !== expected || !piece.correct) {
      setError(piece.whyWrong || `«${piece.part}» здесь не подходит.`);
      return;
    }
    setError(null);
    setPickedParts((p) => [...p, piece.part]);
    setPickedCount((c) => c + 1);
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <p className="text-center text-2xl font-semibold text-neutral-900">{pickedParts.join("") || "…"}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((piece, i) => (
          <button
            key={i}
            type="button"
            disabled={done}
            onClick={() => pick(piece)}
            className="min-h-12 rounded-lg bg-neutral-100 px-4 py-3 text-lg font-medium text-neutral-800 disabled:opacity-40"
          >
            {piece.part}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {done && <p className="text-sm font-medium text-green-700">Готово: {block.word}</p>}
    </div>
  );
}
