import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  username: string;
  twitter: string;
  farcaster: string;
  updateProfile: (updates: Partial<Omit<ProfileState, 'updateProfile'>>) => void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      username: '',
      twitter: '',
      farcaster: '',
      updateProfile: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'celo-atari-profile',
    }
  )
);
