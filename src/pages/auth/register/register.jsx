import { ENV, logger } from '@/config/env';
import { useAuthStore } from '@/stores';
import { devLocalLogin } from '@/utils/auth/devLocalAuth';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/globalNotification';
import { useCreateUser } from '@/utils/hooks/useUsers';
import { Card } from 'antd';
import bcrypt from 'bcryptjs';
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
  const { register, isAuthenticated, isLoading, setUser } = useAuthStore();

  // Supabase create user hook
  const createUser = useCreateUser();

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
        // Hash password lalu buat user di Supabase
        const password_hash = await bcrypt.hash(data.password, 10);
        const isCompany = data.role === 'company';
        const payload = {
          email: data.email,
          password_hash,
          full_name: isCompany ? data.username : null,
          role: isCompany ? 'company' : 'candidate', // Ubah dari 'user' menjadi 'candidate'
          company_name: isCompany ? data.company_name : null,
          phone_number: isCompany ? data.phone_number : null,
        };
        await createUser.mutateAsync(payload);

        // Setelah register lokal, langsung login lokal
        const loginResult = await devLocalLogin(data.email, data.password);
        if (loginResult.success) {
          setUser(loginResult.user);
          showSuccessNotification({
            message: 'Registration Successful',
            description: 'Account created! Redirecting to dashboard...',
            duration: 3,
          });
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        } else {
          showErrorNotification({
            message: 'Registration/Login Failed',
            description: loginResult.error,
          });
        }
        return;
      }

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
        <RegisterFormComponent
          onSubmit={onSubmit}
          isLoading={ENV.IS_LOCAL || true ? createUser.isPending : isLoading}
        />
      </Card>
    </div>
  );
};
