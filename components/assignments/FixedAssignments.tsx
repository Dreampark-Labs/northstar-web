"use client";

import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { ClipboardImageIcon, AddIcon } from '@sanity/icons';
import { DynamicHead } from '@/components/ui/DynamicHead';
import { useAssignmentModalContext } from '@/providers/AssignmentModalProvider';
import { useCommandPaletteContext } from '@/providers/CommandPaletteProvider';
import { useAssignmentDetailsModalContext } from '@/providers/AssignmentDetailsModalProvider';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BookOpen } from 'lucide-react';

// Import the existing components (these should be extracted from the current assignments page)
// DueSoon component
function DueSoon({ maxItems = 8, onAssignmentClick }: { maxItems?: number; onAssignmentClick?: (id: Id<"assignments">) => void }) {
  const assignments = useQuery(api.assignments.getAssignmentsDueSoon);
  const courses = useQuery(api.courses.list);

  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map: any, course: any) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  const enrichedAssignments = React.useMemo(() => {
    if (!assignments) return [];
    
    return assignments
      .map((assignment: any) => ({
        ...assignment,
        course: courseMap[assignment.courseId]
      }))
      .filter((assignment: any) => assignment.course)
      .slice(0, maxItems);
  }, [assignments, courseMap, maxItems]);

  const formatDueTime = (dueAt: number): string => {
    const dueDate = new Date(dueAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dueDate < today) {
      return 'Overdue';
    } else if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dueDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (!assignments) {
    return (
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (enrichedAssignments.length === 0) {
    return (
      <div style={{ 
        padding: '32px', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <EmptyState
          icon={<BookOpen />}
          title="All caught up!"
          description="No assignments due in the next 7 days."
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {enrichedAssignments.map((assignment: any) => (
        <div
          key={assignment._id}
          onClick={() => onAssignmentClick?.(assignment._id)}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '4px'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: 'var(--color-fg)',
              flex: 1,
              marginRight: '8px'
            }}>
              {assignment.title}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--color-muted)',
              fontWeight: '500',
              flexShrink: 0
            }}>
              {formatDueTime(assignment.dueAt)}
            </div>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{assignment.course.code}</span>
            {assignment.course.title && (
              <>
                <span>•</span>
                <span>{assignment.course.title}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Overdue component
function Overdue({ maxItems = 10, onAssignmentClick }: { maxItems?: number; onAssignmentClick?: (id: Id<"assignments">) => void }) {
  const assignments = useQuery(api.assignments.list);
  const courses = useQuery(api.courses.list);

  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map: any, course: any) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  const overdueAssignments = React.useMemo(() => {
    if (!assignments) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return assignments
      .filter((assignment: any) => assignment.status !== 'done')
      .map((assignment: any) => ({
        ...assignment,
        course: courseMap[assignment.courseId]
      }))
      .filter((assignment: any) => assignment.course && new Date(assignment.dueAt) < today)
      .slice(0, maxItems);
  }, [assignments, courseMap, maxItems]);

  if (!assignments) {
    return (
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (overdueAssignments.length === 0) {
    return (
      <div style={{ 
        padding: '32px', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <EmptyState
          icon={<BookOpen />}
          title="All caught up!"
          description="No overdue assignments."
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {overdueAssignments.map((assignment: any) => (
        <div
          key={assignment._id}
          onClick={() => onAssignmentClick?.(assignment._id)}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '4px'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: 'var(--color-fg)',
              flex: 1,
              marginRight: '8px'
            }}>
              {assignment.title}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--color-danger, #ef4444)',
              fontWeight: '500',
              flexShrink: 0
            }}>
              Overdue
            </div>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{assignment.course.code}</span>
            {assignment.course.title && (
              <>
                <span>•</span>
                <span>{assignment.course.title}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Recent Activity component
function RecentActivity({ maxItems = 8, onAssignmentClick }: { maxItems?: number; onAssignmentClick?: (id: Id<"assignments">) => void }) {
  return (
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
        description="Your completed assignments and updates will appear here."
      />
    </div>
  );
}

// All Assignments List component (simplified for now)
function AllAssignmentsList({ onCreateAssignment, onAssignmentClick }: { 
  onCreateAssignment?: () => void; 
  onAssignmentClick?: (id: Id<"assignments">) => void;
}) {
  const assignments = useQuery(api.assignments.list);
  const courses = useQuery(api.courses.list);

  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map: any, course: any) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  if (!assignments) {
    return (
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div style={{ 
        padding: '32px', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <EmptyState
          icon={<BookOpen />}
          title="No assignments yet"
          description="Create your first assignment to get started."
          action={
            <Button onClick={onCreateAssignment}>
              <AddIcon />
              Create Assignment
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {assignments.map((assignment: any) => {
        const course = courseMap[assignment.courseId];
        return (
          <div
            key={assignment._id}
            onClick={() => onAssignmentClick?.(assignment._id)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '4px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--color-fg)',
                flex: 1,
                marginRight: '8px'
              }}>
                {assignment.title}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: assignment.status === 'done' ? 'var(--color-success, #22c55e)' : 'var(--color-muted)',
                fontWeight: '500',
                flexShrink: 0
              }}>
                {assignment.status === 'done' ? 'Completed' : new Date(assignment.dueAt).toLocaleDateString()}
              </div>
            </div>
            {course && (
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{course.code}</span>
                {course.title && (
                  <>
                    <span>•</span>
                    <span>{course.title}</span>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FixedAssignments() {
  const params = useParams();
  const termSlug = params?.termSlug as string;
  const { open: openAssignmentModal } = useAssignmentModalContext();
  const { open: openCommandPalette } = useCommandPaletteContext();
  const { open: openAssignmentDetails } = useAssignmentDetailsModalContext();
  const searchParams = useSearchParams();

  // Handle URL parameters for modal opening
  useEffect(() => {
    const hasAssignment = searchParams.get('assignment') !== null;
    const hasSearch = searchParams.get('search') !== null;
    
    if (hasAssignment) {
      openAssignmentModal();
    }
    if (hasSearch) {
      openCommandPalette();
    }
  }, [searchParams, openAssignmentModal, openCommandPalette]);

  const handleAssignmentOpen = () => {
    const newUrl = `${window.location.pathname}?assignment=add`;
    window.history.pushState({ assignment: 'add' }, '', newUrl);
    openAssignmentModal();
  };

  return (
    <>
      <DynamicHead 
        titleSuffix="Assignments"
        description="Manage your academic assignments, track due dates, and stay organized"
        keywords={['assignments', 'homework', 'due dates', 'academic', 'student']}
      />
      
      <div style={{ 
        padding: '24px', 
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with Title and Add Assignment Button */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--color-fg)',
            margin: 0
          }}>
            Assignments
          </h1>
          <Button onClick={handleAssignmentOpen}>
            <AddIcon />
            New Assignment
          </Button>
        </div>

        {/* Fixed Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '12px',
          width: '100%',
          flex: 1,
          minHeight: '600px'
        }}>
          {/* Due Soon - 2x1 on the left */}
          <div style={{ gridColumn: '1 / 3', gridRow: '1 / 2' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '200px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>Due Soon</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <DueSoon maxItems={20} onAssignmentClick={openAssignmentDetails} />
              </CardContent>
            </Card>
          </div>

          {/* Overdue - 2x1 in the middle */}
          <div style={{ gridColumn: '3 / 5', gridRow: '1 / 2' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '200px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>Overdue</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <Overdue maxItems={10} onAssignmentClick={openAssignmentDetails} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity - 2x1 on the right */}
          <div style={{ gridColumn: '5 / 7', gridRow: '1 / 2' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '200px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <RecentActivity maxItems={8} onAssignmentClick={openAssignmentDetails} />
              </CardContent>
            </Card>
          </div>

          {/* All Assignments - 6x2 spanning the full width below */}
          <div style={{ gridColumn: '1 / 7', gridRow: '2 / 4' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '400px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>All Assignments</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <AllAssignmentsList 
                  onCreateAssignment={handleAssignmentOpen} 
                  onAssignmentClick={openAssignmentDetails} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
