import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { CourseDetailClient } from './CourseDetailClient';

// Generate metadata for the individual course page
export async function generateMetadata({ params }: { params: Promise<{ termId: string; courseId: string }> }): Promise<Metadata> {
  const { termId, courseId } = await params;
  return generatePageMetadata(
    'Course Details',
    'View course information, assignments, and academic progress',
    ['course', 'academic', 'assignments', 'student', 'classes']
  );
}

export default async function CourseDetailPage({ params }: { params: Promise<{ termId: string; courseId: string }> }) {
  const { termId, courseId } = await params;
  return <CourseDetailClient termId={termId} courseId={courseId} />;
}
