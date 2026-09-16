// Черновик темы через дешёвую модель на OpenRouter (см. content/lesson-generation-prompt.md).
// Модель отдаёт только { blocks, questions } — метаданные (subject/class/chapter/slug/order)
// берём из аргументов командной строки и куррикулума, а не даём модели их придумывать.
// Результат пишется в файл черновика, а НЕ в content/seed/ — его нужно вручную
// проверить (математику, язык) и только потом переложить в content/seed для импорта.
//
//   npx tsx scripts/generate-lesson-draft.ts \
//     --slug math-5-03-scale-numberline \
//     --grade "5 класс" \
//     --chapter "Глава I. Сложение и вычитание натуральных чисел" \
//     --chapterOrder 0 \
//     --title "Шкалы и числовая ось" \
//     --topicOrder 2 \
//     --out content/seed-drafts/math-5-03-scale-numberline.json

import "dotenv/config";
import fs from "fs";
import path from "path";

function arg(name: string, required = true): string {
  const idx = process.argv.indexOf(`--${name}`);
  const value = idx >= 0 ? process.argv[idx + 1] : undefined;
  if (required && !value) {
    console.error(`Не хватает аргумента --${name}`);
    process.exit(1);
  }
  return value ?? "";
}

const slug = arg("slug");
const grade = arg("grade");
const chapterTitle = arg("chapter");
const chapterOrder = Number(arg("chapterOrder"));
const topicTitle = arg("title");
const topicOrder = Number(arg("topicOrder"));
const outPath = arg("out");

const PROMPT = `Ты — автор учебного контента для Telegram-приложения по подготовке к вступительному экзамену в Узбекистане («30 ball.uz»). Аудитория — школьники 15–18 лет, которые претендуют на сильный результат, поэтому им не интересны голые определения — им нужна конкретная техника решения задач.

Тема: **${topicTitle}**
Класс: **${grade}**, глава: **${chapterTitle}**

### Жёсткие правила содержания

1. Никогда не копируй текст из учебников дословно — пиши с нуля, опираясь на саму математику.
2. В основе темы — один или два полностью разобранных числовых примера с конкретными числами, а не абстрактные формулировки. Каждый шаг решения объясняется словами «почему так», а не просто «делаем так».
3. Обязательно покажи технику, которая реально встречается в тестовых заданиях этого уровня (перебор случаев, формула, алгоритм действий) — не только определение термина.
4. Никаких терминов без объяснения тут же на месте. Не используй термин, пока не объяснил его на конкретном примере с числами. Если термин можно заменить простыми словами — замени.
5. Никогда не выдумывай факты, даты, формулы — если не уверен в формуле, не включай её.
6. Пиши по-русски, коротко и по делу, без канцелярита и воды.
7. Если тема связана с чем-то визуальным или пространственным (шкала, ось, фигура, расположение объектов) — обязательно покажи текстовую схему прямо в тексте, например: \`0 — 5 — 10 — 15 — 20\` для шкалы с шагом 5. Не объясняй пространственные вещи только словами без наглядного примера.
8. Примеры и задачи располагай от простого к сложному: первый разбор (steps) — самая прямая, лёгкая формулировка (дано известное — найди то, что сразу считается по этому известному). Только следующий пример может быть сложнее или «обратным» (дано следствие — найди исходное). Никогда не начинай тему со сложного или обратного примера.

### Формат ответа

Ответь ТОЛЬКО валидным JSON, без markdown-обёртки (без \`\`\`), без комментариев до или после. Структура ровно такая:

{
  "blocks": [ /* массив блоков, см. допустимые типы ниже */ ],
  "questions": [ /* массив вопросов, см. формат ниже */ ]
}

### Допустимые типы блоков (используй 5–7 блоков, разных типов, в разумном порядке: сначала text, потом разбор примера, потом правило, потом опционально decisionTree, в конце flashcards)

text: { "type": "text", "paragraphs": [ [ { "text": "..." }, { "text": "важное", "highlight": true }, { "text": "..." } ] ] }

rule: { "type": "rule", "rule": "формулировка", "examples": ["пример 1", "пример 2", "пример 3"] }

steps: { "type": "steps", "condition": "условие конкретной задачи с числами", "steps": [ { "text": "что делаем", "explanation": "почему, с конкретными числами" } ] }

decisionTree: { "type": "decisionTree", "root": { "question": "что нужно найти в задаче?", "options": [ { "label": "сценарий", "next": { "method": "как решать", "example": "пример с числами" } } ] } }

flashcards: { "type": "flashcards", "cards": [ { "question": "...", "answer": "..." } ] } — 4-6 карточек

linkedFormula (опционально): { "type": "linkedFormula", "problem": "...", "formula": "...", "links": [ { "id": "a", "problemLabel": "...", "formulaLabel": "..." } ] }

firstStep (опционально): { "type": "firstStep", "problem": "...", "firstChoices": [ { "label": "...", "correct": true, "feedback": "..." } ], "secondChoices": [ { "label": "...", "correct": true, "feedback": "..." } ] }

### Формат вопросов (5-6 штук, order по порядку с 0)

{ "text": "...", "options": ["...", "...", "...", "..."], "correctIdx": 0, "explanation": "почему именно этот ответ верный", "order": 0 }

correctIdx — индекс с нуля правильного варианта. 3-4 варианта на вопрос, правдоподобные. Вопросы должны проверять технику из steps/decisionTree, а не только определение.

Ответь только JSON, начиная с { и заканчивая }.`;

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY не задан в .env");
    process.exit(1);
  }

  console.log(`Запрашиваю черновик темы "${topicTitle}" у moonshotai/kimi-k2.6...`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "moonshotai/kimi-k2.6",
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    console.error(`OpenRouter вернул ошибку ${response.status}: ${await response.text()}`);
    process.exit(1);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const raw = data.choices[0].message.content.trim();

  const cleaned = raw
    .replace(/^```(json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  let draft: { blocks: unknown[]; questions: unknown[] };
  try {
    draft = JSON.parse(cleaned);
  } catch (error) {
    console.error("Модель вернула невалидный JSON:", (error as Error).message);
    console.error("--- Сырой ответ ---");
    console.error(raw);
    process.exit(1);
  }

  const seedFile = {
    appKey: "ball30uz",
    subject: { key: "math", title: "Математика", titleUz: "Matematika", order: 0 },
    class: { title: grade, order: 0 },
    chapter: { title: chapterTitle, order: chapterOrder },
    topic: {
      slug,
      title: topicTitle,
      order: topicOrder,
      published: false,
      blocks: draft.blocks,
      questions: draft.questions,
    },
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(seedFile, null, 2) + "\n", "utf-8");
  console.log(`Черновик сохранён: ${outPath}`);
  console.log(`Блоков: ${draft.blocks.length}, вопросов: ${draft.questions.length}`);
  console.log("published: false — пока НЕ пойдёт в content/seed и НЕ импортируется автоматически.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
