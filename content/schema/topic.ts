import { z } from "zod";
import { blocksSchema } from "./blocks";

export const questionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctIdx: z.number().int().min(0),
  explanation: z.string().min(1),
  order: z.number().int().min(0),
});

// Файл сида описывает всю цепочку Subject -> Class -> Chapter -> Topic сразу,
// чтобы предметы не были захардкожены в коде импорта (раздел 2 ТЗ) — весь
// путь и порядок приходят только из данных.
export const seedFileSchema = z
  .object({
    appKey: z.string().min(1),
    subject: z.object({
      key: z.string().min(1),
      title: z.string().min(1),
      titleUz: z.string().min(1),
      order: z.number().int().min(0),
    }),
    class: z.object({
      title: z.string().min(1),
      order: z.number().int().min(0),
    }),
    chapter: z.object({
      title: z.string().min(1),
      order: z.number().int().min(0),
    }),
    topic: z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      order: z.number().int().min(0),
      published: z.boolean().default(false),
      blocks: blocksSchema,
      questions: z.array(questionSchema).default([]),
    }),
  })
  .superRefine((data, ctx) => {
    data.topic.questions.forEach((question, index) => {
      if (question.correctIdx >= question.options.length) {
        ctx.addIssue({
          code: "custom",
          path: ["topic", "questions", index, "correctIdx"],
          message: `correctIdx (${question.correctIdx}) вне диапазона options (0..${question.options.length - 1})`,
        });
      }
    });
  });

export type SeedFile = z.infer<typeof seedFileSchema>;
export type Question = z.infer<typeof questionSchema>;
