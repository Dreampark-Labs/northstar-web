"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { DueSoon } from '@/components/ui/DueSoon';
import { NotionCalendarWeekView } from '@/components/ui/NotionCalendar';
import { DynamicHead } from '@/components/ui/DynamicHead';
import { ClipboardImageIcon, DocumentIcon } from '@sanity/icons';
import { getCourseColor, generateRecurringEvents } from '@/lib/calendar';
import { type CalendarEvent } from '@/components/ui/Calendar';
import { useAssignmentDetailsModalContext } from '@/providers/AssignmentDetailsModalProvider';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function FixedDashboard() {
  const params = useParams();
  const termSlug = params?.termSlug as string;
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
      const term = dbTerms.find(t => t._id === course.termId);
      if (!term) return;

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

  return (
    <>
      <DynamicHead 
        titleSuffix="Dashboard"
        description="Academic productivity dashboard - manage your courses, assignments, and files"
        keywords={['dashboard', 'academic', 'productivity', 'student', 'courses']}
      />
      
      <div style={{ 
        padding: '24px', 
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Dashboard Title */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--color-fg)',
            margin: 0
          }}>
            Dashboard
          </h1>
        </div>

        {/* Stats Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px',
          marginBottom: '24px',
          flexShrink: 0
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

        {/* Dynamic Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '12px',
          width: '100%',
          flex: 1,
          minHeight: '600px' // Minimum height to ensure content is readable
        }}>
          {/* This Week - 4x2 on the left */}
          <div style={{ gridColumn: '1 / 5', gridRow: '1 / 3' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '400px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingBottom: '16px',
                flexShrink: 0
              }}>
                <CardTitle>This Week</CardTitle>
                <button
                  onClick={() => window.location.href = `/app/v1/${termSlug}/calendar`}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '13px',
                    fontWeight: '400',
                    cursor: 'pointer',
                    padding: '0',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  View Full Calendar
                </button>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                boxSizing: 'border-box',
                minHeight: 0
              }}>
                <div style={{ 
                  height: '100%', 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ 
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    maxHeight: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div 
                      style={{
                        height: '100%',
                        width: '100%',
                        overflow: 'hidden',
                        maxHeight: '100%',
                        contain: 'layout style size'
                      }}
                    >
                      <div style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
                        <NotionCalendarWeekView
                          events={dashboardCalendarEvents}
                          onEventClick={(event) => console.log('Dashboard event clicked:', event)}
                          height="100%"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Due Soon - 2x1 on top right */}
          <div style={{ gridColumn: '5 / 7', gridRow: '1 / 2' }}>
            <Card style={{ height: '100%', minHeight: '200px' }}>
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
          </div>

          {/* Recent Activity - 2x1 under Due Soon */}
          <div style={{ gridColumn: '5 / 7', gridRow: '2 / 3' }}>
            <Card style={{ height: '100%', minHeight: '200px' }}>
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
          </div>

          {/* Quick Files - 2x1 on bottom left */}
          <div style={{ gridColumn: '1 / 3', gridRow: '3 / 4' }}>
            <Card style={{ height: '100%', minHeight: '200px' }}>
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
          </div>

          {/* Get Started - 4x1 on bottom right */}
          <div style={{ gridColumn: '3 / 7', gridRow: '3 / 4' }}>
            <Card style={{ height: '100%', minHeight: '200px' }}>
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
          </div>
        </div>
      </div>
    </>
  );
}
