import { redirect } from 'next/navigation';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function AppHomePage() {
  // Redirect to the dashboard - ensures users always land on the dashboard
  redirect('/app/v1/dashboard');
}
