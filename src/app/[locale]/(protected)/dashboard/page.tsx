'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SimpleBarChart } from '@/components/charts/simple-bar-chart';
import { useDataset } from '@/hooks/useDataset';
import { useSocket } from '@/hooks/useSocket';
import { useAppStore } from '@/store/useAppStore';

export default function DashboardPage() {
  useSocket();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { loadMetrics, metrics } = useDataset();
  const jobStatus = useAppStore((state) => state.jobStatus);

  useEffect(() => {
    loadMetrics('default-project').catch(() => undefined);
  }, [loadMetrics]);

  const chartData = [
    { label: t('imageQuality'), value: metrics?.imageQuality ?? 0, color: '#0f766e' },
    { label: t('pointCloudDensity'), value: metrics?.pointCloudDensity ?? 0, color: '#f97316' },
    {
      label: t('reconstructionAccuracy'),
      value: metrics?.reconstructionAccuracy ?? 0,
      color: '#334155',
    },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="card p-6 lg:col-span-2">
        <h1 className="text-2xl font-semibold dark:text-slate-100">{t('title')}</h1>
        <p className="mt-2 text-sm text-steel dark:text-slate-300">{t('subtitle')}</p>
        <div className="mt-6">
          <SimpleBarChart items={chartData} />
        </div>
      </article>

      <article className="card p-6">
        <h2 className="text-lg font-semibold dark:text-slate-100">{t('trackingTitle')}</h2>
        <p className="mt-2 text-sm text-steel dark:text-slate-300">{t('trackingSubtitle')}</p>

        <div className="mt-6 space-y-3">
          <div className="text-sm text-steel dark:text-slate-300">
            {tc('status')}: {jobStatus?.status ?? tc('idle')}
          </div>
          <div className="text-sm text-steel dark:text-slate-300">
            {tc('stage')}: {jobStatus?.stage ?? tc('notStarted')}
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-ocean transition-all duration-500"
              style={{ width: `${jobStatus?.progress ?? 0}%` }}
            />
          </div>
          <div className="text-right text-sm font-medium text-ink dark:text-slate-100">{jobStatus?.progress ?? 0}%</div>
        </div>
      </article>
    </section>
  );
}
