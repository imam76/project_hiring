import { ENV, logger } from '@/config/env';
import { useAuthStore } from '@/stores';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/globalNotification';
import { Card } from 'antd';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import RegisterFormComponent from './form';

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

  // Zustand store
  const { register, isAuthenticated, isLoading } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = async (data) => {
    try {
      const result = await register(data.username, data.email, data.password);

      if (result.success) {
        showSuccessNotification({
          message: 'Registration Successful',
          description:
            result.message || 'Account created successfully! Please login.',
          duration: 3,
        });

        navigate('/auth/login');
      } else {
        showErrorNotification({
          message: 'Registration Failed',
          description: result.error,
        });
      }
    } catch (error) {
      logger.error('Registration submission error:', error);
      showErrorNotification({
        message: 'Registration Failed',
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <div style={CONTAINER_STYLES}>
      <Card>
        <RegisterFormComponent onSubmit={onSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};
