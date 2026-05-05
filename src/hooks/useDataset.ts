'use client';

import { useState } from 'react';
import { datasetService } from '@/services/dataset.service';
import { Metrics } from '@/types';

export function useDataset() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadVideo = async (file: File) => {
    setLoading(true);
    try {
      const result = await datasetService.uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });
      return result;
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async (projectId: string) => {
    setLoading(true);
    try {
      const result = await datasetService.getMetrics(projectId);
      setMetrics(result.data);
      return result.data;
    } finally {
      setLoading(false);
    }
  };

  return { uploadVideo, loadMetrics, uploadProgress, metrics, loading };
}
