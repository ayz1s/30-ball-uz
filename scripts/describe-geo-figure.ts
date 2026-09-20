// Численная самопроверка geoFigure-блоков без рендера картинки: печатает
// длины отрезков и градусные меры всех заданных углов, чтобы проверить,
// что чертёж на самом деле соответствует условию задачи (например "угол
// должен быть 40°" или "эти два отрезка равны") — числами, а не на глаз.
//
//   npx tsx scripts/describe-geo-figure.ts content/seed-drafts/geo7-06-triangle-types.json
import fs from "fs";

// Точки со стереометрических чертежей (grade 10+) несут необязательное z —
// все вычисления ниже РЕАЛЬНЫЕ 3D-величины (z по умолчанию 0 для плоских
// чертежей), а не по экранным/проецированным координатам: реальная длина
// ребра куба в задаче — это 3D-расстояние, а не то, что видно на кабинетной
// проекции на экране.
type Pt = { x: number; y: number; z?: number };

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function angleDeg(vertex: Pt, from: Pt, to: Pt): number {
  const v1x = from.x - vertex.x;
  const v1y = from.y - vertex.y;
  const v1z = (from.z ?? 0) - (vertex.z ?? 0);
  const v2x = to.x - vertex.x;
  const v2y = to.y - vertex.y;
  const v2z = (to.z ?? 0) - (vertex.z ?? 0);
  const dot = v1x * v2x + v1y * v2y + v1z * v2z;
  const mag = Math.hypot(v1x, v1y, v1z) * Math.hypot(v2x, v2y, v2z);
  return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}

function isParallel(a1: Pt, a2: Pt, b1: Pt, b2: Pt): boolean {
  const ux = a2.x - a1.x;
  const uy = a2.y - a1.y;
  const uz = (a2.z ?? 0) - (a1.z ?? 0);
  const vx = b2.x - b1.x;
  const vy = b2.y - b1.y;
  const vz = (b2.z ?? 0) - (b1.z ?? 0);
  // Параллельны, если векторное произведение — нулевой вектор.
  const cx = uy * vz - uz * vy;
  const cy = uz * vx - ux * vz;
  const cz = ux * vy - uy * vx;
  return Math.hypot(cx, cy, cz) < 1e-6;
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/describe-geo-figure.ts <file.json> [blockIndex]");
  process.exit(1);
}
const onlyIndex = process.argv[3] !== undefined ? Number(process.argv[3]) : undefined;

const data = JSON.parse(fs.readFileSync(file, "utf-8"));
const blocks = data.topic.blocks as Array<Record<string, unknown>>;

blocks.forEach((block, i) => {
  if (block.type !== "geoFigure") return;
  if (onlyIndex !== undefined && i !== onlyIndex) return;

  console.log(`\n=== Block #${i}: ${(block.caption as string) ?? "(no caption)"} ===`);
  const points = block.points as Array<{ id: string; x: number; y: number; z?: number; label?: string }>;
  const pointMap = new Map(points.map((p) => [p.id, p]));
  const is3d = points.some((p) => p.z !== undefined);

  console.log(
    "Points:",
    points
      .map((p) => (is3d ? `${p.id}(${p.label ?? "?"})=(${p.x},${p.y},${p.z ?? 0})` : `${p.id}(${p.label ?? "?"})=(${p.x},${p.y})`))
      .join(", "),
  );

  const segments = (block.segments as Array<{ from: string; to: string; ticks?: number; style?: string }>) ?? [];
  console.log("Segment lengths:");
  for (const s of segments) {
    const from = pointMap.get(s.from);
    const to = pointMap.get(s.to);
    if (!from || !to) {
      console.log(`  ${s.from}-${s.to}: MISSING POINT`);
      continue;
    }
    console.log(`  ${s.from}-${s.to}: ${dist(from, to).toFixed(2)}${s.ticks ? ` (ticks=${s.ticks})` : ""}${s.style === "dashed" ? " [dashed]" : ""}`);
  }

  const angles = (block.angles as Array<{ vertex: string; from: string; to: string; label?: string; right?: boolean }>) ?? [];
  if (angles.length) {
    console.log("Angles:");
    for (const a of angles) {
      const vertex = pointMap.get(a.vertex);
      const from = pointMap.get(a.from);
      const to = pointMap.get(a.to);
      if (!vertex || !from || !to) {
        console.log(`  ${a.vertex}(${a.from},${a.to}): MISSING POINT`);
        continue;
      }
      const deg = angleDeg(vertex, from, to);
      const flag = a.right && Math.abs(deg - 90) > 0.5 ? "  <-- NOT 90°, but right:true!" : "";
      console.log(`  ∠${a.from}${a.vertex}${a.to} (label="${a.label ?? ""}"): ${deg.toFixed(2)}°${flag}`);
    }
  }

  // Проверка треугольника: если ровно 3 точки и 3 отрезка образуют замкнутый треугольник, печатаем сумму углов.
  const ids = points.map((p) => p.id);
  if (ids.length === 3 && segments.length === 3) {
    const [p1, p2, p3] = points;
    const sum = angleDeg(p1, p2, p3) + angleDeg(p2, p1, p3) + angleDeg(p3, p1, p2);
    console.log(`  Triangle angle sum check (${p1.id}${p2.id}${p3.id}): ${sum.toFixed(2)}° (should be ~180°)`);
  }
});

console.log("\n(Manually cross-check the printed numbers against what the lesson text/theorem claims.)");
