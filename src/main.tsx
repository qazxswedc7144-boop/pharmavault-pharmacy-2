import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { PricingPage } from '@/pages/PricingPage'
import { SuppliersPage } from '@/pages/SuppliersPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { SalesPage } from '@/pages/SalesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { PinLock } from '@/components/auth/PinLock'
import { useAppStore } from '@/lib/offline-store'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/inventory",
    element: <InventoryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/suppliers",
    element: <SuppliersPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/categories",
    element: <CategoriesPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sales",
    element: <SalesPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    errorElement: <RouteErrorBoundary />,
  },
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
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppRoot />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)