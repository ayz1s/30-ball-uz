export function RingProgress({
  value,
  size = 44,
  strokeWidth,
  className = "",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const stroke = strokeWidth ?? Math.max(4, Math.round(size / 8.5));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = circumference * (1 - clamped);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className="stroke-blue-100 dark:stroke-blue-950"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="stroke-blue-600 dark:stroke-blue-400"
      />
    </svg>
  );
}

export function RingStat({
  value,
  total,
  size = 44,
}: {
  value: number;
  total: number;
  size?: number;
}) {
  const pct = total > 0 ? value / total : 0;
  const fontSize = Math.max(9, Math.round(size / 4.4));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <RingProgress value={pct} size={size} />
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-blue-700 dark:text-blue-400"
        style={{ fontSize }}
      >
        {value}/{total}
      </div>
    </div>
  );
}
