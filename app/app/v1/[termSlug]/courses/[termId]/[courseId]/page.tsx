import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { CourseDetailClient } from './CourseDetailClient';

// Generate metadata for the individual course page
export async function generateMetadata({ params }: { params: { termId: string; courseId: string } }): Promise<Metadata> {
  return generatePageMetadata(
    'Course Details',
    'View course information, assignments, and academic progress',
    ['course', 'academic', 'assignments', 'student', 'classes']
  );
}

export default function CourseDetailPage({ params }: { params: { termId: string; courseId: string } }) {
  return <CourseDetailClient termId={params.termId} courseId={params.courseId} />;
}
