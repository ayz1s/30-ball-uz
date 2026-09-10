import type { z } from "zod";
import type { ruleBlockSchema } from "@/content/schema/blocks";

type RuleBlockData = z.infer<typeof ruleBlockSchema>;

export function RuleBlock({ block }: { block: RuleBlockData }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <p className="font-medium text-blue-900">{block.rule}</p>
      <ul className="mt-3 space-y-1 text-sm text-blue-800">
        {block.examples.map((example, i) => (
          <li key={i}>• {example}</li>
        ))}
      </ul>
    </div>
  );
}
