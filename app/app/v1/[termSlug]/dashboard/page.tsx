import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { DashboardClient } from './DashboardClient';

// Generate metadata for the dashboard page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Dashboard',
    'Academic productivity dashboard - manage your courses, assignments, and files',
    ['dashboard', 'academic', 'productivity', 'student', 'courses']
  );
}

export default function Dashboard() {
  return <DashboardClient />;
}
