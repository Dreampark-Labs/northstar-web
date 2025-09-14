"use client";

import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { NotionCalendar, type Term, type Course } from '@/components/ui/NotionCalendar';
import { type CalendarEvent } from '@/components/ui/Calendar';
import { getCourseColor, generateRecurringEvents } from '@/lib/calendar';
import { type ScheduleModalProps } from './ScheduleModal.types';
import styles from './ScheduleModal.module.css';

export function ScheduleModal({ isOpen, onClose, className }: ScheduleModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal when clicking backdrop
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Fetch real data from Convex using authenticated user - only when modal is open
  const dbTerms = useQuery(api.terms.list, isOpen ? undefined : "skip") || [];
  const dbCourses = useQuery(api.courses.list, isOpen ? undefined : "skip") || [];

  // Convert database data to the format expected by NotionCalendar
  const displayTerms: Term[] = useMemo(() => {
    if (!isOpen || dbTerms.length === 0) {
      return [];
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
  }, [isOpen, dbTerms, dbCourses]);

  // Generate class events from course schedules (same logic as CalendarClient)
  const classEvents: CalendarEvent[] = useMemo(() => {
    if (!isOpen) {
      return [];
    }
    
    const events: CalendarEvent[] = [];
    
    dbCourses.forEach(course => {
      // Find the term for this course
      const term = dbTerms.find(t => t._id === course.termId);
      if (!term) {
        return;
      }

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
  }, [isOpen, dbCourses, dbTerms]);

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Schedule modal - Event clicked:', event);
    // TODO: Open event details modal or handle event interaction
  };

  const handleAddEvent = (date: Date, hour?: number) => {
    console.log('Schedule modal - Add event:', { date, hour });
    // This is handled directly by the NotionCalendar component
  };

  const handleDateChange = (date: Date) => {
    console.log('Schedule modal - Date changed to:', date);
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Show loading state while data is being fetched
  const isLoading = isOpen && (dbTerms === undefined || dbCourses === undefined);

  const modalContent = (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={`${styles.modalContent} ${className || ''}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Calendar size={20} />
            Class Schedule
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close schedule modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {isLoading ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-muted)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Calendar size={32} style={{ marginBottom: '16px' }} />
                <div>Loading schedule...</div>
              </div>
            </div>
          ) : (
            <div className={styles.calendarContainer}>
              <NotionCalendar
                events={classEvents}
                terms={displayTerms}
                selectedDate={new Date()}
                onDateChange={handleDateChange}
                onEventClick={handleEventClick}
                onAddEvent={handleAddEvent}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal using portal to document.body
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default ScheduleModal;
