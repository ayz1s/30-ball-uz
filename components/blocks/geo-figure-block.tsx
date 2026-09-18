import type { z } from "zod";
import type { geoFigureBlockSchema } from "@/content/schema/blocks";
import type { Locale } from "@/lib/i18n";

type GeoFigureBlockData = z.infer<typeof geoFigureBlockSchema>;

// Координаты в контенте заданы в привычной "y растёт вверх" системе —
// переворачиваем один раз здесь, а не заставляем авторов контента думать
// в SVG-координатах (где y растёт вниз).
function flip(y: number): number {
  return -y;
}

function unit(dx: number, dy: number): [number, number] {
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

export function GeoFigureBlock({ block }: { block: GeoFigureBlockData; locale: Locale }) {
  const pointMap = new Map(block.points.map((p) => [p.id, { ...p, cy: flip(p.y) }]));

  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of pointMap.values()) {
    xs.push(p.x - 14, p.x + 14);
    ys.push(p.cy - 14, p.cy + 14);
  }
  for (const c of block.circles ?? []) {
    const center = pointMap.get(c.center);
    if (!center) continue;
    xs.push(center.x - c.radius, center.x + c.radius);
    ys.push(center.cy - c.radius, center.cy + c.radius);
  }
  if (xs.length === 0) return null;

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 24;
  const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

  return (
    <div className="space-y-2">
      <svg
        viewBox={viewBox}
        className="w-full h-auto max-h-80 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
        role="img"
        aria-label={block.caption ?? "Геометрический чертёж"}
      >
        {(block.circles ?? []).map((c, i) => {
          const center = pointMap.get(c.center);
          if (!center) return null;
          return (
            <circle
              key={i}
              cx={center.x}
              cy={center.cy}
              r={c.radius}
              fill="none"
              stroke="currentColor"
              className="text-neutral-500 dark:text-neutral-400"
              strokeWidth={1.5}
              strokeDasharray={c.style === "dashed" ? "4 3" : undefined}
            />
          );
        })}

        {block.segments.map((s, i) => {
          const from = pointMap.get(s.from);
          const to = pointMap.get(s.to);
          if (!from || !to) return null;
          const [ux, uy] = unit(to.x - from.x, to.cy - from.cy);
          const extend = 14;
          const x1 = s.arrowEnd === "from" || s.arrowEnd === "both" ? from.x - ux * extend : from.x;
          const y1 = s.arrowEnd === "from" || s.arrowEnd === "both" ? from.cy - uy * extend : from.cy;
          const x2 = s.arrowEnd === "to" || s.arrowEnd === "both" ? to.x + ux * extend : to.x;
          const y2 = s.arrowEnd === "to" || s.arrowEnd === "both" ? to.cy + uy * extend : to.cy;

          const elements = [
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              className="text-neutral-800 dark:text-neutral-200"
              strokeWidth={2}
              strokeDasharray={s.style === "dashed" ? "6 4" : undefined}
              strokeLinecap="round"
            />,
          ];

          // Стрелки на концах луча/прямой.
          const arrowHead = (px: number, py: number, dirX: number, dirY: number, key: string) => {
            const size = 7;
            const perpX = -dirY;
            const perpY = dirX;
            const tipX = px + dirX * size;
            const tipY = py + dirY * size;
            const baseX = px - dirX * 1;
            const baseY = py - dirY * 1;
            return (
              <polygon
                key={key}
                points={`${tipX},${tipY} ${baseX + perpX * size * 0.5},${baseY + perpY * size * 0.5} ${baseX - perpX * size * 0.5},${baseY - perpY * size * 0.5}`}
                fill="currentColor"
                className="text-neutral-800 dark:text-neutral-200"
              />
            );
          };
          if (s.arrowEnd === "from" || s.arrowEnd === "both") {
            elements.push(arrowHead(x1, y1, -ux, -uy, `arrow-from-${i}`));
          }
          if (s.arrowEnd === "to" || s.arrowEnd === "both") {
            elements.push(arrowHead(x2, y2, ux, uy, `arrow-to-${i}`));
          }

          // Засечки равенства сторон на середине отрезка.
          if (s.ticks && s.ticks > 0) {
            const midX = (from.x + to.x) / 2;
            const midY = (from.cy + to.cy) / 2;
            const perpX = -uy;
            const perpY = ux;
            const gap = 4;
            const tickLen = 6;
            for (let t = 0; t < s.ticks; t++) {
              const off = (t - (s.ticks - 1) / 2) * gap;
              const cx = midX + ux * off;
              const cy = midY + uy * off;
              elements.push(
                <line
                  key={`tick-${i}-${t}`}
                  x1={cx - perpX * tickLen}
                  y1={cy - perpY * tickLen}
                  x2={cx + perpX * tickLen}
                  y2={cy + perpY * tickLen}
                  stroke="currentColor"
                  className="text-neutral-800 dark:text-neutral-200"
                  strokeWidth={2}
                />,
              );
            }
          }

          return elements;
        })}

        {(block.angles ?? []).map((a, i) => {
          const vertex = pointMap.get(a.vertex);
          const from = pointMap.get(a.from);
          const to = pointMap.get(a.to);
          if (!vertex || !from || !to) return null;
          const [u1x, u1y] = unit(from.x - vertex.x, from.cy - vertex.cy);
          const [u2x, u2y] = unit(to.x - vertex.x, to.cy - vertex.cy);
          const r = a.radius ?? 20;

          if (a.right) {
            const p1x = vertex.x + u1x * r * 0.6;
            const p1y = vertex.cy + u1y * r * 0.6;
            const p2x = vertex.x + u2x * r * 0.6;
            const p2y = vertex.cy + u2y * r * 0.6;
            const cx = p1x + u2x * r * 0.6;
            const cy = p1y + u2y * r * 0.6;
            return (
              <path
                key={i}
                d={`M ${p1x} ${p1y} L ${cx} ${cy} L ${p2x} ${p2y}`}
                fill="none"
                stroke="currentColor"
                className="text-blue-600 dark:text-blue-400"
                strokeWidth={1.5}
              />
            );
          }

          const angle1 = Math.atan2(u1y, u1x);
          let angle2 = Math.atan2(u2y, u2x);
          let delta = angle2 - angle1;
          while (delta <= -Math.PI) delta += 2 * Math.PI;
          while (delta > Math.PI) delta -= 2 * Math.PI;
          angle2 = angle1 + delta;
          const sweep = delta > 0 ? 1 : 0;
          const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;

          const arcCount = a.arcs ?? 1;
          const arcs = [];
          for (let k = 0; k < arcCount; k++) {
            const rk = r + k * 5;
            const sx = vertex.x + Math.cos(angle1) * rk;
            const sy = vertex.cy + Math.sin(angle1) * rk;
            const ex = vertex.x + Math.cos(angle2) * rk;
            const ey = vertex.cy + Math.sin(angle2) * rk;
            arcs.push(
              <path
                key={`${i}-${k}`}
                d={`M ${sx} ${sy} A ${rk} ${rk} 0 ${largeArc} ${sweep} ${ex} ${ey}`}
                fill="none"
                stroke="currentColor"
                className="text-blue-600 dark:text-blue-400"
                strokeWidth={1.5}
              />,
            );
          }

          const midAngle = angle1 + delta / 2;
          const labelR = r + arcCount * 5 + 10;
          const labelX = vertex.x + Math.cos(midAngle) * labelR;
          const labelY = vertex.cy + Math.sin(midAngle) * labelR;

          return (
            <g key={i}>
              {arcs}
              {a.label && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-blue-700 dark:fill-blue-300"
                  fontSize={11}
                  fontWeight={600}
                >
                  {a.label}
                </text>
              )}
            </g>
          );
        })}

        {block.points.map((p) => {
          const point = pointMap.get(p.id)!;
          return (
            <g key={p.id}>
              <circle cx={point.x} cy={point.cy} r={2.5} fill="currentColor" className="text-neutral-900 dark:text-neutral-100" />
              {p.label && (
                <text
                  x={point.x + (p.labelDx ?? 6)}
                  y={point.cy + (p.labelDy ?? -6)}
                  className="fill-neutral-900 dark:fill-neutral-100"
                  fontSize={13}
                  fontWeight={600}
                >
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {block.caption && <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">{block.caption}</p>}
    </div>
  );
}
