import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Transaction } from '@shared/types';
interface AppState {
  // Security
  isLocked: boolean;
  pin: string | null;
  loginLockEnabled: boolean;
  // Offline Data
  offlineQueue: Transaction[];
  isOnline: boolean;
  // Actions
  setLocked: (locked: boolean) => void;
  setPin: (pin: string | null) => void;
  setLoginLockEnabled: (enabled: boolean) => void;
  addToOfflineQueue: (transaction: Transaction) => void;
  clearOfflineQueue: () => void;
  setOnlineStatus: (status: boolean) => void;
}
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLocked: false,
      pin: null,
      loginLockEnabled: false,
      offlineQueue: [],
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      setLocked: (locked) => set({ isLocked: locked }),
      setPin: (pin) => set({ pin }),
      setLoginLockEnabled: (enabled) => set({ loginLockEnabled: enabled }),
      addToOfflineQueue: (transaction) => 
        set((state) => ({ offlineQueue: [...state.offlineQueue, transaction] })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
      setOnlineStatus: (status) => set({ isOnline: status }),
    }),
    {
      name: 'pharmavault-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pin: state.pin,
        loginLockEnabled: state.loginLockEnabled,
        offlineQueue: state.offlineQueue,
      }),
    }
  )
);