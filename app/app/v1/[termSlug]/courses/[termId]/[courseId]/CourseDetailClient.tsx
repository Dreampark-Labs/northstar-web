"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { DynamicHead } from '@/components/ui/DynamicHead';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  Users, 
  GraduationCap, 
  Calendar,
  MapPin,
  FileText,
  CheckSquare,
  BarChart3
} from 'lucide-react';

interface CourseDetailClientProps {
  termId: string;
  courseId: string;
}

export function CourseDetailClient({ termId, courseId }: CourseDetailClientProps) {
  const router = useRouter();
  
  // Fetch course details
  const course = useQuery(api.courseDetails.getCourse, { 
    courseId: courseId as Id<"courses"> 
  });
  
  // Fetch term details
  const term = useQuery(api.courseDetails.getTerm, { 
    termId: termId as Id<"terms"> 
  });

  // Fetch assignments for this course
  const assignments = useQuery(api.courseDetails.getAssignmentsByCourse, { 
    courseId: courseId as Id<"courses"> 
  });

  // Loading state
  if (!course || !term) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <BookOpen size={32} style={{ color: 'var(--color-muted)', marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
          Loading course details...
        </div>
      </div>
    );
  }

  // Error state - course not found or doesn't belong to the term
  if (!course || course.termId !== (termId as Id<"terms">)) {
    return (
      <EmptyState
        icon={<BookOpen size={48} />}
        title="Course not found"
        description="The course you're looking for doesn't exist or may have been removed"
        action={
          <Button onClick={() => router.push('/app/v1/courses')}>
            <ArrowLeft size={16} />
            Back to Courses
          </Button>
        }
      />
    );
  }

  const handleBackToCourses = () => {
    router.push('/app/v1/courses');
  };

  // Calculate assignment stats
  const assignmentStats = React.useMemo(() => {
    if (!assignments) return { total: 0, completed: 0, pending: 0, overdue: 0 };
    
    const now = Date.now();
    let completed = 0;
    let overdue = 0;
    
    assignments.forEach((assignment: any) => {
      if (assignment.status === 'done') {
        completed++;
      } else if (assignment.dueAt && assignment.dueAt < now) {
        overdue++;
      }
    });
    
    return {
      total: assignments.length,
      completed,
      pending: assignments.length - completed - overdue,
      overdue
    };
  }, [assignments]);

  return (
    <>
      <DynamicHead 
        titleSuffix={`${course.code} - ${course.title}`}
        description={`Course details for ${course.title} (${course.code})`}
        keywords={['course', 'assignments', 'academic', 'student', course.code.toLowerCase()]}
      />
      
      <div style={{ 
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button 
            onClick={handleBackToCourses}
            variant="ghost"
            style={{ marginBottom: '16px' }}
          >
            <ArrowLeft size={16} />
            Back to Courses
          </Button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ 
              color: 'var(--color-accent)', 
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                margin: '0 0 4px 0',
                color: 'var(--color-fg)'
              }}>
                {course.title}
              </h1>
              <div style={{ 
                fontSize: '16px', 
                color: 'var(--color-accent)', 
                fontWeight: '600'
              }}>
                {course.code}
              </div>
            </div>
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Calendar size={14} />
            <span>{term.name} ({term.startDate} - {term.endDate})</span>
          </div>
        </div>

        {/* Course Info Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Course Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {course.creditHours && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GraduationCap size={16} style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Credit Hours</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                        {course.creditHours} credits
                      </div>
                    </div>
                  </div>
                )}
                
                {course.instructor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={16} style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Instructor</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                        {course.instructor}
                      </div>
                    </div>
                  </div>
                )}
                
                {course.meetingDays && course.meetingStart && course.meetingEnd && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Clock size={16} style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Schedule</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                        {course.meetingDays.join(', ')} {course.meetingStart}-{course.meetingEnd}
                      </div>
                    </div>
                  </div>
                )}
                
                {(course.building || course.room) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={16} style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Location</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                        {[course.building, course.room].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '16px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: 'var(--color-accent)',
                        marginBottom: '4px'
                      }}>
                        {assignmentStats.total}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--color-muted)',
                        fontWeight: '500'
                      }}>
                        Total
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: 'var(--color-success, #10b981)',
                        marginBottom: '4px'
                      }}>
                        {assignmentStats.completed}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--color-muted)',
                        fontWeight: '500'
                      }}>
                        Completed
                      </div>
                    </div>
                  </div>
                  
                  {assignmentStats.overdue > 0 && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: 'var(--color-error, #ef4444)',
                        marginBottom: '2px'
                      }}>
                        {assignmentStats.overdue} Overdue
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--color-muted)'
                      }}>
                        Need immediate attention
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <CheckSquare size={24} style={{ color: 'var(--color-muted)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                    No assignments yet
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Assignments */}
        {assignments && assignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {assignments.slice(0, 10).map((assignment: any) => (
                  <div
                    key={assignment._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ 
                      color: assignment.status === 'done' ? 'var(--color-success, #10b981)' : 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {assignment.status === 'done' ? 
                        <CheckSquare size={16} /> : 
                        <FileText size={16} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '500', 
                        marginBottom: '4px',
                        fontSize: '14px',
                        color: 'var(--color-fg)'
                      }}>
                        {assignment.title}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--color-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {assignment.dueAt && (
                          <span>Due: {new Date(assignment.dueAt).toLocaleDateString()}</span>
                        )}
                        <span>•</span>
                        <span style={{ 
                          color: assignment.status === 'done' ? 'var(--color-success, #10b981)' : 
                                assignment.dueAt && assignment.dueAt < Date.now() ? 'var(--color-error, #ef4444)' : 
                                'var(--color-muted)'
                        }}>
                          {assignment.status === 'done' ? 'Completed' : 
                           assignment.dueAt && assignment.dueAt < Date.now() ? 'Overdue' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
