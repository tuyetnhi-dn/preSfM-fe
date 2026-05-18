'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full border border-brand-300 bg-white/70 px-2 py-2 text-xs font-medium transition dark:border-brand-700 dark:bg-brand-900/80"
      >
        <div className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-full border border-brand-300 bg-white/70 px-2 py-2 text-xs font-medium text-steel transition hover:bg-brand-100 dark:border-border-base dark:bg-bg-panel dark:text-brand-200 dark:hover:bg-brand-800"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}