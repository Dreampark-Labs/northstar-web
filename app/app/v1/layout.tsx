import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';

// Generate metadata for the v1 app section
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Northstar App',
    'Academic productivity application - manage your courses, assignments, and files',
    ['app', 'academic', 'productivity', 'student', 'dashboard']
  );
}

export default function V1Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Authentication is now handled by middleware and the ExternalAuthProvider
  // The middleware will redirect unauthenticated users to the external portal
  return <>{children}</>;
}
