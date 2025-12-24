import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | PyCode AI',
  description: 'Sign in to your PyCode AI account.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back!"
      description="The journey to better code continues. We're glad to see you again."
    >
      <LoginForm />
    </AuthLayout>
  )
}
