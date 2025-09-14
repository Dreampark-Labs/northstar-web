"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { NotionCalendar, type Term, type Course } from '@/components/ui/NotionCalendar';
import { type CalendarEvent } from '@/components/ui/Calendar';
import { getCourseColor, generateRecurringEvents } from '@/lib/calendar';
import { useCommandPaletteContext } from '@/providers/CommandPaletteProvider';

// Mock terms and courses data with proper UUIDs for fallback
const MOCK_TERMS: Term[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // UUID for Fall 2025
    name: 'Fall 2025',
    startDate: new Date(2025, 8, 1), // September 1, 2025
    endDate: new Date(2025, 11, 20), // December 20, 2025
    courses: [
      {
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // UUID for CS101
        name: 'Computer Science 101',
        code: 'CS101',
        color: '#3b82f6',
        instructor: 'Dr. Smith',
        termId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      },
      {
        id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', // UUID for MATH201
        name: 'Mathematics 201',
        code: 'MATH201',
        color: '#10b981',
        instructor: 'Prof. Johnson',
        termId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      },
      {
        id: '6ba7b812-9dad-11d1-80b4-00c04fd430c8', // UUID for PHYS301
        name: 'Physics 301',
        code: 'PHYS301',
        color: '#f59e0b',
        instructor: 'Dr. Wilson',
        termId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      }
    ]
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', // UUID for Spring 2026
    name: 'Spring 2026',
    startDate: new Date(2026, 0, 15), // January 15, 2026
    endDate: new Date(2026, 4, 15), // May 15, 2026
    courses: [
      {
        id: '6ba7b813-9dad-11d1-80b4-00c04fd430c8', // UUID for ENG102
        name: 'English 102',
        code: 'ENG102',
        color: '#8b5cf6',
        instructor: 'Prof. Davis',
        termId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480'
      },
      {
        id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8', // UUID for CHEM101
        name: 'Chemistry 101',
        code: 'CHEM101',
        color: '#ef4444',
        instructor: 'Dr. Brown',
        termId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480'
      }
    ]
  }
];

export function CalendarClient() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const searchParams = useSearchParams();
  const { open: openCommandPalette } = useCommandPaletteContext();

  // Handle URL parameters for search modal opening
  useEffect(() => {
    const hasSearch = searchParams.get('search') !== null;
    
    if (hasSearch) {
      openCommandPalette();
    }
  }, [searchParams, openCommandPalette]);

  // Fetch real data from Convex using authenticated user
  const dbTerms = useQuery(api.terms.list) || [];
  const dbCourses = useQuery(api.courses.list) || [];
  const dbEvents = useQuery(api.events.list) || [];
  const dbAssignments = useQuery(api.assignments.list) || [];

  // Convert database data to the format expected by NotionCalendar
  const displayTerms: Term[] = useMemo(() => {
    if (dbTerms.length === 0) {
      // Use mock data if no real terms exist
      return MOCK_TERMS;
    }

    // Convert database terms and associate courses
    return dbTerms.map(term => {
      // Find courses for this term
      const termCourses = dbCourses
        .filter(course => course.termId === term._id)
        .map(course => ({
          id: course._id,
          name: course.title,
          code: course.code,
          color: getCourseColor(course.code),
          instructor: course.instructor,
          termId: term._id,
        }));

      return {
        id: term._id,
        name: term.name,
        startDate: new Date(term.startDate),
        endDate: new Date(term.endDate),
        courses: termCourses,
      };
    });
  }, [dbTerms, dbCourses]);

  // Convert database events and assignments to calendar format
  const allCalendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    // Add events from the events table
    dbEvents.forEach(event => {
      events.push({
        id: event._id,
        title: event.title,
        type: event.type as CalendarEvent['type'],
        startTime: new Date(event.startTime),
        endTime: event.endTime ? new Date(event.endTime) : undefined,
        isAllDay: event.isAllDay,
        color: event.color,
        location: event.location,
        description: event.description,
        courseCode: event.courseCode,
      });
    });

    // Add assignments as calendar events
    dbAssignments.forEach(assignment => {
      const course = dbCourses.find(c => c._id === assignment.courseId);
      events.push({
        id: `assignment-${assignment._id}`,
        title: `${assignment.title} (Due)`,
        type: 'assignment',
        startTime: new Date(assignment.dueAt),
        isAllDay: true,
        color: course ? getCourseColor(course.code) : '#6b7280',
        courseCode: course?.code,
        description: assignment.notes,
      });
    });

    // Generate class events from course schedules
    dbCourses.forEach(course => {
      // Find the term for this course
      const term = dbTerms.find(t => t._id === course.termId);
      if (!term) {
        console.log('No term found for course:', course.code);
        return;
      }

      console.log(`Generating events for ${course.code} from ${term.startDate} to ${term.endDate}`);
      console.log('Course meeting details:', {
        days: course.meetingDays,
        start: course.meetingStart,
        end: course.meetingEnd
      });

      // Generate recurring events for this course within the term dates
      const courseEvents = generateRecurringEvents(
        {
          _id: course._id,
          title: course.title,
          code: course.code,
          meetingDays: course.meetingDays,
          meetingStart: course.meetingStart,
          meetingEnd: course.meetingEnd,
          instructor: course.instructor,
        },
        term.startDate,
        term.endDate
      );

      console.log(`Generated ${courseEvents.length} events for ${course.code}`);
      events.push(...courseEvents);
    });

    console.log(`Total calendar events: ${events.length}`);
    return events;
  }, [dbEvents, dbAssignments, dbCourses, dbTerms]);

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // TODO: Open event details modal or handle event interaction
  };

  const handleAddEvent = (date: Date, hour?: number) => {
    console.log('Add event:', { date, hour });
    // This is now handled directly by the NotionCalendar component
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    console.log('Date changed to:', date);
  };

  // Show loading state while data is being fetched
  const isLoading = dbTerms === undefined || dbCourses === undefined || 
                   dbEvents === undefined || dbAssignments === undefined;

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading calendar...</div>
      </div>
    );
  }

  console.log('Calendar data summary:', {
    terms: dbTerms.length,
    courses: dbCourses.length,
    events: dbEvents.length,
    assignments: dbAssignments.length,
    totalCalendarEvents: allCalendarEvents.length
  });

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <NotionCalendar
        events={allCalendarEvents}
        terms={displayTerms}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
}
