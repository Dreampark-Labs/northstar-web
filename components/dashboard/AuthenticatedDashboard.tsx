"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { DueSoon } from '@/components/ui/DueSoon';
import { NotionCalendarWeekView } from '@/components/ui/NotionCalendar';
import { CustomizableGrid, type GridComponent } from '@/components/layout/CustomizableGrid';
import { DynamicHead } from '@/components/ui/DynamicHead';
import { ClipboardImageIcon, DocumentIcon, CalendarIcon } from '@sanity/icons';
import { getCourseColor, generateRecurringEvents, getUpcomingAssignments } from '@/lib/calendar';
import { type CalendarEvent } from '@/components/ui/Calendar';
import { useAssignmentDetailsModalContext } from '@/providers/AssignmentDetailsModalProvider';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AuthenticatedDashboard() {
  const { open: openAssignmentDetails } = useAssignmentDetailsModalContext();
  
  // Fetch data from authenticated user
  const allAssignments = useQuery(api.assignments.list);
  const dbTerms = useQuery(api.terms.list) || [];
  const dbCourses = useQuery(api.courses.list) || [];
  const dbEvents = useQuery(api.events.list) || [];
  const dueSoonAssignments = useQuery(api.assignments.getAssignmentsDueSoon) || [];
  
  // Calculate stats
  const completedAssignmentsCount = React.useMemo(() => {
    if (!allAssignments) return 0;
    return allAssignments.filter(assignment => assignment.status === 'done').length;
  }, [allAssignments]);

  const activeCoursesCount = React.useMemo(() => {
    // Get courses from the current active term
    const now = new Date();
    const activeTerm = dbTerms.find(term => {
      const startDate = new Date(term.startDate);
      const endDate = new Date(term.endDate);
      return now >= startDate && now <= endDate;
    });
    
    if (!activeTerm) return 0;
    return dbCourses.filter(course => course.termId === activeTerm._id).length;
  }, [dbCourses, dbTerms]);

  const thisWeekEventsCount = React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    let count = 0;
    
    // Count events this week
    count += dbEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length;
    
    // Count assignments due this week
    if (allAssignments) {
      count += allAssignments.filter(assignment => {
        if (assignment.status === 'done') return false;
        const dueDate = new Date(assignment.dueAt);
        return dueDate >= startOfWeek && dueDate <= endOfWeek;
      }).length;
    }
    
    return count;
  }, [dbEvents, allAssignments]);

  const dueSoonCount = dueSoonAssignments.length;

  // Generate calendar events from real user data
  const dashboardCalendarEvents: CalendarEvent[] = useMemo(() => {
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
    if (allAssignments) {
      allAssignments.forEach(assignment => {
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
    }

    // Generate class events from course schedules
    dbCourses.forEach(course => {
      // Find the term for this course
      const term = dbTerms.find(t => t._id === course.termId);
      if (!term) return;

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

      events.push(...courseEvents);
    });

    return events;
  }, [dbEvents, allAssignments, dbCourses, dbTerms]);

  // Define dashboard components using the CustomizableGrid pattern
  const gridComponents: GridComponent[] = [
    {
      id: 'calendar',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
                <NotionCalendarWeekView
                  events={dashboardCalendarEvents}
                  onEventClick={(event) => console.log('Dashboard event clicked:', event)}
                  height="100%"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 4, h: 2 }, // 2/3 width, 2x height for calendar
      minSize: { w: 4, h: 2 }, // Prevent calendar from getting too small
      maxSize: { w: 6, h: 3 }
    },
    {
      id: 'due-soon',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Due Soon</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <DueSoon
              maxItems={8}
              onAssignmentClick={openAssignmentDetails}
            />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 }, // 1/3 width, 1x height
      minSize: { w: 2, h: 1 }, // Maintain readable width
      maxSize: { w: 4, h: 2 }
    },
    {
      id: 'recent-activity',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <div style={{ 
              padding: '32px', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <EmptyState
                icon={<ClipboardImageIcon />}
                title="No recent activity"
                description="Your completed assignments and course updates will appear here."
              />
            </div>
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 }, // 1/3 width, 1x height
      minSize: { w: 2, h: 1 }, // Maintain readable width
      maxSize: { w: 4, h: 3 }
    },
    {
      id: 'quick-files',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Quick Files</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <div style={{ 
              padding: '32px', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <EmptyState
                icon={<DocumentIcon />}
                title="No files uploaded"
                description="Upload and organize your documents here."
              />
            </div>
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 }, // 1/3 width, 1x height
      minSize: { w: 2, h: 1 }, // Maintain readable width
      maxSize: { w: 4, h: 2 }
    },
    {
      id: 'get-started',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px', height: 'calc(100% - 60px)' }}>
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--color-fg)'
              }}>
                Ready to get organized?
              </h2>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--color-muted)',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                Create your first term to start tracking courses, assignments, and academic progress
              </p>
              <Button>Create Your First Term</Button>
            </div>
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 4, h: 1 }, // 2/3 width, 1x height
      minSize: { w: 3, h: 1 }, // Prevent CTA from getting too narrow
      maxSize: { w: 6, h: 1 }
    }
  ];

  // Stats content for the top of the dashboard
  const statsContent = (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '12px',
      marginBottom: '24px'
    }}>
      <Card style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-fg)', marginBottom: '4px' }}>
            {activeCoursesCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
            Active Courses
          </div>
        </div>
      </Card>

      <Card style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-fg)', marginBottom: '4px' }}>
            {thisWeekEventsCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
            This Week
          </div>
        </div>
      </Card>

      <Card style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-fg)', marginBottom: '4px' }}>
            {dueSoonCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
            Due Soon
          </div>
        </div>
      </Card>

      <Card style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-success, #22c55e)', marginBottom: '4px' }}>
            {completedAssignmentsCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
            Completed
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <>
      <DynamicHead 
        titleSuffix="Dashboard"
        description="Academic productivity dashboard - manage your courses, assignments, and files"
        keywords={['dashboard', 'academic', 'productivity', 'student', 'courses']}
      />
      <CustomizableGrid
        pageId="dashboard"
        pageTitle="Dashboard"
        components={gridComponents}
        showStats={true}
        statsContent={statsContent}
      />
    </>
  );
}