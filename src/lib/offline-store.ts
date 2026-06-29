import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Transaction, SubscriptionInfo, BillingRecord } from '@shared/types';
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
  // Subscription
  subscription: SubscriptionInfo;
  billingHistory: BillingRecord[];
  // Actions
  setLocked: (locked: boolean) => void;
  setPin: (pin: string | null) => void;
  setLoginLockEnabled: (enabled: boolean) => void;
  addToOfflineQueue: (transaction: Transaction) => void;
  clearOfflineQueue: () => void;
  setOnlineStatus: (status: boolean) => void;
  updateSettings: (settings: Partial<PharmacySettings>) => void;
  setSubscription: (sub: SubscriptionInfo) => void;
  addBillingRecord: (record: BillingRecord) => void;
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
      subscription: {
        planId: 'pro',
        status: 'active',
        billingCycle: 'monthly',
        nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      },
      billingHistory: [
        {
          id: 'INV-001',
          date: new Date().toISOString(),
          amount: 99,
          planId: 'pro',
          invoiceUrl: '#',
          status: 'paid'
        }
      ],
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
      setSubscription: (subscription) => set({ subscription }),
      addBillingRecord: (record) => set((state) => ({ 
        billingHistory: [record, ...state.billingHistory] 
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
        subscription: state.subscription,
        billingHistory: state.billingHistory,
      }),
    }
  )
);