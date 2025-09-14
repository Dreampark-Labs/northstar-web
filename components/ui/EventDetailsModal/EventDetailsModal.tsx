"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  X, 
  Edit3, 
  Save, 
  Clock, 
  MapPin, 
  Video,
  Calendar,
  User
} from 'lucide-react';
import { type CalendarEvent } from '@/components/ui/Calendar';
import styles from './EventDetailsModal.module.css';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Convex mutations
  const updateEvent = useMutation(api.events.update);
  const createEvent = useMutation(api.events.create);

  // Reset state when modal opens/closes or event changes
  useEffect(() => {
    if (isOpen && event) {
      setIsEditing(false);
      setEditingEvent(null);
      setSaveError(null);
    }
  }, [isOpen, event]);

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
              handleSaveEvent();
            }
          }
          break;
        case 'e':
          if ((e.metaKey || e.ctrlKey) && !isEditing && event) {
            e.preventDefault();
            handleEditEvent(event);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, event, onClose]);

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 150);
    }
  }, [isEditing]);

  // Get proper event type name
  const getEventTypeName = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class':
        return 'Class';
      case 'meeting':
        return 'Meeting';
      case 'assignment':
        return 'Assignment';
      case 'exam':
        return 'Exam';
      case 'office-hours':
        return 'Office Hours';
      default:
        return 'Event';
    }
  };

  // Format date for datetime-local input (handles timezone properly)
  const formatDateTimeForInput = (date: Date): string => {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  // Parse datetime-local input value to Date object (handles timezone properly)
  const parseDateTimeFromInput = (value: string): Date => {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', value);
      return new Date();
    }
    
    return date;
  };

  // Handle editing
  const handleEditEvent = (eventToEdit: CalendarEvent) => {
    setEditingEvent({ ...eventToEdit });
    setIsEditing(true);
    setSaveError(null);
  };

  const handleSaveEvent = async () => {
    if (!editingEvent) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Validate required fields
      if (!editingEvent.title.trim()) {
        throw new Error('Event title is required');
      }

      // Convert CalendarEvent to database format
      const eventData = {
        title: editingEvent.title.trim(),
        type: editingEvent.type,
        startTime: editingEvent.startTime.getTime(),
        endTime: editingEvent.endTime?.getTime(),
        isAllDay: editingEvent.isAllDay || false,
        color: editingEvent.color,
        location: editingEvent.location?.trim() || undefined,
        description: editingEvent.description?.trim() || undefined,
        courseCode: editingEvent.courseCode?.trim() || undefined,
        courseId: undefined, // TODO: Map courseCode to courseId if needed
        meetingUrl: editingEvent.meetingUrl?.trim() || undefined,
        meetingType: editingEvent.meetingType,
        attendees: editingEvent.attendees,
      };

      // Check if this is a mock event (UUID format) or temp event, or a real Convex event
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editingEvent.id);
      const isTempEvent = editingEvent.id.startsWith('temp-');
      
      let savedEventId: string;

      if (isTempEvent || isUUID) {
        // This is a new event (temp ID or mock event with UUID)
        savedEventId = await createEvent(eventData);
        console.log('Created new event:', savedEventId);
      } else {
        // This is an existing Convex event
        await updateEvent({
          id: editingEvent.id as any, // Cast to Convex ID type
          ...eventData,
        });
        console.log('Updated event:', editingEvent.id);
        savedEventId = editingEvent.id;
      }

      // Update URL if the event ID changed (for new events)
      if (savedEventId !== editingEvent.id) {
        const newUrl = `/calendar?event=${savedEventId}`;
        window.history.replaceState({ eventId: savedEventId }, '', newUrl);
      }

      // Update local state
      setIsEditing(false);
      setEditingEvent(null);
      
      // Success feedback
      console.log('Event saved successfully!');
      
      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEvent(null);
    setSaveError(null);
  };

  const handleEventFieldChange = (field: keyof CalendarEvent, value: any) => {
    if (editingEvent) {
      let updatedEvent = {
        ...editingEvent,
        [field]: value
      };

      // Auto-adjust end time if start time is changed and end time is before start time
      if (field === 'startTime' && value instanceof Date && editingEvent.endTime) {
        if (editingEvent.endTime <= value) {
          // Set end time to 1 hour after start time
          const newEndTime = new Date(value.getTime() + 60 * 60 * 1000);
          updatedEvent.endTime = newEndTime;
        }
      }

      setEditingEvent(updatedEvent);
    }
  };

  if (!isOpen || !event) return null;

  const displayEvent = isEditing ? editingEvent : event;
  if (!displayEvent) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Calendar size={20} />
          </div>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>
              {isEditing ? 'Edit Event' : getEventTypeName(displayEvent.type)}
            </h2>
            <p className={styles.subtitle}>
              {isEditing ? 'Update event details' : displayEvent.title}
            </p>
          </div>
          <div className={styles.headerActions}>
            {!isEditing && (
              <button 
                onClick={() => handleEditEvent(event)}
                className={styles.editButton}
                title="Edit event (⌘E)"
              >
                <Edit3 size={16} />
              </button>
            )}
            <button 
              onClick={onClose}
              className={styles.closeButton}
              title="Close (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {isEditing && editingEvent ? (
            // Edit Mode
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }} className={styles.form}>
              <div className={styles.formSection}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Calendar size={16} />
                    Event Title
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    className={`${styles.input} ${!editingEvent.title.trim() ? styles.inputError : ''}`}
                    placeholder="Enter event title"
                    value={editingEvent.title}
                    onChange={(e) => handleEventFieldChange('title', e.target.value)}
                    maxLength={100}
                    required
                  />
                  {!editingEvent.title.trim() && (
                    <div className={styles.error}>
                      Event title is required
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Event Type
                  </label>
                  <select
                    className={styles.select}
                    value={editingEvent.type}
                    onChange={(e) => handleEventFieldChange('type', e.target.value)}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="class">Class</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="office-hours">Office Hours</option>
                  </select>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      <Clock size={16} />
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.input}
                      value={formatDateTimeForInput(editingEvent.startTime)}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleEventFieldChange('startTime', parseDateTimeFromInput(e.target.value));
                        }
                      }}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.input}
                      value={editingEvent.endTime ? formatDateTimeForInput(editingEvent.endTime) : ''}
                      onChange={(e) => {
                        handleEventFieldChange('endTime', e.target.value ? parseDateTimeFromInput(e.target.value) : undefined);
                      }}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    <MapPin size={16} />
                    Location
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter location"
                    value={editingEvent.location || ''}
                    onChange={(e) => handleEventFieldChange('location', e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Course Code
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g., CS101"
                    value={editingEvent.courseCode || ''}
                    onChange={(e) => handleEventFieldChange('courseCode', e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    <Video size={16} />
                    Meeting URL
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    placeholder="https://meet.google.com/..."
                    value={editingEvent.meetingUrl || ''}
                    onChange={(e) => handleEventFieldChange('meetingUrl', e.target.value)}
                  />
                </div>

                {saveError && (
                  <div className={styles.errorMessage}>
                    {saveError}
                  </div>
                )}
              </div>

              <div className={styles.footer}>
                <div className={styles.shortcuts}>
                  <span>
                    <kbd>⌘</kbd><kbd>↵</kbd> to save
                  </span>
                  <span>
                    <kbd>ESC</kbd> to cancel
                  </span>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={isSaving || !editingEvent.title.trim()}
                  >
                    {isSaving ? (
                      <>
                        <div className={styles.spinner} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // View Mode
            <div className={styles.viewContent}>
              <div className={styles.eventTitle}>{displayEvent.title}</div>
              
              <div className={styles.eventMeta}>
                <div className={styles.eventTime}>
                  <Clock size={16} />
                  <span>
                    {displayEvent.startTime.toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {displayEvent.endTime && (
                      ` - ${displayEvent.endTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}`
                    )}
                  </span>
                </div>
                
                {displayEvent.courseCode && (
                  <div className={styles.eventCourse}>
                    <Calendar size={16} />
                    <span>{displayEvent.courseCode}</span>
                  </div>
                )}
                
                {displayEvent.location && (
                  <div className={styles.eventLocation}>
                    <MapPin size={16} />
                    <span>{displayEvent.location}</span>
                  </div>
                )}
                
                {displayEvent.meetingUrl && (
                  <div className={styles.eventMeeting}>
                    <Video size={16} />
                    <a href={displayEvent.meetingUrl} target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
              
              {displayEvent.attendees && displayEvent.attendees.length > 0 && (
                <div className={styles.eventAttendees}>
                  <h4>Participants</h4>
                  <div className={styles.attendeesList}>
                    {displayEvent.attendees.map((attendee, index) => (
                      <div key={index} className={styles.attendee}>
                        <div className={styles.attendeeAvatar}>
                          <User size={12} />
                        </div>
                        <span>{attendee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {displayEvent.description && (
                <div className={styles.eventDescription}>
                  <h4>Description</h4>
                  <p>{displayEvent.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
