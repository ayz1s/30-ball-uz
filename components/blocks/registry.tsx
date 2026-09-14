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
import { t, type DictKey, type Locale } from "@/lib/i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<BlockType, ComponentType<{ block: any; locale: Locale }>> = {
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

// Подпись над блоком, чтобы соседние блоки разных типов на одной вкладке
// (например steps + decisionTree на "Схеме") не сливались в один список.
// text/flashcards/image не нуждаются в подписи — они и так самодостаточны
// (сплошной текст, своя карточка с прогрессом, подпись под картинкой).
const BLOCK_KICKER: Partial<Record<BlockType, DictKey>> = {
  rule: "blockKickerRule",
  linkedFormula: "blockKickerLinkedFormula",
  steps: "blockKickerSteps",
  decisionTree: "blockKickerDecisionTree",
  firstStep: "blockKickerFirstStep",
  timeline: "blockKickerTimeline",
  entityCard: "blockKickerEntityCard",
  letterChain: "blockKickerLetterChain",
  timeChart: "blockKickerTimeChart",
  causeEffect: "blockKickerCauseEffect",
  morphemes: "blockKickerMorphemes",
  contrast: "blockKickerContrast",
  sentenceParse: "blockKickerSentenceParse",
  builder: "blockKickerBuilder",
  workCard: "blockKickerWorkCard",
};

// Блоки хранятся в базе как обычный Json, поэтому диспетчеризация идёт по
// строке type в рантайме, а не через строгую zod-схему (та валидирует
// только на импорте контента) — неизвестный тип не должен ронять страницу.
//
// Каждый блок — отдельная белая карточка с рамкой (как у TopicQuestion),
// а не просто подпись сверху: подписи было недостаточно, соседние блоки
// на "Схеме" всё равно визуально сливались друг с другом.
export function BlockRenderer({ block, locale }: { block: RawBlock; locale: Locale }) {
  const Component = registry[block.type as BlockType];
  if (!Component) {
    console.warn(`Неизвестный тип блока в контенте: "${block.type}"`);
    return <UnknownBlock type={block.type} locale={locale} />;
  }
  const kickerKey = BLOCK_KICKER[block.type as BlockType];
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      {kickerKey && (
        <div className="mb-3 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-blue-600" />
          <p className="text-sm font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
            {t(locale, kickerKey)}
          </p>
        </div>
      )}
      <Component block={block} locale={locale} />
    </div>
  );
}
