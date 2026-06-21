import { Emotion } from '../../types';

interface EmotionIndicatorProps {
  emotion: Emotion;
  eyeContact: number;
  confidence: number;
}

const emotionConfig: Record<Emotion, { label: string; color: string; bg: string; dot: string }> = {
  confident: {
    label: 'Confident',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    dot: '#22C55E',
  },
  engaged: {
    label: 'Engaged',
    color: '#22D3EE',
    bg: 'rgba(34,211,238,0.1)',
    dot: '#22D3EE',
  },
  neutral: {
    label: 'Neutral',
    color: '#9CA3AF',
    bg: 'rgba(156,163,175,0.1)',
    dot: '#9CA3AF',
  },
  nervous: {
    label: 'Nervous',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    dot: '#F59E0B',
  },
  stressed: {
    label: 'Stressed',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    dot: '#EF4444',
  },
};

function MiniBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-medium" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background: color,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

export default function EmotionIndicator({ emotion, eyeContact, confidence }: EmotionIndicatorProps) {
  const cfg = emotionConfig[emotion];

  return (
    <div className="glass p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Behavior Analysis</span>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: cfg.dot }}
          />
          {cfg.label}
        </div>
      </div>

      <MiniBar value={eyeContact} color="#6366F1" label="Eye Contact" />
      <MiniBar value={confidence} color="#22D3EE" label="Confidence" />
    </div>
  );
}
