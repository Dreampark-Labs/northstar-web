import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { AssignmentsClient } from './AssignmentsClient';

// Generate metadata for the assignments page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Assignments',
    'Manage your academic assignments, track due dates, and stay organized',
    ['assignments', 'homework', 'due dates', 'academic', 'student']
  );
}

export default function AssignmentsPage() {
  return <AssignmentsClient />;
}
