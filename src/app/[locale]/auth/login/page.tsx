'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const t = useTranslations('auth');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <div className="mx-auto w-full max-w-md card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold dark:text-slate-100">{t('loginTitle')}</h1>
      <p className="mt-2 text-sm text-steel dark:text-slate-300">{t('loginSubtitle')}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email')}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password')}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ocean px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? t('signingIn') : t('login')}
        </button>
      </form>

      <p className="mt-4 text-sm text-steel dark:text-slate-300">
        {t('newUser')}{' '}
        <Link href={`/${locale}/auth/register`} className="font-medium text-ocean">
          {t('registerWithOtp')}
        </Link>
      </p>
    </div>
  );
}
