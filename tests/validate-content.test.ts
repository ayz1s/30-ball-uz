import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { validateSeedDir } from "@/scripts/validate-content";

let tmpDir: string;

const validFile = {
  appKey: "test-app",
  subject: { key: "math", title: "Математика", titleUz: "Matematika", order: 0 },
  class: { title: "Класс", order: 0 },
  chapter: { title: "Глава", order: 0 },
  topic: {
    slug: "valid-topic",
    title: "Тема",
    order: 0,
    published: true,
    blocks: [{ type: "text", paragraphs: [[{ text: "Текст" }]] }],
    questions: [{ text: "Вопрос?", options: ["А", "Б"], correctIdx: 0, explanation: "Пояснение", order: 0 }],
  },
};

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-seed-"));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("validateSeedDir", () => {
  it("пропускает файл, соответствующий схеме", () => {
    fs.writeFileSync(path.join(tmpDir, "ok.json"), JSON.stringify(validFile));
    const [report] = validateSeedDir(tmpDir);
    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    fs.rmSync(path.join(tmpDir, "ok.json"));
  });

  it("отклоняет неизвестный тип блока", () => {
    const broken = { ...validFile, topic: { ...validFile.topic, blocks: [{ type: "unknownBlock" }] } };
    fs.writeFileSync(path.join(tmpDir, "bad-block.json"), JSON.stringify(broken));
    const [report] = validateSeedDir(tmpDir);
    expect(report.ok).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
    fs.rmSync(path.join(tmpDir, "bad-block.json"));
  });

  it("отклоняет correctIdx вне диапазона options", () => {
    const broken = {
      ...validFile,
      topic: {
        ...validFile.topic,
        questions: [{ text: "Вопрос?", options: ["А"], correctIdx: 5, explanation: "Пояснение", order: 0 }],
      },
    };
    fs.writeFileSync(path.join(tmpDir, "bad-idx.json"), JSON.stringify(broken));
    const [report] = validateSeedDir(tmpDir);
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.includes("correctIdx"))).toBe(true);
    fs.rmSync(path.join(tmpDir, "bad-idx.json"));
  });

  it("находит дублирующиеся slug между файлами", () => {
    fs.writeFileSync(path.join(tmpDir, "one.json"), JSON.stringify(validFile));
    fs.writeFileSync(path.join(tmpDir, "two.json"), JSON.stringify(validFile));
    const reports = validateSeedDir(tmpDir);
    const withDup = reports.find((r) => r.errors.some((e) => e.includes("Дублирующийся slug")));
    expect(withDup).toBeDefined();
    fs.rmSync(path.join(tmpDir, "one.json"));
    fs.rmSync(path.join(tmpDir, "two.json"));
  });

  it("возвращает пустой список для несуществующей папки", () => {
    expect(validateSeedDir(path.join(tmpDir, "does-not-exist"))).toEqual([]);
  });
});
