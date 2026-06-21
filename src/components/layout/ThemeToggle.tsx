import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
      className="flex items-center gap-2 p-1 rounded-xl transition-all duration-300"
      style={{
        background: theme === 'light'
          ? 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8))'
          : 'rgba(255,255,255,0.03)'
      }}
    >
      <div
        className="relative w-12 h-6 rounded-full p-0.5 flex items-center"
        style={{
          background: theme === 'light' ? 'linear-gradient(90deg,#facc15,#fb7185)' : 'linear-gradient(90deg,#6366F1,#A78BFA)'
        }}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
          style={{ transform: theme === 'light' ? 'translateX(0)' : 'translateX(24px)' }}
        />
      </div>
      <div className="hidden sm:flex items-center gap-1 text-sm font-medium" style={{ color: theme === 'light' ? '#0B0F1A' : '#E5E7EB' }}>
        {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
      </div>
    </button>
  );
}
