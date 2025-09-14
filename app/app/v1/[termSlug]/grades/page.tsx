import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { GradesClient } from './GradesClient';

// Generate metadata for the grades page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Grades',
    'Track your academic performance, GPA, and course grades',
    ['grades', 'GPA', 'academic performance', 'transcript', 'courses']
  );
}

export default function GradesPage() {
  return <GradesClient />;
}
