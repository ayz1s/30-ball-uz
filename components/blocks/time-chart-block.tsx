"use client";

import { useState } from "react";
import type { z } from "zod";
import type { timeChartBlockSchema } from "@/content/schema/blocks";

type TimeChartBlockData = z.infer<typeof timeChartBlockSchema>;

export function TimeChartBlock({ block }: { block: TimeChartBlockData }) {
  const [year, setYear] = useState(block.startYear);
  const span = block.endYear - block.startYear || 1;

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 p-4">
      <div className="space-y-2">
        {block.lanes.map((lane, li) => (
          <div key={li} className="space-y-1">
            <p className="text-xs font-medium text-neutral-500">{lane.label}</p>
            <div className="relative h-8 rounded-full bg-neutral-100">
              {lane.items.map((item, ii) => {
                const left = ((item.startYear - block.startYear) / span) * 100;
                const width = Math.max(((item.endYear - item.startYear) / span) * 100, 6);
                const active = year >= item.startYear && year <= item.endYear;
                return (
                  <div
                    key={ii}
                    title={item.title}
                    className={`absolute top-1 h-6 overflow-hidden rounded-full px-2 text-[10px] leading-6 text-white ${
                      active ? "bg-blue-600" : "bg-neutral-300"
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    <span className="truncate">{item.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <input
        type="range"
        min={block.startYear}
        max={block.endYear}
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-full"
      />
      <p className="text-center text-sm font-medium text-neutral-700">Год: {year}</p>
    </div>
  );
}
