import type { z } from "zod";
import type { workCardBlockSchema } from "@/content/schema/blocks";
import { t, type Locale } from "@/lib/i18n";

type WorkCardBlockData = z.infer<typeof workCardBlockSchema>;

export function WorkCardBlock({ block, locale }: { block: WorkCardBlockData; locale: Locale }) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{block.title}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-neutral-500 dark:text-neutral-400">{t(locale, "blockWorkCardAuthor")}</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">{block.author}</dd>
        </div>
        <div>
          <dt className="text-neutral-500 dark:text-neutral-400">{t(locale, "blockWorkCardCentury")}</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">{block.century}</dd>
        </div>
        <div>
          <dt className="text-neutral-500 dark:text-neutral-400">{t(locale, "blockWorkCardGenre")}</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">{block.genre}</dd>
        </div>
      </dl>
      <div>
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t(locale, "blockWorkCardHeroes")}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {block.heroes.map((hero, i) => (
            <span
              key={i}
              className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300"
            >
              {hero}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">{block.summary}</p>
    </div>
  );
}
