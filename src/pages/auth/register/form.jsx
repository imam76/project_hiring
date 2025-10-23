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
import {
  LoginForm,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

const { Text } = Typography;

// Register form schema (conditional requirements for company role)
export const RegisterFormSchema = z
  .object({
    role: z.enum(['candidate', 'company']),
    username: z.string().optional().or(z.literal('')),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long'),
    company_name: z.string().optional().or(z.literal('')),
    phone_number: z.string().optional().or(z.literal('')),
  })
  .superRefine((val, ctx) => {
    if (val.role === 'company') {
      if (!val.username || val.username.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['username'],
          message: 'Username is required (min 3) for company',
        });
      }
      if (!val.company_name || val.company_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['company_name'],
          message: 'Company name is required',
        });
      }
      if (!val.phone_number || val.phone_number.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone_number'],
          message: 'Phone number is required',
        });
      }
    }
  });

// Constants
const DEFAULT_CREDENTIALS = {
  role: 'candidate',
  username: ENV.IS_LOCAL || true ? 'testuser' : '',
  email: ENV.IS_LOCAL || true ? 'test@mailinator.com' : '',
  password: ENV.IS_LOCAL || true ? '12345678' : '',
  company_name: ENV.IS_LOCAL || true ? 'Demo Company' : '',
  phone_number: ENV.IS_LOCAL || true ? '+628111111111' : '',
};

export default function RegisterFormComponent({ onSubmit, isLoading }) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: DEFAULT_CREDENTIALS,
  });

  const role = watch('role');

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
        name="role"
        control={control}
        render={({ field }) => (
          <ProFormRadio.Group
            {...field}
            radioType="button"
            options={[
              { label: 'Candidate', value: 'candidate' },
              { label: 'Company', value: 'company' },
            ]}
          />
        )}
      />
      {role === 'company' && (
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
      )}
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
      {role === 'company' && (
        <Controller
          name="company_name"
          control={control}
          render={({ field }) => (
            <ProFormText
              {...field}
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className="prefixIcon" />,
              }}
              placeholder="Company name"
              validateStatus={errors.company_name && 'error'}
              extra={
                errors?.company_name?.message && (
                  <Text className="text-xs text-red-500">
                    {errors.company_name.message}
                  </Text>
                )
              }
            />
          )}
        />
      )}
      {role === 'company' && (
        <Controller
          name="phone_number"
          control={control}
          render={({ field }) => (
            <ProFormText
              {...field}
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className="prefixIcon" />,
              }}
              placeholder="Phone number"
              validateStatus={errors.phone_number && 'error'}
              extra={
                errors?.phone_number?.message && (
                  <Text className="text-xs text-red-500">
                    {errors.phone_number.message}
                  </Text>
                )
              }
            />
          )}
        />
      )}
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
