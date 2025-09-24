"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  BookOpen, 
  Calendar,
  User,
  Hash,
  AlertCircle,
  Check,
  GraduationCap,
  Clock,
  MapPin
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { courseSchema, type CourseFormData } from '@/lib/validation';
import { useSafePortal, useSafeBodyStyle } from '@/hooks/useSafePortal';
import styles from './CourseModal.module.css';

interface CourseFormUI {
  title: string;
  code: string;
  creditHours: string;
  instructor: string;
  termId: string;
  isOnline: boolean;
  hasOnlineMeetings: boolean;
  meetingDays: string[];
  meetingStart: string;
  meetingEnd: string;
  building: string;
  room: string;
}

interface CourseFormErrors {
  title?: string;
  code?: string;
  creditHours?: string;
  instructor?: string;
  termId?: string;
  isOnline?: string;
  hasOnlineMeetings?: string;
  meetingDays?: string;
  meetingStart?: string;
  meetingEnd?: string;
  building?: string;
  room?: string;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CourseModal({ isOpen, onClose }: CourseModalProps) {
  const { createSafePortal } = useSafePortal();
  
  // Prevent body scroll when modal is open
  useSafeBodyStyle(isOpen, 'overflow', 'hidden', 'unset');
  
  const [formData, setFormData] = useState<CourseFormUI>({
    title: '',
    code: '',
    creditHours: '3',
    instructor: '',
    termId: '',
    isOnline: false,
    hasOnlineMeetings: false,
    meetingDays: [],
    meetingStart: '',
    meetingEnd: '',
    building: '',
    room: ''
  });
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch user's terms
  const terms = useQuery(api.terms.list);
  
  // Create course mutation
  const createCourse = useMutation(api.courses.create);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Auto-select current term if available
      const currentTerm = terms?.find((term: any) => term.status === 'current');
      
      setFormData({
        title: '',
        code: '',
        creditHours: '3',
        instructor: '',
        termId: currentTerm?._id || '',
        isOnline: false,
        hasOnlineMeetings: false,
        meetingDays: [],
        meetingStart: '',
        meetingEnd: '',
        building: '',
        room: ''
      });
      setErrors({});
      setIsSubmitting(false);
      setStep('form');
      // Focus the title input after a short delay to ensure modal is rendered
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, terms]);

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
    const newErrors: CourseFormErrors = {};

    try {
      // Create validation data
      const validationData: CourseFormData = {
        title: formData.title.trim(),
        code: formData.code.trim(),
        creditHours: parseInt(formData.creditHours),
        instructor: formData.instructor.trim(),
        termId: formData.termId,
        meetingDays: formData.meetingDays.length > 0 ? formData.meetingDays as ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[] : undefined,
        meetingStart: formData.meetingStart.trim() || undefined,
        meetingEnd: formData.meetingEnd.trim() || undefined,
        building: formData.building.trim() || undefined,
        room: formData.room.trim() || undefined,
      };

      // Validate using Zod schema
      courseSchema.parse(validationData);
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as any;
        zodError.errors.forEach((err: any) => {
          const field = err.path[0];
          if (field === 'title') newErrors.title = err.message;
          else if (field === 'code') newErrors.code = err.message;
          else if (field === 'creditHours') newErrors.creditHours = err.message;
          else if (field === 'instructor') newErrors.instructor = err.message;
          else if (field === 'termId') newErrors.termId = err.message;
        });
      } else {
        // Fallback validation for UI-specific fields
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required';
        } else if (formData.title.length > 100) {
          newErrors.title = 'Title must be 100 characters or less';
        }

        if (!formData.code.trim()) {
          newErrors.code = 'Course code is required';
        } else if (formData.code.length > 20) {
          newErrors.code = 'Course code must be 20 characters or less';
        }

        if (!formData.termId) {
          newErrors.termId = 'Please select a term';
        }

        if (!formData.instructor.trim()) {
          newErrors.instructor = 'Instructor is required';
        }

        const creditHours = parseInt(formData.creditHours);
        if (!creditHours || creditHours < 1 || creditHours > 10) {
          newErrors.creditHours = 'Credit hours must be between 1 and 10';
        }

        // Conditional validation based on online/in-person
        if (!formData.isOnline) {
          // In-person classes require building, room, times, and meeting days
          if (!formData.building.trim()) {
            newErrors.building = 'Building is required for in-person classes';
          }
          if (!formData.room.trim()) {
            newErrors.room = 'Room is required for in-person classes';
          }
          if (!formData.meetingStart.trim()) {
            newErrors.meetingStart = 'Start time is required for in-person classes';
          }
          if (!formData.meetingEnd.trim()) {
            newErrors.meetingEnd = 'End time is required for in-person classes';
          }
          if (formData.meetingDays.length === 0) {
            newErrors.meetingDays = 'Meeting days are required for in-person classes';
          }
        } else if (formData.isOnline && formData.hasOnlineMeetings) {
          // Online classes with meetings require times and meeting days
          if (!formData.meetingStart.trim()) {
            newErrors.meetingStart = 'Start time is required for online meetings';
          }
          if (!formData.meetingEnd.trim()) {
            newErrors.meetingEnd = 'End time is required for online meetings';
          }
          if (formData.meetingDays.length === 0) {
            newErrors.meetingDays = 'Meeting days are required for online meetings';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createCourse({
        title: formData.title.trim(),
        code: formData.code.trim(),
        creditHours: parseInt(formData.creditHours),
        instructor: formData.instructor.trim(),
        termId: formData.termId as Id<"terms">,
        meetingDays: formData.meetingDays.length > 0 ? formData.meetingDays as ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[] : undefined,
        meetingStart: formData.meetingStart.trim() || undefined,
        meetingEnd: formData.meetingEnd.trim() || undefined,
        building: formData.building.trim() || undefined,
        room: formData.room.trim() || undefined,
      });

      setStep('success');
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to create course:', error);
      setErrors({ title: 'Failed to create course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CourseFormUI, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMeetingDaysChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      meetingDays: checked 
        ? [...prev.meetingDays, day]
        : prev.meetingDays.filter(d => d !== day)
    }));
    // Clear error when user makes changes
    if (errors.meetingDays) {
      setErrors(prev => ({ ...prev, meetingDays: undefined }));
    }
  };

  if (!isOpen) return null;

  if (step === 'success') {
    const successContent = (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <Check size={32} />
            </div>
            <h2 className={styles.successTitle}>Course Created!</h2>
            <p className={styles.successMessage}>
              "{formData.code} - {formData.title}" has been added to your courses.
            </p>
          </div>
        </div>
      </div>
    );
    
    return createSafePortal(successContent);
  }

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Plus size={20} />
          </div>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Create New Course</h2>
            <p className={styles.subtitle}>Add a new course to your academic schedule</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            {/* Term Selection */}
            <div className={styles.field}>
              <label className={styles.label}>
                <Calendar size={16} />
                Term
              </label>
              <select
                className={`${styles.select} ${errors.termId ? styles.inputError : ''}`}
                value={formData.termId}
                onChange={(e) => handleInputChange('termId', e.target.value)}
              >
                <option value="">Select a term</option>
                {terms?.map((term: any) => (
                  <option key={term._id} value={term._id}>
                    {term.name} ({term.status === 'current' ? 'Current' : term.status === 'future' ? 'Future' : 'Past'})
                  </option>
                ))}
              </select>
              {errors.termId && (
                <div className={styles.error}>
                  <AlertCircle size={14} />
                  {errors.termId}
                </div>
              )}
            </div>

            {/* Course Code */}
            <div className={styles.field}>
              <label className={styles.label}>
                <Hash size={16} />
                Course Code
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.code ? styles.inputError : ''}`}
                placeholder="e.g., CS 101, MATH 200"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                maxLength={20}
              />
              {errors.code && (
                <div className={styles.error}>
                  <AlertCircle size={14} />
                  {errors.code}
                </div>
              )}
              <div className={styles.charCount}>
                {formData.code.length}/20
              </div>
            </div>

            {/* Course Title */}
            <div className={styles.field}>
              <label className={styles.label}>
                <BookOpen size={16} />
                Course Title
              </label>
              <input
                ref={titleInputRef}
                type="text"
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="e.g., Introduction to Computer Science"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
              />
              {errors.title && (
                <div className={styles.error}>
                  <AlertCircle size={14} />
                  {errors.title}
                </div>
              )}
              <div className={styles.charCount}>
                {formData.title.length}/100
              </div>
            </div>

            {/* Credit Hours */}
            <div className={styles.field}>
              <label className={styles.label}>
                <GraduationCap size={16} />
                Credit Hours
              </label>
              <select
                className={`${styles.select} ${errors.creditHours ? styles.inputError : ''}`}
                value={formData.creditHours}
                onChange={(e) => handleInputChange('creditHours', e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(hours => (
                  <option key={hours} value={hours.toString()}>
                    {hours} {hours === 1 ? 'Credit' : 'Credits'}
                  </option>
                ))}
              </select>
              {errors.creditHours && (
                <div className={styles.error}>
                  <AlertCircle size={14} />
                  {errors.creditHours}
                </div>
              )}
            </div>

            {/* Instructor */}
            <div className={styles.field}>
              <label className={styles.label}>
                <User size={16} />
                Instructor
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.instructor ? styles.inputError : ''}`}
                placeholder="e.g., Dr. Jane Smith"
                value={formData.instructor}
                onChange={(e) => handleInputChange('instructor', e.target.value)}
                maxLength={100}
              />
              {errors.instructor && (
                <div className={styles.error}>
                  <AlertCircle size={14} />
                  {errors.instructor}
                </div>
              )}
              <div className={styles.charCount}>
                {formData.instructor.length}/100
              </div>
            </div>

            {/* Class Type */}
            <div className={styles.field}>
              <label className={styles.label}>Class Type</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="classType"
                    value="in-person"
                    checked={!formData.isOnline}
                    onChange={() => handleInputChange('isOnline', false)}
                  />
                  <span className={styles.radioLabel}>In-Person</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="classType"
                    value="online"
                    checked={formData.isOnline}
                    onChange={() => {
                      handleInputChange('isOnline', true);
                      // Reset hasOnlineMeetings when switching to online
                      handleInputChange('hasOnlineMeetings', false);
                    }}
                  />
                  <span className={styles.radioLabel}>Online</span>
                </label>
              </div>
            </div>

            {/* Online Meetings (only show if online class) */}
            {formData.isOnline && (
              <div className={styles.field}>
                <label className={styles.label}>Online Meetings</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="onlineMeetings"
                      value="no"
                      checked={!formData.hasOnlineMeetings}
                      onChange={() => handleInputChange('hasOnlineMeetings', false)}
                    />
                    <span className={styles.radioLabel}>No scheduled meetings</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="onlineMeetings"
                      value="yes"
                      checked={formData.hasOnlineMeetings}
                      onChange={() => handleInputChange('hasOnlineMeetings', true)}
                    />
                    <span className={styles.radioLabel}>Has scheduled meetings</span>
                  </label>
                </div>
              </div>
            )}

            {/* Meeting Days - only show if there are meetings */}
            {(!formData.isOnline || (formData.isOnline && formData.hasOnlineMeetings)) && (
              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar size={16} />
                  Meeting Days
                </label>
                <div className={styles.checkboxGroup}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <label key={day} className={styles.checkboxOption}>
                      <input
                        type="checkbox"
                        checked={formData.meetingDays.includes(day)}
                        onChange={(e) => handleMeetingDaysChange(day, e.target.checked)}
                      />
                      <span className={styles.checkboxLabel}>{day}</span>
                    </label>
                  ))}
                </div>
                {errors.meetingDays && (
                  <div className={styles.error}>
                    <AlertCircle size={14} />
                    {errors.meetingDays}
                  </div>
                )}
              </div>
            )}

            {/* Meeting Times - only show if there are meetings */}
            {(!formData.isOnline || (formData.isOnline && formData.hasOnlineMeetings)) && (
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    Start Time
                  </label>
                  <input
                    type="time"
                    className={`${styles.input} ${errors.meetingStart ? styles.inputError : ''}`}
                    value={formData.meetingStart}
                    onChange={(e) => handleInputChange('meetingStart', e.target.value)}
                  />
                  {errors.meetingStart && (
                    <div className={styles.error}>
                      <AlertCircle size={14} />
                      {errors.meetingStart}
                    </div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    End Time
                  </label>
                  <input
                    type="time"
                    className={`${styles.input} ${errors.meetingEnd ? styles.inputError : ''}`}
                    value={formData.meetingEnd}
                    onChange={(e) => handleInputChange('meetingEnd', e.target.value)}
                  />
                  {errors.meetingEnd && (
                    <div className={styles.error}>
                      <AlertCircle size={14} />
                      {errors.meetingEnd}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location - only show for in-person classes */}
            {!formData.isOnline && (
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <MapPin size={16} />
                    Building
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.building ? styles.inputError : ''}`}
                    placeholder="e.g., Science Hall"
                    value={formData.building}
                    onChange={(e) => handleInputChange('building', e.target.value)}
                    maxLength={100}
                  />
                  {errors.building && (
                    <div className={styles.error}>
                      <AlertCircle size={14} />
                      {errors.building}
                    </div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <MapPin size={16} />
                    Room
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.room ? styles.inputError : ''}`}
                    placeholder="e.g., Room 101"
                    value={formData.room}
                    onChange={(e) => handleInputChange('room', e.target.value)}
                    maxLength={50}
                  />
                  {errors.room && (
                    <div className={styles.error}>
                      <AlertCircle size={14} />
                      {errors.room}
                    </div>
                  )}
                </div>
              </div>
            )}
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
                disabled={isSubmitting || !formData.title.trim() || !formData.code.trim() || !formData.termId || !formData.instructor.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  
  return createSafePortal(modalContent);
}
