import { apiClient } from './api';
import { ApiEnvelope, AuthTokens } from '@/types';

export const authService = {
  async sendOtp(email: string): Promise<ApiEnvelope<{ email: string }>> {
    const response = await apiClient.post('/auth/send-otp', { email });
    return response.data;
  },
  async verifyOtp(email: string, otp: string): Promise<ApiEnvelope<null>> {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },
  async register(email: string, password: string): Promise<ApiEnvelope<AuthTokens>> {
    const response = await apiClient.post('/auth/register', { email, password });
    return response.data;
  },
  async login(email: string, password: string): Promise<ApiEnvelope<AuthTokens>> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
};
