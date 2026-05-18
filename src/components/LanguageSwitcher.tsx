'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

const locales = ['en', 'vi'] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchTo = (nextLocale: string) => {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      window.location.href = `/${nextLocale}`;
      return;
    }

    if (locales.includes(segments[0] as (typeof locales)[number])) {
      segments[0] = nextLocale;
      window.location.href = `/${segments.join('/')}`;
      return;
    }

    window.location.href = `/${nextLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-brand-300 bg-white/70 p-1 dark:border-border-base dark:bg-bg-panel">
      {locales.map((value) => {
        const active = locale === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => switchTo(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium uppercase transition ${
              active
                ? 'bg-brand text-white'
                : 'text-steel hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800'
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}