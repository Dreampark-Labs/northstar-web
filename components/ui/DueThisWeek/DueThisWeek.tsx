"use client";

import React from 'react';
import { Calendar, BookOpen } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserSettings } from '@/hooks/useUserSettings';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import styles from './DueThisWeek.module.css';

interface DueThisWeekProps {
  maxItems?: number;
  className?: string;
  onAssignmentClick?: (assignmentId: string) => void;
  weekStartDay?: string;
}

export function DueThisWeek({
  maxItems = 10,
  className,
  onAssignmentClick,
  weekStartDay
}: DueThisWeekProps) {
  // Get user settings including week start preference
  const { weekStartDay: userWeekStartDay } = useUserSettings();
  const effectiveWeekStartDay = weekStartDay || userWeekStartDay;
  
    // Fetch assignments due this week using the existing due soon function
  const assignments = useQuery(api.assignments.getAssignmentsDueSoon);
  const courses = useQuery(api.courses.list);

  // Create a map of course IDs to course info for quick lookup
  const courseMap = React.useMemo(() => {
    if (!courses) return {};
    return courses.reduce((map: any, course: any) => {
      map[course._id] = course;
      return map;
    }, {} as Record<string, any>);
  }, [courses]);

  // Combine assignment data with course information
  const enrichedAssignments = React.useMemo(() => {
    if (!assignments) return [];
    
    return assignments
      .map((assignment: any) => ({
        ...assignment,
        course: courseMap[assignment.courseId]
      }))
      .filter((assignment: any) => assignment.course) // Only include assignments with valid courses
      .slice(0, maxItems);
  }, [assignments, courseMap, maxItems]);

  // Group assignments by day of the week
  const assignmentsByDay = React.useMemo(() => {
    if (!enrichedAssignments.length) return [];

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    
    // Calculate week start based on user preference
    const weekStartMap = {
      "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
      "Thursday": 4, "Friday": 5, "Saturday": 6
    };
    const startDayOffset = weekStartMap[effectiveWeekStartDay as keyof typeof weekStartMap] || 0;
    const currentDayOfWeek = now.getDay();
    const daysToSubtract = (currentDayOfWeek - startDayOffset + 7) % 7;
    weekStart.setDate(now.getDate() - daysToSubtract);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push({
        date: day,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: day.getDate(),
        isToday: day.toDateString() === now.toDateString(),
        assignments: enrichedAssignments.filter((assignment: any) => {
          const assignmentDate = new Date(assignment.dueAt);
          return assignmentDate.toDateString() === day.toDateString();
        })
      });
    }

    return days;
  }, [enrichedAssignments, effectiveWeekStartDay]);

  const formatDueTime = (dueAt: number): string => {
    const dueDate = new Date(dueAt);
    return dueDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUrgencyClass = (dueAt: number): string => {
    const dueDate = new Date(dueAt);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue <= 24) {
      return styles.urgent;
    } else if (hoursUntilDue <= 48) {
      return styles.warning;
    }
    return '';
  };

  if (!assignments) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>
          <Calendar size={20} />
          <span>Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (enrichedAssignments.length === 0) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <EmptyState
          icon={<Calendar size={24} />}
          title="No assignments this week!"
          description="Enjoy your free time or get ahead on future work."
        />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.scrollContainer}>
        <div className={styles.weekGrid}>
          {assignmentsByDay.map((day, index) => (
            <div key={index} className={`${styles.dayColumn} ${day.isToday ? styles.today : ''}`}>
              <div className={styles.dayHeader}>
                <div className={styles.dayName}>{day.dayName}</div>
                <div className={styles.dayNumber}>{day.dayNumber}</div>
              </div>
              <div className={styles.dayAssignments}>
                {day.assignments.length === 0 ? (
                  <div className={styles.noDueText}>No assignments</div>
                ) : (
                  day.assignments.map((assignment: any) => (
                    <div
                      key={assignment._id}
                      className={`${styles.assignmentItem} ${getUrgencyClass(assignment.dueAt)}`}
                      onClick={() => onAssignmentClick?.(assignment._id)}
                    >
                      <div className={styles.assignmentContent}>
                        <div className={styles.assignmentTitle} title={assignment.title}>
                          {assignment.title}
                        </div>
                        <div className={styles.assignmentMeta}>
                          <div className={styles.courseInfo}>
                            <BookOpen size={10} />
                            <span className={styles.courseCode}>
                              {assignment.course.code}
                            </span>
                          </div>
                          <div className={styles.dueTime}>
                            {formatDueTime(assignment.dueAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DueThisWeek;
