import { redirect } from 'next/navigation';

export default function AppHomePage() {
  // Redirect to the dashboard - ensures users always land on the dashboard
  redirect('/app/v1/dashboard');
}
