import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function LocalizedHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <section className="card p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight dark:text-slate-100">{t('title')}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-steel dark:text-slate-300">{t('description')}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href={`/${locale}/auth/login`} className="rounded-full bg-ocean px-5 py-2 text-white">
          {t('login')}
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className="rounded-full border border-slate-300 px-5 py-2 text-steel dark:border-slate-700 dark:text-slate-300"
        >
          {t('openDashboard')}
        </Link>
      </div>
    </section>
  );
}
