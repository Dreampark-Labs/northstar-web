"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { ClipboardImageIcon, CalendarIcon, AddIcon } from '@sanity/icons';
import { CustomizableGrid, type GridComponent } from '@/components/layout/CustomizableGrid';
import { DynamicHead } from '@/components/ui/DynamicHead';
import { useAssignmentModalContext } from '@/providers/AssignmentModalProvider';
import { useCommandPaletteContext } from '@/providers/CommandPaletteProvider';
import { useAssignmentDetailsModalContext } from '@/providers/AssignmentDetailsModalProvider';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen } from 'lucide-react';

// DueSoon component imported from dashboard logic
function DueSoon({ maxItems = 8, onAssignmentClick }: { maxItems?: number; onAssignmentClick?: (id: string) => void }) {
  const assignments = useQuery(api.assignments.getAssignmentsDueSoon);
  const courses = useQuery(api.courses.list);

  // Create a map of course IDs to course info for quick lookup
  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map, course) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  // Combine assignment data with course information
  const enrichedAssignments = React.useMemo(() => {
    if (!assignments) return [];
    
    return assignments
      .map(assignment => ({
        ...assignment,
        course: courseMap[assignment.courseId]
      }))
      .filter(assignment => assignment.course) // Only include assignments with valid courses
      .slice(0, maxItems);
  }, [assignments, courseMap, maxItems]);

  const formatDueTime = (dueAt: number): string => {
    const dueDate = new Date(dueAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const assignmentDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    // Check if it's today, tomorrow, or another day
    if (assignmentDate.getTime() === today.getTime()) {
      return `Today, ${dueDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else if (assignmentDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${dueDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else {
      return dueDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getUrgencyClass = (dueAt: number): string => {
    const dueDate = new Date(dueAt);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue <= 24) {
      return 'urgent';
    } else if (hoursUntilDue <= 48) {
      return 'warning';
    }
    return '';
  };

  if (!assignments) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <BookOpen size={20} />
        <span>Loading assignments...</span>
      </div>
    );
  }

  if (enrichedAssignments.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <BookOpen size={24} style={{ color: 'var(--color-muted)', marginBottom: '8px' }} />
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>All caught up!</div>
        <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
          No assignments due in the next week.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {enrichedAssignments.map((assignment) => (
        <div
          key={assignment._id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
            backgroundColor: getUrgencyClass(assignment.dueAt) === 'urgent' ? 'rgba(239, 68, 68, 0.1)' : 
                            getUrgencyClass(assignment.dueAt) === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
          }}
          onClick={() => onAssignmentClick?.(assignment._id)}
        >
          <div style={{ color: 'var(--color-muted)', marginTop: '2px' }}>
            <BookOpen size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: '500', 
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {assignment.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <BookOpen size={12} />
                <span style={{ fontWeight: '500' }}>{assignment.course.code}</span>
                <span>•</span>
                <span>{assignment.course.title}</span>
              </div>
              <div style={{ fontWeight: '500' }}>
                {formatDueTime(assignment.dueAt)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Overdue component for overdue assignments from current term
function Overdue({ maxItems = 8 }: { maxItems?: number }) {
  const assignments = useQuery(api.assignments.list);
  const courses = useQuery(api.courses.list);

  // Create a map of course IDs to course info for quick lookup
  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map, course) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  // Combine assignment data with course information and filter for overdue
  const enrichedAssignments = React.useMemo(() => {
    if (!assignments) return [];
    
    const now = Date.now();
    return assignments
      .filter(assignment => assignment.status === 'todo' && assignment.dueAt < now) // Only overdue assignments
      .map(assignment => ({
        ...assignment,
        course: courseMap[assignment.courseId]
      }))
      .filter(assignment => assignment.course) // Only include assignments with valid courses
      .slice(0, maxItems);
  }, [assignments, courseMap, maxItems]);

  const formatOverdueTime = (dueAt: number): string => {
    const dueDate = new Date(dueAt);
    const now = new Date();
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Overdue today`;
    } else if (diffDays === 1) {
      return `Overdue 1 day`;
    } else {
      return `Overdue ${diffDays} days`;
    }
  };

  if (!assignments) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <BookOpen size={20} />
        <span>Loading overdue assignments...</span>
      </div>
    );
  }

  if (enrichedAssignments.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <BookOpen size={24} style={{ color: 'var(--color-muted)', marginBottom: '8px' }} />
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>No overdue assignments!</div>
        <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
          All caught up!
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {enrichedAssignments.map((assignment) => (
        <div
          key={assignment._id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
            backgroundColor: 'rgba(239, 68, 68, 0.1)' // Red tint for overdue items
          }}
          onClick={() => onAssignmentClick?.(assignment._id)}
        >
          <div style={{ color: 'var(--color-danger, #ef4444)', marginTop: '2px' }}>
            <BookOpen size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: '500', 
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {assignment.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <BookOpen size={12} />
                <span style={{ fontWeight: '500' }}>{assignment.course.code}</span>
                <span>•</span>
                <span>{assignment.course.title}</span>
              </div>
              <div style={{ fontWeight: '500', color: 'var(--color-danger, #ef4444)' }}>
                {formatOverdueTime(assignment.dueAt)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Recent Activity component for completed assignments from current term
function RecentActivity({ maxItems = 8, onAssignmentClick }: { maxItems?: number; onAssignmentClick?: (id: string) => void }) {
  const assignments = useQuery(api.assignments.getCompletedAssignments);
  const courses = useQuery(api.courses.list);

  // Create a map of course IDs to course info for quick lookup
  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map, course) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  // Combine assignment data with course information
  const enrichedAssignments = React.useMemo(() => {
    if (!assignments) return [];
    
    return assignments
      .map(assignment => ({
        ...assignment,
        course: courseMap[assignment.courseId]
      }))
      .filter(assignment => assignment.course) // Only include assignments with valid courses
      .slice(0, maxItems);
  }, [assignments, courseMap, maxItems]);

  const formatCompletedTime = (dueAt: number): string => {
    const dueDate = new Date(dueAt);
    return `Completed ${dueDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })}`;
  };

  if (!assignments) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <BookOpen size={20} />
        <span>Loading recent activity...</span>
      </div>
    );
  }

  if (enrichedAssignments.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <BookOpen size={24} style={{ color: 'var(--color-muted)', marginBottom: '8px' }} />
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>No recent activity</div>
        <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
          Your completed assignments and course updates will appear here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {enrichedAssignments.map((assignment) => (
        <div
          key={assignment._id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
            backgroundColor: 'rgba(34, 197, 94, 0.1)' // Green tint for completed items
          }}
          onClick={() => onAssignmentClick?.(assignment._id)}
        >
          <div style={{ color: 'var(--color-success, #22c55e)', marginTop: '2px' }}>
            <BookOpen size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: '500', 
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {assignment.title}
              {assignment.grade && (
                <span style={{ 
                  color: 'var(--color-success, #22c55e)', 
                  fontWeight: '600',
                  marginLeft: '8px'
                }}>
                  {assignment.grade}%
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <BookOpen size={12} />
                <span style={{ fontWeight: '500' }}>{assignment.course.code}</span>
                <span>•</span>
                <span>{assignment.course.title}</span>
              </div>
              <div style={{ fontWeight: '500', color: 'var(--color-success, #22c55e)' }}>
                {formatCompletedTime(assignment.dueAt)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Assignment List Component - displays all assignments organized by status
function AllAssignmentsList({ onCreateAssignment, onAssignmentClick }: { onCreateAssignment: () => void; onAssignmentClick?: (id: string) => void }) {
  const allAssignments = useQuery(api.assignments.list);
  const courses = useQuery(api.courses.list);
  const { open: openAssignmentModal } = useAssignmentModalContext();

  // Create a map of course IDs to course info for quick lookup
  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map, course) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  // Organize all assignments in a single list with completed and overdue at bottom
  const sortedAssignments = React.useMemo(() => {
    if (!allAssignments) return [];
    
    const now = Date.now();
    
    const enrichedAssignments = allAssignments
      .map(assignment => ({
        ...assignment,
        course: courseMap[assignment.courseId]
      }))
      .filter(assignment => assignment.course); // Only include assignments with valid courses

    // Sort assignments with priority order:
    // 1. Active (todo) assignments that are not overdue - sorted by due date (soonest first)
    // 2. Overdue assignments - sorted by due date (oldest overdue first)
    // 3. Completed assignments - sorted by due date (most recent first)
    return enrichedAssignments.sort((a, b) => {
      const aIsCompleted = a.status === 'done';
      const bIsCompleted = b.status === 'done';
      const aIsOverdue = a.status === 'todo' && a.dueAt < now;
      const bIsOverdue = b.status === 'todo' && b.dueAt < now;
      
      // If one is completed and the other isn't, completed goes to bottom
      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;
      
      // If one is overdue and the other is active (not overdue, not completed), overdue goes to bottom
      if (aIsOverdue && !bIsOverdue && !bIsCompleted) return 1;
      if (!aIsOverdue && bIsOverdue && !aIsCompleted) return -1;
      
      // Within the same category, sort by due date
      if (aIsCompleted && bIsCompleted) {
        return b.dueAt - a.dueAt; // Most recent completed first
      } else if (aIsOverdue && bIsOverdue) {
        return a.dueAt - b.dueAt; // Oldest overdue first
      } else {
        return a.dueAt - b.dueAt; // Soonest due first for active assignments
      }
    });
  }, [allAssignments, courseMap]);

  const formatDueTime = (dueAt: number, isOverdue: boolean = false): string => {
    const dueDate = new Date(dueAt);
    const now = new Date();
    
    if (isOverdue) {
      const diffTime = now.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Overdue today`;
      } else if (diffDays === 1) {
        return `Overdue 1 day`;
      } else {
        return `Overdue ${diffDays} days`;
      }
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const assignmentDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    // Check if it's today, tomorrow, or another day
    if (assignmentDate.getTime() === today.getTime()) {
      return `Today, ${dueDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else if (assignmentDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${dueDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else {
      return dueDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const renderAssignmentItem = (assignment: any) => {
    const now = Date.now();
    const isOverdue = assignment.status === 'todo' && assignment.dueAt < now;
    const isCompleted = assignment.status === 'done';
    
    return (
      <div
        key={assignment._id}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid var(--color-border)',
          cursor: 'pointer',
          backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 
                          isCompleted ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
          transition: 'background-color 0.2s ease',
        }}
        onClick={() => onAssignmentClick?.(assignment._id)}
      >
        <div style={{ 
          color: isOverdue ? 'var(--color-danger, #ef4444)' : 
                 isCompleted ? 'var(--color-success, #22c55e)' : 'var(--color-muted)', 
          marginTop: '2px' 
        }}>
          <BookOpen size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '6px',
            fontSize: '15px',
            color: isCompleted ? 'var(--color-muted)' : 'var(--color-fg)',
            textDecoration: isCompleted ? 'line-through' : 'none'
          }}>
            {assignment.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <BookOpen size={12} />
              <span style={{ fontWeight: '500' }}>{assignment.course.code}</span>
              <span>•</span>
              <span>{assignment.course.title}</span>
            </div>
            <div style={{ 
              fontWeight: '500',
              color: isOverdue ? 'var(--color-danger, #ef4444)' : 
                     isCompleted ? 'var(--color-success, #22c55e)' : 'var(--color-fg)'
            }}>
              {formatDueTime(assignment.dueAt, isOverdue)}
            </div>
          </div>
          {assignment.notes && (
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--color-muted)', 
              fontStyle: 'italic',
              marginTop: '4px'
            }}>
              {assignment.notes}
            </div>
          )}
          {isCompleted && assignment.grade && (
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--color-success, #22c55e)', 
              fontWeight: '500',
              marginTop: '4px'
            }}>
              Grade: {assignment.grade}%
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!allAssignments || !courses) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <BookOpen size={32} style={{ color: 'var(--color-muted)', marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
          Loading assignments...
        </div>
      </div>
    );
  }

  if (sortedAssignments.length === 0) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center' }}>
        <BookOpen size={48} style={{ color: 'var(--color-muted)', marginBottom: '16px' }} />
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          No assignments yet
        </div>
        <div style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>
          Start by creating your first assignment to track your coursework progress.
        </div>
        <button
          onClick={onCreateAssignment}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Create Assignment
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {sortedAssignments.map(assignment => renderAssignmentItem(assignment))}
    </div>
  );
}

export default function AssignmentsPage() {
  const { open: openAssignmentModal } = useAssignmentModalContext();
  const { open: openCommandPalette } = useCommandPaletteContext();
  const { open: openAssignmentDetails } = useAssignmentDetailsModalContext();
  const searchParams = useSearchParams();

  // Handle URL parameters for modal opening (like NotionCalendar does for events)
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

  // Handle assignment modal opening with URL routing (like NotionCalendar's handleEventSelect)
  const handleAssignmentOpen = () => {
    // Update URL without page reload using browser history API
    const newUrl = `${window.location.pathname}?assignment=add`;
    window.history.pushState({ assignment: 'add' }, '', newUrl);
    
    // Open the modal
    openAssignmentModal();
  };


  const gridComponents: GridComponent[] = [
    {
      id: 'due-soon',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Due Soon</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <DueSoon maxItems={20} onAssignmentClick={openAssignmentDetails} />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 6, h: 2 },
      minSize: { w: 4, h: 2 },
      maxSize: { w: 6, h: 3 }
    },
    {
      id: 'overdue',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <Overdue maxItems={10} onAssignmentClick={openAssignmentDetails} />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 },
      minSize: { w: 2, h: 1 },
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
            <RecentActivity maxItems={8} onAssignmentClick={openAssignmentDetails} />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 },
      minSize: { w: 2, h: 1 },
      maxSize: { w: 4, h: 3 }
    },
    {
      id: 'all-assignments',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <AllAssignmentsList onCreateAssignment={handleAssignmentOpen} onAssignmentClick={openAssignmentDetails} />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 6, h: 2 },
      minSize: { w: 4, h: 1 },
      maxSize: { w: 6, h: 4 }
    }
  ];

  const actionButton = (
    <Button onClick={handleAssignmentOpen}>
      <AddIcon />
      New Assignment
    </Button>
  );

  return (
    <>
      <DynamicHead 
        titleSuffix="Assignments"
        description="Manage your academic assignments, track due dates, and stay organized"
        keywords={['assignments', 'homework', 'due dates', 'academic', 'student']}
      />
      <CustomizableGrid
        pageId="assignments"
        pageTitle="Assignments"
        components={gridComponents}
        actionButton={actionButton}
      />
    </>
  );
}
