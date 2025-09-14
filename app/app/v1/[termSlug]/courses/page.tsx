import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { CoursesClient } from './CoursesClient';

// Generate metadata for the courses page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Courses',
    'Manage your academic courses, track schedules, and organize your studies',
    ['courses', 'academic', 'schedule', 'student', 'classes']
  );
}

export default function CoursesPage() {
  return <CoursesClient />;
}
