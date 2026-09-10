// Проверяет все JSON-файлы в content/seed/ по схеме без обращения к базе.
//   npx tsx scripts/validate-content.ts
import fs from "fs";
import path from "path";
import { seedFileSchema } from "@/content/schema/topic";

const SEED_DIR = path.join(process.cwd(), "content", "seed");

interface FileReport {
  file: string;
  ok: boolean;
  errors: string[];
}

export function validateSeedDir(dir: string): FileReport[] {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((name) => name.endsWith(".json"));
  const seenSlugs = new Map<string, string>();

  return files.map((file) => {
    const fullPath = path.join(dir, file);
    const errors: string[] = [];

    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch (error) {
      return { file, ok: false, errors: [`Невалидный JSON: ${(error as Error).message}`] };
    }

    const result = seedFileSchema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${issue.path.join(".")}: ${issue.message}`);
      }
      return { file, ok: false, errors };
    }

    const slug = result.data.topic.slug;
    const existing = seenSlugs.get(slug);
    if (existing) {
      errors.push(`Дублирующийся slug "${slug}" — уже используется в ${existing}`);
    } else {
      seenSlugs.set(slug, file);
    }

    return { file, ok: errors.length === 0, errors };
  });
}

function main() {
  const reports = validateSeedDir(SEED_DIR);

  if (reports.length === 0) {
    console.log(`В ${SEED_DIR} нет JSON-файлов.`);
    return;
  }

  let hasErrors = false;
  for (const report of reports) {
    if (report.ok) {
      console.log(`OK    ${report.file}`);
      continue;
    }
    hasErrors = true;
    console.log(`ОШИБКА ${report.file}`);
    for (const error of report.errors) {
      console.log(`  - ${error}`);
    }
  }

  console.log(`\nВсего файлов: ${reports.length}, прошли проверку: ${reports.filter((r) => r.ok).length}`);
  if (hasErrors) process.exit(1);
}

if (require.main === module) {
  main();
}
