'use client';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface VideoDropZoneProps {
  onFileSelect: (file: File) => void;
}

export function VideoDropZone({ onFileSelect }: VideoDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const t = useTranslations('projects');

  const handleFile = (file: File | undefined) => {
    if (file?.type.startsWith('video/')) onFileSelect(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 transition',
        'border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-300',
        'dark:border-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/20',
        dragging && 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700'
      )}
    >
      <CloudUpload className="h-8 w-8 text-slate-400" />
      <div className="text-center">
        <p className="text-sm font-medium dark:text-slate-100">{t('uploadInstructions')}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('fileSizeLimit')}</p>
      </div>
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={onChange} />
    </div>
  );
}