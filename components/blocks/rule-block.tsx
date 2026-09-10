import type { z } from "zod";
import type { ruleBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type RuleBlockData = z.infer<typeof ruleBlockSchema>;

export function RuleBlock({ block }: { block: RuleBlockData; locale: Locale }) {
  return (
    <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-4">
      <p className="font-medium text-blue-900 dark:text-blue-200">{block.rule}</p>
      <ul className="mt-3 space-y-1 text-sm text-blue-800 dark:text-blue-300">
        {block.examples.map((example, i) => (
          <li key={i}>• {example}</li>
        ))}
      </ul>
    </div>
  );
}
