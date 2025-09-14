"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Check,
  Edit3,
  X,
  Save,
  Trash2,
  GraduationCap
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { assignmentSchema, type AssignmentFormData } from '@/lib/validation';
import styles from './AssignmentDetailsModal.module.css';

interface AssignmentFormUI {
  title: string;
  dueDate: string;
  dueTime: string;
  status: 'todo' | 'done';
  notes: string;
  pointsEarned: string;
  pointsPossible: string;
}

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId?: Id<"assignments">;
}

export function AssignmentDetailsModal({ isOpen, onClose, assignmentId }: AssignmentDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormUI>({
    title: '',
    dueDate: '',
    dueTime: '23:59',
    status: 'todo',
    notes: '',
    pointsEarned: '',
    pointsPossible: ''
  });
  const [errors, setErrors] = useState<Partial<AssignmentFormUI>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Fetch assignment data
  const assignment = useQuery(api.assignments.getById, assignmentId ? { id: assignmentId } : "skip");
  
  // Debug logging
  useEffect(() => {
    console.log('AssignmentDetailsModal - isOpen:', isOpen, 'assignmentId:', assignmentId);
    if (assignment) {
      console.log('AssignmentDetailsModal - assignment data:', assignment);
    } else if (assignmentId) {
      console.log('AssignmentDetailsModal - no assignment data for ID:', assignmentId);
    }
  }, [isOpen, assignmentId, assignment]);
  
  // Update assignment mutation
  const updateAssignment = useMutation(api.assignments.update);
  
  // Delete assignment mutation
  const deleteAssignment = useMutation(api.assignments.remove);

  // Initialize form data when assignment is loaded
  useEffect(() => {
    if (assignment && isOpen) {
      const dueDate = new Date(assignment.dueAt);
      const dueDateString = dueDate.toISOString().split('T')[0];
      const dueTimeString = dueDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: assignment.title,
        dueDate: dueDateString,
        dueTime: dueTimeString,
        status: assignment.status,
        notes: assignment.notes || '',
        pointsEarned: assignment.pointsEarned?.toString() || '',
        pointsPossible: assignment.pointsPossible?.toString() || ''
      });
      setIsEditing(false);
      setErrors({});
    }
  }, [assignment, isOpen]);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (isEditing) {
            handleCancelEdit();
          } else {
            onClose();
          }
          break;
        case 'Enter':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (isEditing) {
              handleSave();
            }
          }
          break;
        case 'e':
          if ((e.metaKey || e.ctrlKey) && !isEditing) {
            e.preventDefault();
            setIsEditing(true);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AssignmentFormUI> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.pointsEarned && isNaN(Number(formData.pointsEarned))) {
      newErrors.pointsEarned = 'Points earned must be a number';
    }

    if (formData.pointsPossible && isNaN(Number(formData.pointsPossible))) {
      newErrors.pointsPossible = 'Points possible must be a number';
    }

    if (formData.pointsEarned && formData.pointsPossible) {
      const earned = Number(formData.pointsEarned);
      const possible = Number(formData.pointsPossible);
      if (earned > possible) {
        newErrors.pointsEarned = 'Points earned cannot exceed points possible';
      }
      if (earned < 0) {
        newErrors.pointsEarned = 'Points earned cannot be negative';
      }
      if (possible <= 0) {
        newErrors.pointsPossible = 'Points possible must be greater than 0';
      }
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!assignment || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into a timestamp
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      const dueAt = dueDateTime.getTime();

      const updateData: any = {
        id: assignment._id,
        courseId: assignment.courseId,
        title: formData.title.trim(),
        dueAt,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };

      if (formData.pointsEarned) {
        updateData.pointsEarned = Number(formData.pointsEarned);
      }
      if (formData.pointsPossible) {
        updateData.pointsPossible = Number(formData.pointsPossible);
      }

      await updateAssignment(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update assignment:', error);
      setErrors({ title: 'Failed to update assignment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (assignment) {
      const dueDate = new Date(assignment.dueAt);
      const dueDateString = dueDate.toISOString().split('T')[0];
      const dueTimeString = dueDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: assignment.title,
        dueDate: dueDateString,
        dueTime: dueTimeString,
        status: assignment.status,
        notes: assignment.notes || '',
        pointsEarned: assignment.pointsEarned?.toString() || '',
        pointsPossible: assignment.pointsPossible?.toString() || ''
      });
      setErrors({});
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!assignment || !window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await deleteAssignment({ id: assignment._id });
      onClose();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  const handleInputChange = (field: keyof AssignmentFormUI, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const assignmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (assignmentDate.getTime() === today.getTime()) {
      return `Today, ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else if (assignmentDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getGradePercentage = (): number | null => {
    if (assignment?.pointsEarned !== undefined && assignment?.pointsPossible && assignment.pointsPossible > 0) {
      return Math.round((assignment.pointsEarned / assignment.pointsPossible) * 100);
    }
    return null;
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'var(--color-success, #22c55e)';
    if (percentage >= 80) return 'var(--color-warning, #f59e0b)';
    if (percentage >= 70) return 'var(--color-warning, #f59e0b)';
    return 'var(--color-danger, #ef4444)';
  };

  if (!isOpen) return null;

  if (!assignment) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingIcon}>
              <FileText size={32} />
            </div>
            <h2 className={styles.loadingTitle}>Loading Assignment...</h2>
          </div>
        </div>
      </div>
    );
  }

  const gradePercentage = getGradePercentage();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <FileText size={20} />
          </div>
          <div className={styles.headerContent}>
            {isEditing ? (
              <div className={styles.field}>
                <input
                  ref={titleInputRef}
                  type="text"
                  className={`${styles.titleInput} ${errors.title ? styles.inputError : ''}`}
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
              </div>
            ) : (
              <h2 className={styles.title}>{assignment.title}</h2>
            )}
            <div className={styles.subtitle}>
              <BookOpen size={14} />
              <span>{assignment.course.code} • {assignment.course.title}</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            {isEditing ? (
              <>
                <button
                  className={styles.iconButton}
                  onClick={handleCancelEdit}
                  title="Cancel editing"
                  disabled={isSubmitting}
                >
                  <X size={16} />
                </button>
                <button
                  className={`${styles.iconButton} ${styles.saveButton}`}
                  onClick={handleSave}
                  title="Save changes (⌘↵)"
                  disabled={isSubmitting}
                >
                  <Save size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.iconButton}
                  onClick={() => setIsEditing(true)}
                  title="Edit assignment (⌘E)"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className={`${styles.iconButton} ${styles.deleteButton}`}
                  onClick={handleDelete}
                  title="Delete assignment"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Calendar size={16} />
              <span>Due Date</span>
            </div>
            <div className={styles.sectionContent}>
              {isEditing ? (
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
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
                    <input
                      type="time"
                      className={styles.input}
                      value={formData.dueTime}
                      onChange={(e) => handleInputChange('dueTime', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.value}>
                  <Clock size={16} />
                  <span>{formatDateTime(assignment.dueAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Check size={16} />
              <span>Status</span>
            </div>
            <div className={styles.sectionContent}>
              {isEditing ? (
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
              ) : (
                <div className={styles.statusBadge} data-status={assignment.status}>
                  {assignment.status === 'done' ? 'Completed' : 'To Do'}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <GraduationCap size={16} />
              <span>Grade</span>
            </div>
            <div className={styles.sectionContent}>
              {isEditing ? (
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Points Earned</label>
                    <input
                      type="number"
                      className={`${styles.input} ${errors.pointsEarned ? styles.inputError : ''}`}
                      placeholder="0"
                      value={formData.pointsEarned}
                      onChange={(e) => handleInputChange('pointsEarned', e.target.value)}
                      step="0.1"
                      min="0"
                    />
                    {errors.pointsEarned && (
                      <div className={styles.error}>
                        <AlertCircle size={14} />
                        {errors.pointsEarned}
                      </div>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Points Possible</label>
                    <input
                      type="number"
                      className={`${styles.input} ${errors.pointsPossible ? styles.inputError : ''}`}
                      placeholder="100"
                      value={formData.pointsPossible}
                      onChange={(e) => handleInputChange('pointsPossible', e.target.value)}
                      step="0.1"
                      min="0.1"
                    />
                    {errors.pointsPossible && (
                      <div className={styles.error}>
                        <AlertCircle size={14} />
                        {errors.pointsPossible}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.gradeDisplay}>
                  {assignment.pointsEarned !== undefined && assignment.pointsPossible ? (
                    <>
                      <div className={styles.gradePoints}>
                        {assignment.pointsEarned} / {assignment.pointsPossible} points
                      </div>
                      {gradePercentage !== null && (
                        <div 
                          className={styles.gradePercentage}
                          style={{ color: getGradeColor(gradePercentage) }}
                        >
                          {gradePercentage}%
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.noGrade}>No grade recorded</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={16} />
              <span>Notes</span>
            </div>
            <div className={styles.sectionContent}>
              {isEditing ? (
                <div className={styles.field}>
                  <textarea
                    className={`${styles.textarea} ${errors.notes ? styles.inputError : ''}`}
                    placeholder="Add any additional notes or details..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  {errors.notes && (
                    <div className={styles.error}>
                      <AlertCircle size={14} />
                      {errors.notes}
                    </div>
                  )}
                  <div className={styles.charCount}>
                    {formData.notes.length}/500
                  </div>
                </div>
              ) : (
                <div className={styles.notesDisplay}>
                  {assignment.notes ? (
                    <p>{assignment.notes}</p>
                  ) : (
                    <div className={styles.noNotes}>No notes added</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.shortcuts}>
            {isEditing ? (
              <>
                <span>
                  <kbd>⌘</kbd><kbd>↵</kbd> to save
                </span>
                <span>
                  <kbd>ESC</kbd> to cancel
                </span>
              </>
            ) : (
              <>
                <span>
                  <kbd>⌘</kbd><kbd>E</kbd> to edit
                </span>
                <span>
                  <kbd>ESC</kbd> to close
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
