import type { z } from "zod";
import type { workCardBlockSchema } from "@/content/schema/blocks";

type WorkCardBlockData = z.infer<typeof workCardBlockSchema>;

export function WorkCardBlock({ block }: { block: WorkCardBlockData }) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <p className="text-lg font-semibold text-neutral-900">{block.title}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-neutral-500">Автор</dt>
          <dd className="text-neutral-900">{block.author}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Век</dt>
          <dd className="text-neutral-900">{block.century}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Жанр</dt>
          <dd className="text-neutral-900">{block.genre}</dd>
        </div>
      </dl>
      <div>
        <p className="text-xs font-medium text-neutral-500">Герои</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {block.heroes.map((hero, i) => (
            <span key={i} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              {hero}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-neutral-700">{block.summary}</p>
    </div>
  );
}
