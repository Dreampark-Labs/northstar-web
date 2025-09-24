"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { AddIcon } from '@sanity/icons';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen } from 'lucide-react';
import { useAssignmentModalContext } from '@/providers/AssignmentModalProvider';

export function SimpleAssignments() {
  const params = useParams();
  const termSlug = params?.termSlug as string;
  const { open } = useAssignmentModalContext();
  
  // Fetch data from authenticated user
  const assignments = useQuery(api.assignments.list);
  const courses = useQuery(api.courses.list);

  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map: any, course: any) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  const handleCreateAssignment = () => {
    open();
  };

  const handleAssignmentClick = (id: string) => {
    // For now, just log - we'll implement modal later
    console.log('Assignment clicked:', id);
  };

  if (!assignments) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div>Loading assignments...</div>
        </div>
      </div>
    );
  }

  return (
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
        <Button onClick={handleCreateAssignment}>
          <AddIcon />
          New Assignment
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div style={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <EmptyState
            icon={<BookOpen />}
            title="No assignments yet"
            description="Create your first assignment to get started."
            action={
              <Button onClick={handleCreateAssignment}>
                <AddIcon />
                Create Assignment
              </Button>
            }
          />
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <Card style={{ height: '100%' }}>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div style={{ height: '100%', overflow: 'auto' }}>
                {assignments.map((assignment: any) => {
                  const course = courseMap[assignment.courseId];
                  return (
                    <div
                      key={assignment._id}
                      onClick={() => handleAssignmentClick(assignment._id)}
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
