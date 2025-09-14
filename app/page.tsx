import { redirect } from 'next/navigation';

export default function HomePage() {
  // Default route for all users - always redirect to dashboard
  // This ensures that new users, first-time users, and returning users
  // all land on the dashboard as the primary application interface
  redirect('/app/v1/dashboard');
}