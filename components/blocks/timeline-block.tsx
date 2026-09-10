"use client";

import { useState } from "react";
import type { z } from "zod";
import type { timelineBlockSchema } from "@/content/schema/blocks";

type TimelineBlockData = z.infer<typeof timelineBlockSchema>;

export function TimelineBlock({ block }: { block: TimelineBlockData }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ol className="space-y-3 border-l-2 border-neutral-200 pl-4">
      {block.events.map((event, i) => (
        <li key={i} className="relative">
          <button
            type="button"
            onClick={() => setOpenIndex((idx) => (idx === i ? null : i))}
            className="flex min-h-11 w-full flex-wrap items-baseline gap-2 text-left"
          >
            <span className="absolute -left-[21px] mt-1.5 h-3 w-3 rounded-full bg-blue-600" />
            <span className="text-sm font-semibold text-blue-700">{event.year}</span>
            <span className="text-neutral-900">{event.title}</span>
          </button>
          {openIndex === i && <p className="mt-1 text-sm text-neutral-600">{event.description}</p>}
        </li>
      ))}
    </ol>
  );
}
