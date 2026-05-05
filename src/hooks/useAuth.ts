'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { useAppStore } from '@/store/useAppStore';
import { tokenStorage } from '@/utils/storage';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth } = useAppStore();

  const locale = pathname.split('/').filter(Boolean)[0] || 'en';

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(email, password);
      tokenStorage.setToken(result.data.accessToken);
      setAuth({ email }, result.data.accessToken);
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError('Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithOtp = async (email: string, password: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.verifyOtp(email, otp);
      const result = await authService.register(email, password);
      tokenStorage.setToken(result.data.accessToken);
      setAuth({ email }, result.data.accessToken);
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError('Register failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.sendOtp(email);
    } catch (err) {
      setError('Send OTP failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.clearToken();
    clearAuth();
    router.push(`/${locale}/auth/login`);
  };

  return { loading, error, login, sendOtp, registerWithOtp, logout };
}
