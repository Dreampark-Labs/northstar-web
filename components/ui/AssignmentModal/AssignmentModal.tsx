"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  BookOpen, 
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { assignmentSchema, type AssignmentFormData } from '@/lib/validation';
import { useSafePortal, useSafeBodyStyle } from '@/hooks/useSafePortal';
import styles from './AssignmentModal.module.css';

interface AssignmentFormUI {
  title: string;
  termId: string;
  courseId: string;
  dueDate: string;
  dueTime: string;
  status: 'todo' | 'done';
  notes: string;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssignmentModal({ isOpen, onClose }: AssignmentModalProps) {
  const { createSafePortal } = useSafePortal();
  
  // Prevent body scroll when modal is open
  useSafeBodyStyle(isOpen, 'overflow', 'hidden', 'unset');
  
  const [formData, setFormData] = useState<AssignmentFormUI>({
    title: '',
    termId: '',
    courseId: '',
    dueDate: '',
    dueTime: '23:59',
    status: 'todo',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<AssignmentFormUI>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch user's terms and courses
  const terms = useQuery(api.terms.list);
  const allCourses = useQuery(api.courses.list);
  
  // Filter courses by selected term client-side
  const courses = formData.termId 
    ? allCourses?.filter((course: any) => course.termId === formData.termId)
    : allCourses;
  
  // Create assignment mutation
  const createAssignment = useMutation(api.assignments.create);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Auto-select current term if available
      const currentTerm = terms?.find((term: any) => term.status === 'current');
      
      setFormData({
        title: '',
        termId: currentTerm?._id || '',
        courseId: '',
        dueDate: '',
        dueTime: '23:59',
        status: 'todo',
        notes: ''
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
    const newErrors: Partial<AssignmentFormUI> = {};

    try {
      // Combine date and time into a timestamp for validation
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      const dueAt = dueDateTime.getTime();

      // Create validation data
      const validationData: AssignmentFormData = {
        title: formData.title.trim(),
        courseId: formData.courseId,
        dueAt,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };

      // Validate using Zod schema
      assignmentSchema.parse(validationData);
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as any;
        zodError.errors.forEach((err: any) => {
          const field = err.path[0];
          if (field === 'title') newErrors.title = err.message;
          else if (field === 'courseId') newErrors.courseId = err.message;
          else if (field === 'dueAt') newErrors.dueDate = err.message;
          else if (field === 'notes') newErrors.notes = err.message;
        });
      } else {
        // Fallback validation for UI-specific fields
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required';
        } else if (formData.title.length > 100) {
          newErrors.title = 'Title must be 100 characters or less';
        }

        if (!formData.termId) {
          newErrors.termId = 'Please select a term';
        }

        if (!formData.courseId) {
          newErrors.courseId = 'Please select a course';
        }

        if (!formData.dueDate) {
          newErrors.dueDate = 'Due date is required';
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
      // Combine date and time into a timestamp
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      const dueAt = dueDateTime.getTime();

      await createAssignment({
        title: formData.title.trim(),
        courseId: formData.courseId as Id<"courses">,
        dueAt,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      });

      setStep('success');
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to create assignment:', error);
      setErrors({ title: 'Failed to create assignment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AssignmentFormUI, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Clear courseId when term changes to avoid invalid combinations
      if (field === 'termId') {
        newData.courseId = '';
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
    const successContent = (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <Check size={32} />
            </div>
            <h2 className={styles.successTitle}>Assignment Created!</h2>
            <p className={styles.successMessage}>
              "{formData.title}" has been added to your assignments.
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
            <h2 className={styles.title}>Create New Assignment</h2>
            <p className={styles.subtitle}>Add a new assignment to track your coursework</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            {/* Title Field */}
            <div className={styles.field}>
              <label className={styles.label}>
                <FileText size={16} />
                Assignment Title
              </label>
              <input
                ref={titleInputRef}
                type="text"
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="e.g., Research Paper on Climate Change"
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

            {/* Course Selection */}
            <div className={styles.field}>
              <label className={styles.label}>
                <BookOpen size={16} />
                Course
              </label>
              <select
                className={`${styles.select} ${errors.courseId ? styles.inputError : ''}`}
                value={formData.courseId}
                onChange={(e) => handleInputChange('courseId', e.target.value)}
                disabled={!formData.termId}
              >
                <option value="">{!formData.termId ? 'Select a term first' : 'Select a course'}</option>
                {courses?.map((course: any) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <div className={styles.error}>
                  <AlertCircle size={14} />
                  {errors.courseId}
                </div>
              )}
            </div>

            {/* Due Date and Time */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar size={16} />
                  Due Date
                </label>
                <input
                  type="date"
                  className={`${styles.input} ${errors.dueDate ? styles.inputError : ''}`}
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
                {errors.dueDate && (
                  <div className={styles.error}>
                    <AlertCircle size={14} />
                    {errors.dueDate}
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Clock size={16} />
                  Due Time
                </label>
                <input
                  type="time"
                  className={styles.input}
                  value={formData.dueTime}
                  onChange={(e) => handleInputChange('dueTime', e.target.value)}
                />
              </div>
            </div>

            {/* Status */}
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="status"
                    value="todo"
                    checked={formData.status === 'todo'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  />
                  <span className={styles.radioLabel}>To Do</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="status"
                    value="done"
                    checked={formData.status === 'done'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  />
                  <span className={styles.radioLabel}>Completed</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className={styles.field}>
              <label className={styles.label}>Notes (Optional)</label>
              <textarea
                className={styles.textarea}
                placeholder="Add any additional notes or details..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className={styles.charCount}>
                {formData.notes.length}/500
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
                disabled={isSubmitting || !formData.title.trim() || !formData.termId || !formData.courseId || !formData.dueDate}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Assignment
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
