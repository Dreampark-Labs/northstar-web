"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { CustomizableGrid, type GridComponent } from '@/components/layout/CustomizableGrid';
import { DynamicHead } from '@/components/ui/DynamicHead';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTermSelector } from "@/providers/TermSelectorProvider";
import { useCourseModalContext } from "@/providers/CourseModalProvider";
import { useScheduleModal } from "@/providers/ScheduleModalProvider";
import { BookOpen, Plus, Clock, Users, GraduationCap, Calendar } from 'lucide-react';

// Course List Component - displays all courses for selected term filter
function CoursesList() {
  const router = useRouter();
  const { selectedTermFilter } = useTermSelector();
  const courses = useQuery(api.courses.listByTermFilter, { termFilter: selectedTermFilter });

  if (!courses) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <BookOpen size={32} style={{ color: 'var(--color-muted)', marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
          Loading courses...
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={48} />}
        title="No courses yet"
        description="Start by adding courses to track your academic progress"
        action={
          <Button onClick={() => {
            const newUrl = `${window.location.pathname}?course=add`;
            window.history.pushState({ course: 'add' }, '', newUrl);
          }}>
            <Plus size={16} />
            Add Course
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: '16px 0' }}>
        {courses.map((course) => (
          <div
            key={course._id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '20px',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onClick={() => {
              // Navigate to course detail page using the URL format: /app/v1/courses/[termId]/[courseId]
              router.push(`/app/v1/courses/${course.termId}/${course._id}`);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ 
              color: 'var(--color-accent)', 
              marginTop: '2px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: '600', 
                marginBottom: '6px',
                fontSize: '16px',
                color: 'var(--color-fg)'
              }}>
                {course.title}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--color-accent)', 
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                {course.code}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                {course.creditHours && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <GraduationCap size={12} />
                    <span>{course.creditHours} credits</span>
                  </div>
                )}
                {course.instructor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} />
                    <span>{course.instructor}</span>
                  </div>
                )}
                {course.meetingDays && course.meetingStart && course.meetingEnd && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{course.meetingDays.join(', ')} {course.meetingStart}-{course.meetingEnd}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Current Term Overview Component
function CurrentTermOverview() {
  const { selectedTermFilter } = useTermSelector();
  const courses = useQuery(api.courses.listByTermFilter, { termFilter: selectedTermFilter });
  const courseStats = useQuery(api.courses.getCourseStats);
  const dashboardStats = useQuery(api.analytics.getDashboardStats);

  // Calculate display stats based on selected term filter and available data
  const displayStats = React.useMemo(() => {
    if (!courses || !courseStats) return null;
    
    const currentTermCredits = courses.reduce((sum, course) => sum + (course.creditHours || 0), 0);
    const coursesWithInstructor = courses.filter(course => course.instructor).length;
    
    // Get the right course count based on filter
    let courseCount = courses.length;
    let creditCount = currentTermCredits;
    
    if (selectedTermFilter === "all") {
      courseCount = courseStats.courses.total;
      creditCount = courseStats.credits.total;
    } else if (selectedTermFilter === "current") {
      courseCount = courseStats.courses.current;
      creditCount = courseStats.credits.currentTerm;
    } else if (selectedTermFilter === "past") {
      courseCount = courseStats.courses.past;
      creditCount = courses.reduce((sum, course) => sum + (course.creditHours || 0), 0);
    } else if (selectedTermFilter === "future") {
      courseCount = courseStats.courses.future;
      creditCount = courses.reduce((sum, course) => sum + (course.creditHours || 0), 0);
    }
    
    return {
      courseCount,
      creditCount,
      coursesWithInstructor,
      totalCoursesAllTime: courseStats.courses.total,
      totalCreditsAllTime: courseStats.credits.total,
      currentTermName: courseStats.terms.currentTerm?.name,
      userGPA: courseStats.user.currentGPA || courseStats.user.institutionGPA,
      totalCreditsEarned: courseStats.user.totalCreditsEarned,
      // Assignment stats from dashboard if available
      totalAssignments: dashboardStats?.totals.assignments || 0,
      completedAssignments: dashboardStats?.assignments.completed || 0,
      averageGrade: dashboardStats?.assignments.averageGrade
    };
  }, [courses, courseStats, dashboardStats, selectedTermFilter]);

  if (!courses || !courseStats) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Calendar size={20} style={{ color: 'var(--color-muted)', marginBottom: '8px' }} />
        <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
          Loading overview...
        </div>
      </div>
    );
  }

  if (!displayStats) return null;

  const termDisplayText = selectedTermFilter === "current" ? 
                           (displayStats.currentTermName ? `Current Term (${displayStats.currentTermName})` : "Current Term") :
                         selectedTermFilter === "all" ? "All Terms" :
                         selectedTermFilter === "past" ? "Past Terms" :
                         selectedTermFilter === "future" ? "Future Terms" : "Selected Term";

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '16px',
          marginBottom: '4px',
          color: 'var(--color-fg)'
        }}>
          Course Overview
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--color-muted)',
          marginBottom: '16px'
        }}>
          {termDisplayText} • Academic progress
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: 'var(--color-accent)',
            marginBottom: '4px'
          }}>
            {displayStats.courseCount}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-muted)',
            fontWeight: '500'
          }}>
            Courses
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: 'var(--color-accent)',
            marginBottom: '4px'
          }}>
            {displayStats.creditCount}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-muted)',
            fontWeight: '500'
          }}>
            Credits
          </div>
        </div>
      </div>

      {/* Term Progress when viewing current term */}
      {selectedTermFilter === "current" && displayStats.totalAssignments > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '500',
            color: 'var(--color-fg)',
            marginBottom: '8px'
          }}>
            Term Progress
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${Math.round((displayStats.completedAssignments / displayStats.totalAssignments) * 100)}%`,
                height: '100%',
                backgroundColor: 'var(--color-accent)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* GPA and credits info when available */}
      {(displayStats.userGPA || displayStats.totalCreditsEarned) && (
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--color-bg)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          marginBottom: '12px'
        }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '500',
            color: 'var(--color-fg)',
            marginBottom: '8px'
          }}>
            Academic Standing
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--color-muted)'
          }}>
            {displayStats.userGPA && (
              <span>GPA: {displayStats.userGPA.toFixed(2)}</span>
            )}
            {displayStats.totalCreditsEarned && (
              <span>{displayStats.totalCreditsEarned} credits earned</span>
            )}
          </div>
        </div>
      )}

      {/* Summary stats for "all" view */}
      {selectedTermFilter === "all" && (
        <div style={{
          padding: '8px 0',
          borderTop: '1px solid var(--color-border)',
          fontSize: '12px',
          color: 'var(--color-muted)',
          textAlign: 'center'
        }}>
          {displayStats.totalCreditsAllTime} total credits across all terms
        </div>
      )}
    </div>
  );
}

// Quick Actions Component
function QuickActions({ onAddCourse, onViewSchedule }: { onAddCourse: () => void; onViewSchedule: () => void }) {
  const actions = [
    {
      icon: <Plus size={16} />,
      label: 'Add Course',
      description: 'Add a new course to your current term',
      onClick: onAddCourse
    },
    {
      icon: <Calendar size={16} />,
      label: 'Manage Terms',
      description: 'Create or edit academic terms',
      onClick: () => console.log('Manage terms')
    },
    {
      icon: <BookOpen size={16} />,
      label: 'View Schedule',
      description: 'See your class schedule',
      onClick: onViewSchedule
    }
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ 
            color: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {action.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: '500', 
              fontSize: '14px',
              marginBottom: '2px',
              color: 'var(--color-fg)'
            }}>
              {action.label}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--color-muted)'
            }}>
              {action.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function CoursesClient() {
  const { open: openCourseModal } = useCourseModalContext();
  const { open: openScheduleModal } = useScheduleModal();

  // Handle course modal opening with URL routing
  const handleCourseOpen = () => {
    // Update URL without page reload using browser history API
    const newUrl = `${window.location.pathname}?course=add`;
    window.history.pushState({ course: 'add' }, '', newUrl);
    
    // Open the modal - this will be handled by the provider's useEffect
    // but we can also call it directly for immediate response
    openCourseModal();
  };

  // Handle schedule modal opening
  const handleScheduleOpen = () => {
    openScheduleModal();
  };

  const gridComponents: GridComponent[] = [
    {
      id: 'course-overview',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <CurrentTermOverview />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 },
      minSize: { w: 2, h: 1 },
      maxSize: { w: 3, h: 2 }
    },
    {
      id: 'quick-actions',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <QuickActions onAddCourse={handleCourseOpen} onViewSchedule={handleScheduleOpen} />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 },
      minSize: { w: 2, h: 1 },
      maxSize: { w: 3, h: 2 }
    },
    {
      id: 'all-courses',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, height: 'calc(100% - 60px)' }}>
            <CoursesList />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 6, h: 2 },
      minSize: { w: 4, h: 1 },
      maxSize: { w: 6, h: 4 }
    }
  ];

  const actionButton = (
    <Button onClick={handleCourseOpen}>
      <Plus size={16} />
      New Course
    </Button>
  );

  return (
    <>
      <DynamicHead 
        titleSuffix="Courses"
        description="Manage your academic courses, track schedules, and organize your studies"
        keywords={['courses', 'classes', 'schedule', 'academic', 'student']}
      />
      <CustomizableGrid
        pageId="courses"
        pageTitle="Courses"
        components={gridComponents}
        actionButton={actionButton}
      />
    </>
  );
}
