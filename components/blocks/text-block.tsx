import type { z } from "zod";
import type { textBlockSchema } from "@/content/schema/blocks";

type TextBlockData = z.infer<typeof textBlockSchema>;

export function TextBlock({ block }: { block: TextBlockData }) {
  return (
    <div className="space-y-3 text-base leading-relaxed text-neutral-800">
      {block.paragraphs.map((paragraph, i) => (
        <p key={i}>
          {paragraph.map((segment, j) =>
            segment.highlight ? (
              <mark key={j} className="rounded bg-amber-100 px-1 text-neutral-900">
                {segment.text}
              </mark>
            ) : (
              <span key={j}>{segment.text}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
