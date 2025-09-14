import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { CalendarClient } from './CalendarClient';

// Generate metadata for the calendar page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Calendar',
    'View and manage your academic schedule, courses, and assignments',
    ['calendar', 'schedule', 'academic', 'courses', 'events']
  );
}

export default function CalendarPage() {
  return <CalendarClient />;
}