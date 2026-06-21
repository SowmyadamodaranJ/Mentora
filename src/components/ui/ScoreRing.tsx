interface ScoreRingProps {
  score: number;
  label: string;
  color?: string;
  size?: number;
}

const colorMap: Record<string, { stroke: string; glow: string; text: string }> = {
  primary: { stroke: '#6366F1', glow: 'rgba(99,102,241,0.4)', text: '#818CF8' },
  secondary: { stroke: '#22D3EE', glow: 'rgba(34,211,238,0.4)', text: '#22D3EE' },
  accent: { stroke: '#A78BFA', glow: 'rgba(167,139,250,0.4)', text: '#A78BFA' },
  success: { stroke: '#22C55E', glow: 'rgba(34,197,94,0.4)', text: '#22C55E' },
  error: { stroke: '#EF4444', glow: 'rgba(239,68,68,0.4)', text: '#EF4444' },
};

export default function ScoreRing({ score, label, color = 'primary', size = 120 }: ScoreRingProps) {
  const colors = colorMap[color] || colorMap.primary;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="score-ring" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 6px ${colors.glow})`,
            }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center flex-col"
          style={{ transform: 'none' }}
        >
          <span
            className="font-heading font-bold"
            style={{ color: colors.text, fontSize: size * 0.22 }}
          >
            {score}
          </span>
          <span className="text-xs text-gray-500" style={{ fontSize: size * 0.09 }}>/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-400">{label}</span>
    </div>
  );
}
