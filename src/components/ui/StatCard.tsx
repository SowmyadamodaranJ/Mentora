import { ComponentType } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ComponentType<any>;
  color?: 'primary' | 'secondary' | 'accent' | 'success';
  trend?: { value: number; positive: boolean };
}

const colorConfig = {
  primary: {
    iconBg: 'rgba(99,102,241,0.15)',
    iconColor: '#818CF8',
    borderGlow: 'rgba(99,102,241,0.15)',
  },
  secondary: {
    iconBg: 'rgba(34,211,238,0.1)',
    iconColor: '#22D3EE',
    borderGlow: 'rgba(34,211,238,0.1)',
  },
  accent: {
    iconBg: 'rgba(167,139,250,0.12)',
    iconColor: '#A78BFA',
    borderGlow: 'rgba(167,139,250,0.12)',
  },
  success: {
    iconBg: 'rgba(34,197,94,0.1)',
    iconColor: '#22C55E',
    borderGlow: 'rgba(34,197,94,0.1)',
  },
};

export default function StatCard({ label, value, subtitle, icon: Icon, color = 'primary', trend }: StatCardProps) {
  const cfg = colorConfig[color];

  return (
    <div
      className="glass p-5 flex items-start gap-4 transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        boxShadow: `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.iconBg }}
      >
        <Icon size={20} style={{ color: cfg.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-heading font-bold text-white leading-none">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className={`text-xs font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.positive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-600">vs last session</span>
          </div>
        )}
      </div>
    </div>
  );
}
