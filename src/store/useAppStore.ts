import { create } from 'zustand';
import { JobStatus, Project, UserProfile } from '@/types';

interface AppState {
  user: UserProfile | null;
  token: string | null;
  currentProject: Project | null;
  jobStatus: JobStatus | null;
  setAuth: (user: UserProfile, token: string) => void;
  clearAuth: () => void;
  setCurrentProject: (project: Project) => void;
  setJobStatus: (jobStatus: JobStatus) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  currentProject: null,
  jobStatus: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setJobStatus: (jobStatus) => set({ jobStatus }),
}));
