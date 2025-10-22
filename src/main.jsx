import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as ANTApp, ConfigProvider, Spin } from 'antd';
import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import('@ant-design/v5-patch-for-react-19');

import App from './App';
import { ENV, logger } from './config/env';
import { useAuthStore } from './stores';
import { theme } from './styles/theme';
import('./index.css');

// Create a client
const queryClient = new QueryClient();

// Log app startup info
logger.log(`🚀 App starting in ${ENV.VITE_APP_ENV} mode`);
logger.log(`📡 API Base URL: ${ENV.VITE_API_BASE_URL}`);

// Auth initializer component
const AuthInitializer = ({ children }) => {
  const { checkAuthStatus, isLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        logger.error('Not authenticated on app start', error);
      }
    };

    initAuth();
  }, [checkAuthStatus]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-xl font-semibold text-gray-700 animate-pulse mt-4">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <ANTApp>
          <AuthInitializer>
            <App />
          </AuthInitializer>
        </ANTApp>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
