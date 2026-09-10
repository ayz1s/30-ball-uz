import type { ComponentType } from "react";
import { TextBlock } from "./text-block";
import { RuleBlock } from "./rule-block";
import { FlashcardsBlock } from "./flashcards-block";
import { ImageBlock } from "./image-block";
import { LinkedFormulaBlock } from "./linked-formula-block";
import { StepsBlock } from "./steps-block";
import { DecisionTreeBlock } from "./decision-tree-block";
import { FirstStepBlock } from "./first-step-block";
import { TimelineBlock } from "./timeline-block";
import { EntityCardBlock } from "./entity-card-block";
import { LetterChainBlock } from "./letter-chain-block";
import { TimeChartBlock } from "./time-chart-block";
import { CauseEffectBlock } from "./cause-effect-block";
import { MorphemesBlock } from "./morphemes-block";
import { ContrastBlock } from "./contrast-block";
import { SentenceParseBlock } from "./sentence-parse-block";
import { BuilderBlock } from "./builder-block";
import { WorkCardBlock } from "./work-card-block";
import { UnknownBlock } from "./unknown-block";
import type { BlockType } from "@/content/schema/blocks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<BlockType, ComponentType<{ block: any }>> = {
  text: TextBlock,
  rule: RuleBlock,
  flashcards: FlashcardsBlock,
  image: ImageBlock,
  linkedFormula: LinkedFormulaBlock,
  steps: StepsBlock,
  decisionTree: DecisionTreeBlock,
  firstStep: FirstStepBlock,
  timeline: TimelineBlock,
  entityCard: EntityCardBlock,
  letterChain: LetterChainBlock,
  timeChart: TimeChartBlock,
  causeEffect: CauseEffectBlock,
  morphemes: MorphemesBlock,
  contrast: ContrastBlock,
  sentenceParse: SentenceParseBlock,
  builder: BuilderBlock,
  workCard: WorkCardBlock,
};

export interface RawBlock {
  type: string;
  [key: string]: unknown;
}

// Блоки хранятся в базе как обычный Json, поэтому диспетчеризация идёт по
// строке type в рантайме, а не через строгую zod-схему (та валидирует
// только на импорте контента) — неизвестный тип не должен ронять страницу.
export function BlockRenderer({ block }: { block: RawBlock }) {
  const Component = registry[block.type as BlockType];
  if (!Component) {
    console.warn(`Неизвестный тип блока в контенте: "${block.type}"`);
    return <UnknownBlock type={block.type} />;
  }
  return <Component block={block} />;
}
