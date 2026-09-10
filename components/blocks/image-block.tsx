import type { z } from "zod";
import type { imageBlockSchema } from "@/content/schema/blocks";

type ImageBlockData = z.infer<typeof imageBlockSchema>;

export function ImageBlock({ block }: { block: ImageBlockData }) {
  return (
    <figure className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.url} alt={block.caption} className="w-full rounded-xl border border-neutral-200" />
      <figcaption className="text-sm text-neutral-500">{block.caption}</figcaption>
    </figure>
  );
}
