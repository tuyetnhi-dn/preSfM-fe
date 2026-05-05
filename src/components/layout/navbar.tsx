'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const navItems = [
    { href: `/${locale}/dashboard`, label: t('dashboard') },
    { href: `/${locale}/projects`, label: t('projects') },
    { href: `/${locale}/viewer/sample-model`, label: t('viewer') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`/${locale}/dashboard`} className="text-xl font-semibold tracking-tight text-ink dark:text-slate-100">
          {tc('appName')}
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-ocean text-white'
                    : 'text-steel hover:bg-mist dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
