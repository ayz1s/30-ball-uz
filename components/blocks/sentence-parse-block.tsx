import type { z } from "zod";
import type { sentenceParseBlockSchema } from "@/content/schema/blocks";

type SentenceParseBlockData = z.infer<typeof sentenceParseBlockSchema>;

const ROLE_COLORS = [
  "bg-blue-100 text-blue-900",
  "bg-amber-100 text-amber-900",
  "bg-green-100 text-green-900",
  "bg-purple-100 text-purple-900",
  "bg-pink-100 text-pink-900",
];

export function SentenceParseBlock({ block }: { block: SentenceParseBlockData }) {
  const roles = [...new Set(block.parts.map((p) => p.role))];

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <p className="flex flex-wrap gap-1 text-lg">
        {block.parts.map((part, i) => (
          <span key={i} className={`rounded px-1 ${ROLE_COLORS[roles.indexOf(part.role) % ROLE_COLORS.length]}`}>
            {part.text}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
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
