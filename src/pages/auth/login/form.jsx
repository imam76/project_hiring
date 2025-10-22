import { Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import * as z from 'zod';

import { ENV } from '@/config/env';
import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { zodResolver } from '@hookform/resolvers/zod';

const { Text } = Typography;

// Login form schema
export const LoginFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Constants
const DEFAULT_CREDENTIALS = {
  email: 'test@mailinator.com',
  password: '123123',
};

export default function LoginFormComponent({ onSubmit, isLoading }) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: ENV.IS_LOCAL
      ? DEFAULT_CREDENTIALS
      : { email: '', password: '' },
  });

  // Components
  const SocialLoginActions = () => (
    <div className="flex flex-col items-center gap-1">
      <Text type="secondary">Or sign in with</Text>
      <div className="flex gap-4">
        <GoogleOutlined className="p-1 text-2xl text-gray-700 cursor-pointer transition-colors" />
        <GithubOutlined className="p-1 text-2xl text-gray-700 cursor-pointer transition-colors" />
        <FacebookOutlined className="p-1 text-2xl text-gray-700 cursor-pointer transition-colors" />
      </div>
    </div>
  );

  const SignUpPrompt = () => (
    <div className="text-center py-2">
      <Text type="secondary" className="text-xs">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-blue-600 hover:text-blue-800">
          Sign Up
        </Link>
      </Text>
    </div>
  );

  return (
    <LoginForm
      title={ENV.VITE_APP_NAME}
      subTitle="Sign in to your account"
      onFinish={handleSubmit(onSubmit)}
      submitter={{
        submitButtonProps: {
          disabled: isSubmitting || isLoading,
          loading: isSubmitting || isLoading,
        },
        searchConfig: {
          submitText: 'Sign In',
        },
      }}
      actions={<SocialLoginActions />}
    >
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <ProFormText
            {...field}
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className="prefixIcon" />,
            }}
            placeholder="Email"
            validateStatus={errors.email && 'error'}
            extra={
              errors?.email?.message && (
                <Text className="text-xs" type="danger">
                  {errors.email.message}
                </Text>
              )
            }
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <ProFormText.Password
            {...field}
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className="prefixIcon" />,
            }}
            placeholder="Password"
            validateStatus={errors.password && 'error'}
            extra={
              errors?.password?.message && (
                <Text className="text-xs" type="danger">
                  {errors.password.message}
                </Text>
              )
            }
          />
        )}
      />
      <SignUpPrompt />
    </LoginForm>
  );
}
