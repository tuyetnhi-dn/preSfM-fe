export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface UserProfile {
  email: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface JobStatus {
  id: string;
  stage: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
}

export interface Metrics {
  imageQuality: number;
  pointCloudDensity: number;
  reconstructionAccuracy: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
