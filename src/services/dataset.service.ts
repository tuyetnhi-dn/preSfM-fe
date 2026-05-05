import { apiClient } from './api';
import { ApiEnvelope, JobStatus, Metrics } from '@/types';

export const datasetService = {
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<ApiEnvelope<{ jobId: string }>> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      },
    });

    return response.data;
  },
  async getMetrics(projectId: string): Promise<ApiEnvelope<Metrics>> {
    const response = await apiClient.get(`/metrics/${projectId}`);
    return response.data;
  },
  async getJobStatus(jobId: string): Promise<ApiEnvelope<JobStatus>> {
    const response = await apiClient.get(`/jobs/${jobId}/status`);
    return response.data;
  },
};
