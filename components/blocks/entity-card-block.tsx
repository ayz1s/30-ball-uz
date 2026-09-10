import type { z } from "zod";
import type { entityCardBlockSchema } from "@/content/schema/blocks";

type EntityCardBlockData = z.infer<typeof entityCardBlockSchema>;

const SLOTS: Array<{ key: "years" | "founder" | "capital" | "succeededBy" | "knownFor"; label: string }> = [
  { key: "years", label: "Годы" },
  { key: "founder", label: "Основатель" },
  { key: "capital", label: "Столица" },
  { key: "succeededBy", label: "Кто сменил" },
  { key: "knownFor", label: "Чем известно" },
];

export function EntityCardBlock({ block }: { block: EntityCardBlockData }) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <p className="text-lg font-semibold text-neutral-900">{block.name}</p>
      <dl className="space-y-2 text-sm">
        {SLOTS.filter((slot) => block[slot.key]).map((slot) => (
          <div key={slot.key} className="flex justify-between gap-3 border-b border-neutral-100 pb-1">
            <dt className="text-neutral-500">{slot.label}</dt>
            <dd className="text-right text-neutral-900">{block[slot.key]}</dd>
          </div>
        ))}
      </dl>
      {block.names && block.names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {block.names.map((name, i) => (
            <span key={i} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
