type Props = {
  value: number; // 0-100
  label?: string;
  size?: number;
  // もし「色を強制したい」ケースがあるなら残す（任意）
  color?: string;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const clamp100 = (n: number) => Math.min(100, Math.max(0, n));

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mixHex = (from: string, to: string, t: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const tt = clamp01(t);
  const r = Math.round(lerp(a.r, b.r, tt));
  const g = Math.round(lerp(a.g, b.g, tt));
  const b2 = Math.round(lerp(a.b, b.b, tt));
  return `rgb(${r} ${g} ${b2})`;
};

// 0-50: green -> orange, 50-100: orange -> red
const colorFromValue = (value: number) => {
  const v = clamp100(value);
  const green = "#22c55e";
  const orange = "#f59e0b";
  const red = "#ef4444";
  if (v <= 50) return mixHex(green, orange, v / 50);
  return mixHex(orange, red, (v - 50) / 50);
};

export function CancelProbGauge({
  value,
  label = "雨天中止予測確率",
  size = 165,
  color,
}: Props) {
  const v = clamp100(value);
  const gaugeColor = color ?? colorFromValue(v);

  const stroke = 14;
  const radius = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - v / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(15, 23, 42, 0.08)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={gaugeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-extrabold"
            style={{ color: gaugeColor }}
          >
            {Math.round(v)}%
          </span>
          <span className="text-lg text-strong">{label}</span>
        </div>
      </div>
    </div>
  );
}
