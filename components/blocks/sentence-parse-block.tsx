import type { z } from "zod";
import type { sentenceParseBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type SentenceParseBlockData = z.infer<typeof sentenceParseBlockSchema>;

const ROLE_COLORS = [
  "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200",
  "bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200",
  "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200",
  "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-200",
  "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-200",
];

export function SentenceParseBlock({ block }: { block: SentenceParseBlockData; locale: Locale }) {
  const roles = [...new Set(block.parts.map((p) => p.role))];

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <p className="flex flex-wrap gap-1 text-lg">
        {block.parts.map((part, i) => (
          <span key={i} className={`rounded px-1 ${ROLE_COLORS[roles.indexOf(part.role) % ROLE_COLORS.length]}`}>
            {part.text}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        {roles.map((role, i) => (
          <span key={role} className="flex items-center gap-1">
            <span className={`h-3 w-3 rounded ${ROLE_COLORS[i % ROLE_COLORS.length]}`} />
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}
