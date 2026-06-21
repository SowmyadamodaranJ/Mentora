import { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  onClick?: () => void;
  glow?: boolean;
  glowColor?: string;
}

export default function GlassCard({
  children,
  className = '',
  style,
  hover = false,
  onClick,
  glow = false,
  glowColor = 'rgba(99,102,241,0.15)',
}: GlassCardProps) {
  return (
    <div
      className={`glass ${hover ? 'glass-hover cursor-pointer' : ''} ${className}`}
      style={{
        ...(glow && {
          boxShadow: `0 0 30px ${glowColor}, 0 4px 24px rgba(0,0,0,0.3)`,
        }),
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
