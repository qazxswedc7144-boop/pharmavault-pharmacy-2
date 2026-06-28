import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Transaction } from '@shared/types';
interface PharmacySettings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  currency: string;
  printInvoiceAuto: boolean;
}
interface AppState {
  // Security
  isLocked: boolean;
  pin: string | null;
  loginLockEnabled: boolean;
  // Offline Data
  offlineQueue: Transaction[];
  isOnline: boolean;
  // Global Settings
  settings: PharmacySettings;
  // Actions
  setLocked: (locked: boolean) => void;
  setPin: (pin: string | null) => void;
  setLoginLockEnabled: (enabled: boolean) => void;
  addToOfflineQueue: (transaction: Transaction) => void;
  clearOfflineQueue: () => void;
  setOnlineStatus: (status: boolean) => void;
  updateSettings: (settings: Partial<PharmacySettings>) => void;
}
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLocked: false,
      pin: null,
      loginLockEnabled: false,
      offlineQueue: [],
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      settings: {
        name: 'صيدلية فارمافولت',
        address: 'شارع التخصصي، الرياض، المملكة العربية السعودية',
        phone: '920000000',
        logo: '',
        currency: 'ر.س',
        printInvoiceAuto: false
      },
      setLocked: (locked) => set({ isLocked: locked }),
      setPin: (pin) => set({ pin }),
      setLoginLockEnabled: (enabled) => set({ loginLockEnabled: enabled }),
      addToOfflineQueue: (transaction) =>
        set((state) => ({ offlineQueue: [...state.offlineQueue, transaction] })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
      setOnlineStatus: (status) => set({ isOnline: status }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'pharmavault-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pin: state.pin,
        loginLockEnabled: state.loginLockEnabled,
        offlineQueue: state.offlineQueue,
        settings: state.settings,
      }),
    }
  )
);