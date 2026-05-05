'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { sendOtp, registerWithOtp, loading, error } = useAuth();
  const t = useTranslations('auth');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const onSendOtp = async () => {
    await sendOtp(email);
    setOtpSent(true);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await registerWithOtp(email, password, otp);
  };

  return (
    <div className="mx-auto w-full max-w-md card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold dark:text-slate-100">{t('registerTitle')}</h1>
      <p className="mt-2 text-sm text-steel dark:text-slate-300">{t('registerSubtitle')}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email')}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t('otpCode')}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            disabled={loading || !email}
            onClick={onSendOtp}
            className="rounded-xl bg-coral px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {otpSent ? t('resend') : t('sendOtp')}
          </button>
        </div>

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
          disabled={loading || !otp}
          className="w-full rounded-xl bg-ocean px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? t('creatingAccount') : t('register')}
        </button>
      </form>

      <p className="mt-4 text-sm text-steel dark:text-slate-300">
        {t('alreadyHaveAccount')}{' '}
        <Link href={`/${locale}/auth/login`} className="font-medium text-ocean">
          {t('login')}
        </Link>
      </p>
    </div>
  );
}
