import { z } from "zod";

// --- Общие блоки ---

const textSegmentSchema = z.object({
  text: z.string().min(1),
  highlight: z.boolean().optional(),
});

export const textBlockSchema = z.object({
  type: z.literal("text"),
  paragraphs: z.array(z.array(textSegmentSchema).min(1)).min(1),
});

export const ruleBlockSchema = z.object({
  type: z.literal("rule"),
  rule: z.string().min(1),
  examples: z.array(z.string().min(1)).min(1),
});

export const flashcardsBlockSchema = z.object({
  type: z.literal("flashcards"),
  cards: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .min(1),
});

export const imageBlockSchema = z.object({
  type: z.literal("image"),
  url: z.string().min(1),
  caption: z.string().min(1),
});

// --- Математика ---

export const linkedFormulaBlockSchema = z.object({
  type: z.literal("linkedFormula"),
  problem: z.string().min(1),
  formula: z.string().min(1),
  links: z
    .array(
      z.object({
        id: z.string().min(1),
        problemLabel: z.string().min(1),
        formulaLabel: z.string().min(1),
      }),
    )
    .min(1),
});

export const stepsBlockSchema = z.object({
  type: z.literal("steps"),
  steps: z
    .array(z.object({ text: z.string().min(1), explanation: z.string().min(1) }))
    .min(1),
});

interface DecisionLeaf {
  method: string;
  example: string;
}

interface DecisionNode {
  question: string;
  options: Array<{
    label: string;
    next: DecisionNode | DecisionLeaf;
  }>;
}

const decisionLeafSchema: z.ZodType<DecisionLeaf> = z.object({
  method: z.string().min(1),
  example: z.string().min(1),
});

const decisionNodeSchema: z.ZodType<DecisionNode> = z.lazy(() =>
  z.object({
    question: z.string().min(1),
    options: z
      .array(
        z.object({
          label: z.string().min(1),
          next: z.union([decisionNodeSchema, decisionLeafSchema]),
        }),
      )
      .min(1),
  }),
);

export const decisionTreeBlockSchema = z.object({
  type: z.literal("decisionTree"),
  root: decisionNodeSchema,
});

export const firstStepBlockSchema = z.object({
  type: z.literal("firstStep"),
  problem: z.string().min(1),
  firstChoices: z
    .array(z.object({ label: z.string().min(1), correct: z.boolean(), feedback: z.string().min(1) }))
    .min(2),
  secondChoices: z
    .array(z.object({ label: z.string().min(1), correct: z.boolean(), feedback: z.string().min(1) }))
    .min(2),
});

// --- История ---

export const timelineBlockSchema = z.object({
  type: z.literal("timeline"),
  events: z
    .array(
      z.object({
        year: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(1),
});

export const entityCardBlockSchema = z.object({
  type: z.literal("entityCard"),
  name: z.string().min(1),
  years: z.string().optional(),
  founder: z.string().optional(),
  capital: z.string().optional(),
  succeededBy: z.string().optional(),
  knownFor: z.string().optional(),
  names: z.array(z.string().min(1)).optional(),
});

export const letterChainBlockSchema = z.object({
  type: z.literal("letterChain"),
  title: z.string().min(1),
  letters: z
    .array(z.object({ letter: z.string().min(1), meaning: z.string().min(1) }))
    .min(1),
});

export const timeChartBlockSchema = z.object({
  type: z.literal("timeChart"),
  startYear: z.number().int(),
  endYear: z.number().int(),
  lanes: z
    .array(
      z.object({
        label: z.string().min(1),
        items: z
          .array(
            z.object({
              startYear: z.number().int(),
              endYear: z.number().int(),
              title: z.string().min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export const causeEffectBlockSchema = z.object({
  type: z.literal("causeEffect"),
  pairs: z
    .array(z.object({ cause: z.string().min(1), effect: z.string().min(1) }))
    .min(1),
});

// --- Язык и литература ---

export const morphemesBlockSchema = z.object({
  type: z.literal("morphemes"),
  word: z.string().min(1),
  parts: z
    .array(
      z.object({
        text: z.string().min(1),
        kind: z.string().min(1),
        explanation: z.string().min(1),
      }),
    )
    .min(1),
});

export const contrastBlockSchema = z.object({
  type: z.literal("contrast"),
  left: z.object({ title: z.string().min(1), text: z.string().min(1) }),
  right: z.object({ title: z.string().min(1), text: z.string().min(1) }),
  note: z.string().min(1),
});

export const sentenceParseBlockSchema = z.object({
  type: z.literal("sentenceParse"),
  sentence: z.string().min(1),
  parts: z
    .array(z.object({ text: z.string().min(1), role: z.string().min(1) }))
    .min(1),
});

export const builderBlockSchema = z.object({
  type: z.literal("builder"),
  word: z.string().min(1),
  correctParts: z.array(z.string().min(1)).min(2),
  distractorParts: z
    .array(z.object({ part: z.string().min(1), whyWrong: z.string().min(1) }))
    .default([]),
});

export const workCardBlockSchema = z.object({
  type: z.literal("workCard"),
  title: z.string().min(1),
  author: z.string().min(1),
  century: z.string().min(1),
  genre: z.string().min(1),
  heroes: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
});

export const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  ruleBlockSchema,
  flashcardsBlockSchema,
  imageBlockSchema,
  linkedFormulaBlockSchema,
  stepsBlockSchema,
  decisionTreeBlockSchema,
  firstStepBlockSchema,
  timelineBlockSchema,
  entityCardBlockSchema,
  letterChainBlockSchema,
  timeChartBlockSchema,
  causeEffectBlockSchema,
  morphemesBlockSchema,
  contrastBlockSchema,
  sentenceParseBlockSchema,
  builderBlockSchema,
  workCardBlockSchema,
]);

export const blocksSchema = z.array(blockSchema).min(1);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];

// Вкладка темы, в которую попадает блок этого типа (раздел 7 ТЗ: Теория/Схема/Карточки).
// Вопросы — это отдельная модель Question, не блок.
export const BLOCK_TAB: Record<BlockType, "theory" | "scheme" | "cards"> = {
  text: "theory",
  rule: "theory",
  flashcards: "cards",
  image: "scheme",
  linkedFormula: "scheme",
  steps: "scheme",
  decisionTree: "scheme",
  firstStep: "scheme",
  timeline: "scheme",
  entityCard: "scheme",
  letterChain: "scheme",
  timeChart: "scheme",
  causeEffect: "scheme",
  morphemes: "scheme",
  contrast: "scheme",
  sentenceParse: "scheme",
  builder: "scheme",
  workCard: "scheme",
};
