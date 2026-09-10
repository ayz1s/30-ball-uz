import type { z } from "zod";
import type { causeEffectBlockSchema } from "@/content/schema/blocks";

type CauseEffectBlockData = z.infer<typeof causeEffectBlockSchema>;

export function CauseEffectBlock({ block }: { block: CauseEffectBlockData }) {
  return (
    <div className="space-y-3">
      {block.pairs.map((pair, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-3 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-lg bg-red-50 p-3 text-sm text-red-900">{pair.cause}</div>
          <span className="self-center text-neutral-400">→</span>
          <div className="flex-1 rounded-lg bg-green-50 p-3 text-sm text-green-900">{pair.effect}</div>
        </div>
      ))}
    </div>
  );
}
