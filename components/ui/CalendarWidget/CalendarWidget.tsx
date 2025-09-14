"use client";

import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { type CalendarEvent } from '@/components/ui/Calendar';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { 
  getTodaysEvents, 
  getThisWeeksEvents, 
  sortEventsByTime,
  groupEventsByDate 
} from '@/lib/calendar';
import styles from './CalendarWidget.module.css';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  type: 'today' | 'week' | 'upcoming';
  maxItems?: number;
  showTime?: boolean;
  showLocation?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function CalendarWidget({
  events,
  type,
  maxItems = 5,
  showTime = true,
  showLocation = false,
  onEventClick,
  className
}: CalendarWidgetProps) {
  const filteredEvents = useMemo(() => {
    let filtered: CalendarEvent[];
    
    switch (type) {
      case 'today':
        filtered = getTodaysEvents(events);
        break;
      case 'week':
        filtered = getThisWeeksEvents(events);
        break;
      case 'upcoming':
        // Show upcoming assignments/exams in next 7 days
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        filtered = events.filter(event => 
          (event.type === 'assignment' || event.type === 'exam') &&
          event.startTime >= now && 
          event.startTime <= nextWeek
        );
        break;
      default:
        filtered = events;
    }
    
    return sortEventsByTime(filtered).slice(0, maxItems);
  }, [events, type, maxItems]);

  const groupedEvents = useMemo(() => {
    if (type === 'today') {
      return { [new Date().toISOString().split('T')[0]]: filteredEvents };
    }
    return groupEventsByDate(filteredEvents);
  }, [filteredEvents, type]);

  const formatEventTime = (event: CalendarEvent): string => {
    if (event.isAllDay) return 'All day';
    
    const start = event.startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (event.endTime) {
      const end = event.endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${start} - ${end}`;
    }
    
    return start;
  };

  const formatEventDate = (date: string): string => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getEventTypeIcon = (eventType: CalendarEvent['type']) => {
    switch (eventType) {
      case 'class':
        return <CalendarIcon size={14} />;
      case 'assignment':
        return <Clock size={14} />;
      case 'exam':
        return <Clock size={14} />;
      case 'office-hours':
        return <MapPin size={14} />;
      default:
        return <CalendarIcon size={14} />;
    }
  };

  if (filteredEvents.length === 0) {
    const getEmptyStateContent = () => {
      switch (type) {
        case 'today':
          return { title: 'No events today', description: 'Enjoy your free day!' };
        case 'week':
          return { title: 'No events this week', description: 'A quiet week ahead.' };
        case 'upcoming':
          return { title: 'No upcoming deadlines', description: 'All caught up!' };
        default:
          return { title: 'No events', description: 'Nothing scheduled.' };
      }
    };

    const { title, description } = getEmptyStateContent();

    return (
      <div className={`${styles.widget} ${className || ''}`}>
        <EmptyState
          icon={<CalendarIcon size={24} />}
          title={title}
          description={description}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.widget} ${className || ''}`}>
      {type === 'today' ? (
        // Today view - simple list
        <div className={styles.eventList}>
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className={`${styles.eventItem} ${styles[`event-${event.type}`]}`}
              onClick={() => onEventClick?.(event)}
              style={{ '--event-color': event.color } as React.CSSProperties}
            >
              <div className={styles.eventIcon}>
                {getEventTypeIcon(event.type)}
              </div>
              <div className={styles.eventContent}>
                <div className={styles.eventTitle} title={event.title}>
                  {event.title || 'Untitled Event'}
                </div>
                {event.courseCode && (
                  <div className={styles.eventCourse}>{event.courseCode}</div>
                )}
                {showTime && (
                  <div className={styles.eventTime}>
                    {formatEventTime(event)}
                  </div>
                )}
                {showLocation && event.location && (
                  <div className={styles.eventLocation}>
                    <MapPin size={12} />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Week/Upcoming view - grouped by date
        <div className={styles.groupedEvents}>
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
            <div key={dateKey} className={styles.dayGroup}>
              <div className={styles.dayHeader}>
                {formatEventDate(dateKey)}
              </div>
              <div className={styles.dayEvents}>
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`${styles.eventItem} ${styles.compact} ${styles[`event-${event.type}`]}`}
                    onClick={() => onEventClick?.(event)}
                    style={{ '--event-color': event.color } as React.CSSProperties}
                  >
                    <div className={styles.eventIndicator} />
                    <div className={styles.eventContent}>
                      <div className={styles.eventTitle} title={event.title}>
                        {event.title || 'Untitled Event'}
                      </div>
                      <div className={styles.eventMeta}>
                        {event.courseCode && (
                          <span className={styles.eventCourse}>{event.courseCode}</span>
                        )}
                        {showTime && !event.isAllDay && (
                          <span className={styles.eventTime}>
                            {event.startTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CalendarWidget;
