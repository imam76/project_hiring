import { Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { ENV } from '@/config/env';
import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

const { Text } = Typography;

// Register form schema (based on Rust DTO)
export const RegisterFormSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters long'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
});

// Constants
const DEFAULT_CREDENTIALS = {
  username: ENV.IS_LOCAL ? 'testuser' : '',
  email: ENV.IS_LOCAL ? 'test@mailinator.com' : '',
  password: ENV.IS_LOCAL ? '12345678' : '',
};

export default function RegisterFormComponent({ onSubmit, isLoading }) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: DEFAULT_CREDENTIALS,
  });

  // Components
  const SocialLoginActions = () => (
    <div className="flex flex-col items-center gap-1">
      <Text type="secondary">Or sign up with</Text>
      <div className="flex gap-4">
        <GoogleOutlined className="p-1 text-2xl text-gray-700 cursor-pointer hover:text-red-500 transition-colors" />
        <GithubOutlined className="p-1 text-2xl text-gray-700 cursor-pointer hover:text-gray-900 transition-colors" />
        <FacebookOutlined className="p-1 text-2xl text-gray-700 cursor-pointer hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );

  const SignInPrompt = () => (
    <div className="text-center py-2">
      <Text type="secondary" className="text-xs">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-blue-600 hover:text-blue-800">
          Sign In
        </Link>
      </Text>
    </div>
  );

  return (
    <LoginForm
      title={ENV.VITE_APP_NAME}
      subTitle="Create your account"
      onFinish={handleSubmit(onSubmit)}
      submitter={{
        submitButtonProps: {
          disabled: isSubmitting || isLoading,
          loading: isSubmitting || isLoading,
        },
        searchConfig: {
          submitText: 'Sign Up',
        },
      }}
      actions={<SocialLoginActions />}
    >
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <ProFormText
            {...field}
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className="prefixIcon" />,
            }}
            placeholder="Username (min 3 characters)"
            validateStatus={errors.username && 'error'}
            extra={
              errors?.username?.message && (
                <Text className="text-xs text-red-500">
                  {errors.username.message}
                </Text>
              )
            }
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <ProFormText
            {...field}
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined className="prefixIcon" />,
            }}
            placeholder="Email"
            validateStatus={errors.email && 'error'}
            extra={
              errors?.email?.message && (
                <Text className="text-xs text-red-500">
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
            placeholder="Password (min 8 characters)"
            validateStatus={errors.password && 'error'}
            extra={
              errors?.password?.message && (
                <Text className="text-xs text-red-500">
                  {errors.password.message}
                </Text>
              )
            }
          />
        )}
      />
      <SignInPrompt />
    </LoginForm>
  );
}
