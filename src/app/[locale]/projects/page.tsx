'use client';

import { ChangeEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDataset } from '@/hooks/useDataset';
import { useAppStore } from '@/store/useAppStore';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const { uploadVideo, uploadProgress, loading } = useDataset();
  const setJobStatus = useAppStore((state) => state.setJobStatus);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const onUpload = async () => {
    if (!file) return;
    try {
      const response = await uploadVideo(file);
      const jobId = response.data.jobId;
      setJobStatus({ id: jobId, status: 'queued', stage: 'video-upload', progress: 0 });
      setMessage(`${t('uploaded')}: ${jobId}`);
    } catch {
      setMessage(t('uploadFailed'));
    }
  };

  return (
    <section className="mx-auto max-w-3xl card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold dark:text-slate-100">{t('title')}</h1>
      <p className="mt-2 text-sm text-steel dark:text-slate-300">{t('subtitle')}</p>

      <div className="mt-6 space-y-4">
        <input
          type="file"
          accept="video/*"
          onChange={onFileChange}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />

        <button
          onClick={onUpload}
          disabled={!file || loading}
          className="rounded-xl bg-ocean px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? t('uploading') : t('uploadButton')}
        </button>

        <div>
          <div className="mb-2 text-sm text-steel dark:text-slate-300">
            {t('uploadProgress')}: {uploadProgress}%
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>

        {message ? <p className="text-sm text-ink dark:text-slate-100">{message}</p> : null}
      </div>
    </section>
  );
}
