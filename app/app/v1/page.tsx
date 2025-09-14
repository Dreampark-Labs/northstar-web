import { redirect } from 'next/navigation';
import { getAllTermsSlug } from '@/lib/termSlugUtils';

export default function V1HomePage() {
  // Redirect to the dashboard with default term slug
  const defaultTermSlug = getAllTermsSlug();
  redirect(`/app/v1/${defaultTermSlug}/dashboard`);
}
