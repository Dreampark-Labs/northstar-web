"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  X, 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  User,
  Check
} from 'lucide-react';
import styles from './AddEventModal.module.css';

export type EventType = 'meeting' | 'class' | 'assignment' | 'exam' | 'office-hours' | 'personal' | 'study';

interface EventFormData {
  title: string;
  type: EventType;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
  location: string;
  description: string;
  courseCode: string;
  meetingUrl: string;
  meetingType: 'google-meet' | 'zoom' | 'teams' | 'other' | '';
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialHour?: number;
}

export function AddEventModal({ isOpen, onClose, initialDate, initialHour }: AddEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    type: 'personal',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    isAllDay: false,
    location: '',
    description: '',
    courseCode: '',
    meetingUrl: '',
    meetingType: ''
  });
  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's courses for course selection
  const courses = useQuery(api.courses.list) || [];
  
  // Create event mutation
  const createEvent = useMutation(api.events.create);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const startDate = initialDate || new Date();
      const endDate = new Date(startDate);
      
      // Set initial time based on initialHour if provided
      let startTime = '09:00';
      let endTime = '10:00';
      
      if (initialHour !== undefined) {
        startTime = `${initialHour.toString().padStart(2, '0')}:00`;
        endTime = `${(initialHour + 1).toString().padStart(2, '0')}:00`;
      }
      
      setFormData({
        title: '',
        type: 'personal',
        startDate: startDate.toISOString().split('T')[0],
        startTime,
        endDate: endDate.toISOString().split('T')[0],
        endTime,
        isAllDay: false,
        location: '',
        description: '',
        courseCode: '',
        meetingUrl: '',
        meetingType: ''
      });
      setErrors({});
      setIsSubmitting(false);
      setStep('form');
      
      // Focus the title input after a short delay
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, initialDate, initialHour]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Enter':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleSubmit(e as any);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.isAllDay && !formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    // Validate end date/time if provided
    if (formData.endDate && formData.startDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime || '23:59'}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.endDate = 'End date/time must be after start date/time';
      }
    }

    // Validate meeting URL format if provided
    if (formData.meetingUrl && !isValidUrl(formData.meetingUrl)) {
      newErrors.meetingUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into timestamps
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
      const endDateTime = formData.endDate 
        ? new Date(`${formData.endDate}T${formData.endTime || '23:59'}`)
        : undefined;

      // Find course ID if course code is provided
      let courseId: Id<"courses"> | undefined;
      if (formData.courseCode) {
        const course = courses.find(c => c.code === formData.courseCode);
        courseId = course?._id as Id<"courses">;
      }

      await createEvent({
        title: formData.title.trim(),
        type: formData.type,
        startTime: startDateTime.getTime(),
        endTime: endDateTime?.getTime(),
        isAllDay: formData.isAllDay,
        color: getEventTypeColor(formData.type),
        location: formData.location.trim() || undefined,
        description: formData.description.trim() || undefined,
        courseCode: formData.courseCode.trim() || undefined,
        courseId,
        meetingUrl: formData.meetingUrl.trim() || undefined,
        meetingType: formData.meetingType || undefined,
        attendees: undefined,
      });

      setStep('success');
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to create event:', error);
      setErrors({ title: 'Failed to create event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventTypeColor = (type: EventType): string => {
    switch (type) {
      case 'meeting':
        return '#3b82f6';
      case 'class':
        return '#10b981';
      case 'assignment':
        return '#f59e0b';
      case 'exam':
        return '#ef4444';
      case 'office-hours':
        return '#8b5cf6';
      case 'study':
        return '#06b6d4';
      case 'personal':
      default:
        return '#6b7280';
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-adjust end date when start date changes
      if (field === 'startDate' && !newData.endDate) {
        newData.endDate = value as string;
      }
      
      // Auto-adjust end time when start time changes
      if (field === 'startTime' && !newData.endTime) {
        const startHour = parseInt((value as string).split(':')[0]);
        const endHour = Math.min(startHour + 1, 23);
        newData.endTime = `${endHour.toString().padStart(2, '0')}:00`;
      }
      
      // Clear course code when type is not course-related
      if (field === 'type' && !['class', 'assignment', 'exam', 'office-hours'].includes(value as string)) {
        newData.courseCode = '';
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  if (step === 'success') {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <Check size={32} />
            </div>
            <h2 className={styles.successTitle}>Event Created!</h2>
            <p className={styles.successMessage}>
              "{formData.title}" has been added to your calendar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'meeting':
        return <User size={16} />;
      case 'class':
        return <Calendar size={16} />;
      case 'assignment':
        return <FileText size={16} />;
      case 'exam':
        return <FileText size={16} />;
      case 'office-hours':
        return <User size={16} />;
      case 'study':
        return <FileText size={16} />;
      case 'personal':
      default:
        return <Calendar size={16} />;
    }
  };

  const courseRelatedTypes = ['class', 'assignment', 'exam', 'office-hours'];
  const showCourseField = courseRelatedTypes.includes(formData.type);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Plus size={20} />
          </div>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Add New Event</h2>
            <p className={styles.subtitle}>Create a new event for your calendar</p>
          </div>
          <div className={styles.headerActions}>
            <button 
              onClick={onClose}
              className={styles.closeButton}
              title="Close (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            {/* Title Field */}
            <div className={styles.field}>
              <label className={styles.label}>
                <Calendar size={16} />
                Event Title
              </label>
              <input
                ref={titleInputRef}
                type="text"
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
                required
              />
              {errors.title && (
                <div className={styles.error}>
                  {errors.title}
                </div>
              )}
              <div className={styles.charCount}>
                {formData.title.length}/100
              </div>
            </div>

            {/* Event Type */}
            <div className={styles.field}>
              <label className={styles.label}>
                {getEventTypeIcon(formData.type)}
                Event Type
              </label>
              <select
                className={styles.select}
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="personal">Personal</option>
                <option value="meeting">Meeting</option>
                <option value="class">Class</option>
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="office-hours">Office Hours</option>
                <option value="study">Study Session</option>
              </select>
            </div>

            {/* Course Selection (only for course-related events) */}
            {showCourseField && (
              <div className={styles.field}>
                <label className={styles.label}>
                  Course
                </label>
                <select
                  className={styles.select}
                  value={formData.courseCode}
                  onChange={(e) => handleInputChange('courseCode', e.target.value)}
                >
                  <option value="">Select a course (optional)</option>
                  {courses.map(course => (
                    <option key={course._id} value={course.code}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* All Day Toggle */}
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isAllDay}
                  onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>All day event</span>
              </label>
            </div>

            {/* Date and Time Fields */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar size={16} />
                  Start Date
                </label>
                <input
                  type="date"
                  className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
                {errors.startDate && (
                  <div className={styles.error}>
                    {errors.startDate}
                  </div>
                )}
              </div>
              {!formData.isAllDay && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    Start Time
                  </label>
                  <input
                    type="time"
                    className={`${styles.input} ${errors.startTime ? styles.inputError : ''}`}
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                  {errors.startTime && (
                    <div className={styles.error}>
                      {errors.startTime}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  className={`${styles.input} ${errors.endDate ? styles.inputError : ''}`}
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
                {errors.endDate && (
                  <div className={styles.error}>
                    {errors.endDate}
                  </div>
                )}
              </div>
              {!formData.isAllDay && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    End Time
                  </label>
                  <input
                    type="time"
                    className={styles.input}
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div className={styles.field}>
              <label className={styles.label}>
                <MapPin size={16} />
                Location (Optional)
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            {/* Meeting URL */}
            <div className={styles.field}>
              <label className={styles.label}>
                <Video size={16} />
                Meeting URL (Optional)
              </label>
              <input
                type="url"
                className={`${styles.input} ${errors.meetingUrl ? styles.inputError : ''}`}
                placeholder="https://meet.google.com/..."
                value={formData.meetingUrl}
                onChange={(e) => handleInputChange('meetingUrl', e.target.value)}
              />
              {errors.meetingUrl && (
                <div className={styles.error}>
                  {errors.meetingUrl}
                </div>
              )}
            </div>

            {/* Meeting Type (only if meeting URL is provided) */}
            {formData.meetingUrl && (
              <div className={styles.field}>
                <label className={styles.label}>
                  Meeting Platform
                </label>
                <select
                  className={styles.select}
                  value={formData.meetingType}
                  onChange={(e) => handleInputChange('meetingType', e.target.value)}
                >
                  <option value="">Select platform</option>
                  <option value="google-meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label}>
                Description (Optional)
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Add event description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className={styles.charCount}>
                {formData.description.length}/500
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.shortcuts}>
              <span>
                <kbd>⌘</kbd><kbd>↵</kbd> to create
              </span>
              <span>
                <kbd>ESC</kbd> to cancel
              </span>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.createButton}
                disabled={isSubmitting || !formData.title.trim() || !formData.startDate}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

