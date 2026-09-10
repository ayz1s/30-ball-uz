import type { z } from "zod";
import type { contrastBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type ContrastBlockData = z.infer<typeof contrastBlockSchema>;

export function ContrastBlock({ block }: { block: ContrastBlockData; locale: Locale }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{block.left.title}</p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{block.left.text}</p>
        </div>
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{block.right.title}</p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{block.right.text}</p>
        </div>
      </div>
      <p className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 text-sm text-amber-900 dark:text-amber-200">{block.note}</p>
    </div>
  );
}
