import { CustomSignUp } from '@/components/auth/CustomSignUp';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Northstar',
  description: 'Create your Northstar academic productivity account',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <CustomSignUp />
    </div>
  );
}
