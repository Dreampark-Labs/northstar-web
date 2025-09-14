"use client";

import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserSettings } from '@/hooks/useUserSettings';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { formatDate } from '@/lib/utils';
import styles from './DueSoon.module.css';

interface DueSoonProps {
  maxItems?: number;
  className?: string;
  onAssignmentClick?: (assignmentId: Id<"assignments">) => void;
}

export function DueSoon({
  maxItems = 5,
  className,
  onAssignmentClick
}: DueSoonProps) {
  // Get user settings for due soon days preference
  const { dueSoonDays } = useUserSettings();
  
  // Fetch assignments due in the configured number of days
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
    
    console.log('DueSoon - raw assignments:', assignments);
    console.log('DueSoon - courseMap:', courseMap);
    
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
          <Clock size={20} />
          <span>Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (enrichedAssignments.length === 0) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <EmptyState
          icon={<Clock size={24} />}
          title="All caught up!"
          description={`No assignments due in the next ${dueSoonDays} day${dueSoonDays !== 1 ? 's' : ''}.`}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.scrollContainer}>
        {enrichedAssignments.map((assignment) => (
          <div
            key={assignment._id}
            className={`${styles.assignmentItem} ${getUrgencyClass(assignment.dueAt)} ${onAssignmentClick ? styles.clickable : ''}`}
            onClick={() => {
              console.log('DueSoon - assignment clicked:', assignment._id, assignment.title);
              onAssignmentClick?.(assignment._id);
            }}
          >
            <div className={styles.assignmentIcon}>
              <Clock size={16} />
            </div>
            <div className={styles.assignmentContent}>
              <div className={styles.assignmentTitle} title={assignment.title}>
                {assignment.title}
              </div>
              <div className={styles.assignmentMeta}>
                <div className={styles.courseInfo}>
                  <BookOpen size={12} />
                  <span className={styles.courseCode}>
                    {assignment.course.code}
                  </span>
                  <span className={styles.courseName}>
                    {assignment.course.title}
                  </span>
                </div>
                <div className={styles.dueTime}>
                  {formatDueTime(assignment.dueAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DueSoon;
