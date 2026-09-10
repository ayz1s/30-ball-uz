import type { z } from "zod";
import type { causeEffectBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type CauseEffectBlockData = z.infer<typeof causeEffectBlockSchema>;

export function CauseEffectBlock({ block }: { block: CauseEffectBlockData; locale: Locale }) {
  return (
    <div className="space-y-3">
      {block.pairs.map((pair, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-900 dark:text-red-200">{pair.cause}</div>
          <span className="self-center text-neutral-400 dark:text-neutral-500">→</span>
          <div className="flex-1 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-900 dark:text-green-200">{pair.effect}</div>
        </div>
      ))}
    </div>
  );
}
