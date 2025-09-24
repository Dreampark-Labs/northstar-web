import { CustomSignIn } from '@/components/auth/CustomSignIn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Northstar',
  description: 'Sign in to your Northstar academic productivity account',
};

export default function SignInPage() {
  return <CustomSignIn />;
}
