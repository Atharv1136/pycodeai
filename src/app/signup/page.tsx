import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignupForm } from '@/components/auth/SignupForm'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | PyCode AI',
  description: 'Create a new account with PyCode AI.',
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Join PyCode AI"
      description="Start building, running, and debugging Python code with the power of AI."
    >
      <SignupForm />
    </AuthLayout>
  )
}
