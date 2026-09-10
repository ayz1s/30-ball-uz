import type { z } from "zod";
import type { entityCardBlockSchema } from "@/content/schema/blocks";
import { t, type Locale } from "@/lib/i18n";

type EntityCardBlockData = z.infer<typeof entityCardBlockSchema>;

const SLOT_KEYS: Array<{
  key: "years" | "founder" | "capital" | "succeededBy" | "knownFor";
  labelKey: "blockEntityYears" | "blockEntityFounder" | "blockEntityCapital" | "blockEntitySucceededBy" | "blockEntityKnownFor";
}> = [
  { key: "years", labelKey: "blockEntityYears" },
  { key: "founder", labelKey: "blockEntityFounder" },
  { key: "capital", labelKey: "blockEntityCapital" },
  { key: "succeededBy", labelKey: "blockEntitySucceededBy" },
  { key: "knownFor", labelKey: "blockEntityKnownFor" },
];

export function EntityCardBlock({ block, locale }: { block: EntityCardBlockData; locale: Locale }) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{block.name}</p>
      <dl className="space-y-2 text-sm">
        {SLOT_KEYS.filter((slot) => block[slot.key]).map((slot) => (
          <div
            key={slot.key}
            className="flex justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-1"
          >
            <dt className="text-neutral-500 dark:text-neutral-400">{t(locale, slot.labelKey)}</dt>
            <dd className="text-right text-neutral-900 dark:text-neutral-100">{block[slot.key]}</dd>
          </div>
        ))}
      </dl>
      {block.names && block.names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {block.names.map((name, i) => (
            <span
              key={i}
              className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
