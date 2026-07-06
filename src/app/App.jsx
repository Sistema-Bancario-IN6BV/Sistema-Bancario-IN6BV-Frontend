import { useEffect } from 'react';
import { AppRoutes } from './router/AppRoutes';
import { useAuthStore } from '../features/auth/store/authStore';
import ErrorBoundary from '../shared/components/ErrorBoundary';

function App() {
  const { isLoadingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;