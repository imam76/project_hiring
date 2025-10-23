import { Card, Grid } from 'antd';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ENV, logger } from '@/config/env';
import { useAuthStore } from '@/stores';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/globalNotification';

import { devLocalLogin } from '@/utils/auth/devLocalAuth';
import LoginFormComponent from './form';

const { useBreakpoint } = Grid;

// Constants
const CONTAINER_STYLES = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
};

export default () => {
  // Log environment info
  logger.log(`Running in ${ENV.VITE_APP_ENV} mode`);
  logger.log(`API URL: ${ENV.VITE_API_BASE_URL}`);

  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  // Zustand store
  const { login, isAuthenticated, isLoading, setUser } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = async (data) => {
    try {
      if (ENV.IS_LOCAL || true) {
        const result = await devLocalLogin(data.email, data.password);

        if (result.success) {
          setUser(result.user);

          showSuccessNotification({
            message: 'Login Successful',
            description: 'Welcome back! Redirecting to dashboard.',
            duration: 3,
          });

          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        } else {
          showErrorNotification({
            message: 'Login Failed',
            description: result.error,
          });
        }
        return;
      }

      const result = await login(data.email, data.password);

      if (result.success) {
        showSuccessNotification({
          message: 'Login Successful',
          description: 'Welcome back! Redirecting to dashboard.',
          duration: 3,
        });

        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        showErrorNotification({
          message: 'Login Failed',
          description: result.error,
        });
      }
    } catch (error) {
      logger.error('Login submission error:', error);
      showErrorNotification({
        message: 'Login Failed',
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <div style={CONTAINER_STYLES}>
      <Card styles={screens.xs ? { body: { height: '100vh' } } : {}}>
        <LoginFormComponent onSubmit={onSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};
