import '@/lib/errorReporter';
import { enableMapSet } from "immer";
import React, { StrictMode, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { PricingPage } from '@/pages/PricingPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { SalesPage } from '@/pages/SalesPage';
import { PurchasesPage } from '@/pages/PurchasesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { PinLock } from '@/components/auth/PinLock';
import { useAppStore } from '@/lib/offline-store';
enableMapSet();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const router = createBrowserRouter([
  { path: "/", element: <HomePage />, errorElement: <RouteErrorBoundary /> },
  { path: "/dashboard", element: <DashboardPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/inventory", element: <InventoryPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/pricing", element: <PricingPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/suppliers", element: <SuppliersPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/categories", element: <CategoriesPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/sales", element: <SalesPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/purchases", element: <PurchasesPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/reports", element: <ReportsPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/settings", element: <SettingsPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/accounts", element: <AccountsPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/expenses", element: <ExpensesPage />, errorElement: <RouteErrorBoundary /> },
]);
function AppRoot() {
  const setOnlineStatus = useAppStore(s => s.setOnlineStatus);
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);
  return (
    <PinLock>
      <RouterProvider router={router} />
    </PinLock>
  );
}
const rootElement = document.getElementById('root');
if (rootElement) {
  // Use a stable identifier to check for existing root in DEV (Singleton-ish pattern for HMR)
  const rootKey = '__reactRoot';
  let root = (window as any)[rootKey] as Root | undefined;
  if (!root) {
    root = createRoot(rootElement);
    (window as any)[rootKey] = root;
  }
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppRoot />
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>
  );
}