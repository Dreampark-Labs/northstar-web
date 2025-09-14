"use client";

import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { 
  ChevronLeft, 
  ChevronRight,
  Video, 
  MapPin, 
  Clock
} from 'lucide-react';
import { type CalendarEvent } from '@/components/ui/Calendar';
import styles from './NotionCalendarWeekView.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

interface NotionCalendarWeekViewProps {
  events?: CalendarEvent[];
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  height?: string;
}

export function NotionCalendarWeekView({
  events = [],
  selectedDate = new Date(),
  onDateChange,
  onEventClick,
  className,
  height = '400px'
}: NotionCalendarWeekViewProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  // Convert our events to React Big Calendar format
  const bigCalendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime || event.startTime,
      allDay: event.isAllDay || false,
      resource: event, // Store original event data
    }));
  }, [events]);

  // Handle date navigation
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // Handle event selection from BigCalendar
  const handleSelectEvent = (event: { resource?: CalendarEvent }) => {
    if (event.resource) {
      onEventClick?.(event.resource);
    }
  };

  // Custom event component
  const EventComponent = ({ event }: { event: { resource: CalendarEvent } }) => {
    const originalEvent = event.resource as CalendarEvent;
    
    const formatTime = (start: Date, end?: Date) => {
      const startTime = start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      if (end) {
        const endTime = end.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        return `${startTime} - ${endTime}`;
      }
      return startTime;
    };

    const getMeetingIcon = (type?: string) => {
      switch (type) {
        case 'google-meet':
        case 'zoom':
        case 'teams':
          return <Video size={9} />;
        default:
          return null;
      }
    };
    
    return (
      <div 
        className={styles.notionEvent} 
        style={{ backgroundColor: originalEvent.color }}
        data-event-type={originalEvent.type}
        onClick={() => onEventClick?.(originalEvent)}
      >
        <div className={styles.eventTitle}>{originalEvent.title}</div>
        
        {originalEvent.courseCode && (
          <div className={styles.eventCourse}>{originalEvent.courseCode}</div>
        )}
        
        {!originalEvent.isAllDay && (
          <div className={styles.eventTime}>
            <Clock size={9} />
            {formatTime(originalEvent.startTime, originalEvent.endTime)}
          </div>
        )}
        
        {originalEvent.location && (
          <div className={styles.eventLocation}>
            <MapPin size={9} />
            <span>{originalEvent.location}</span>
          </div>
        )}
        
        {originalEvent.meetingUrl && (
          <div className={styles.meetingIndicator}>
            {getMeetingIcon(originalEvent.meetingType)}
          </div>
        )}
      </div>
    );
  };

  // Format the current week range
  const formatWeekRange = () => {
    const startOfWeek = moment(currentDate).startOf('week');
    const endOfWeek = moment(currentDate).endOf('week');
    
    return `${startOfWeek.format('MMM D')} - ${endOfWeek.format('MMM D, YYYY')}`;
  };

  return (
    <div className={`${styles.notionCalendarWeek} ${className || ''}`} style={{ height }}>
      {/* Header */}
      <div className={styles.calendarHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.dateNavigation}>
            <button 
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - 7);
                handleNavigate(newDate);
              }}
              className={styles.navButton}
            >
              <ChevronLeft size={16} />
            </button>
            <div className={styles.weekRange}>
              {formatWeekRange()}
            </div>
            <button 
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + 7);
                handleNavigate(newDate);
              }}
              className={styles.navButton}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.todayButton} 
            onClick={() => handleNavigate(new Date())}
          >
            Today
          </button>
        </div>
      </div>

      {/* Big Calendar */}
      <div className={styles.bigCalendarContainer}>
        <BigCalendar
          localizer={localizer}
          events={bigCalendarEvents}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={Views.WEEK}
          onNavigate={handleNavigate}
          onView={() => {}} // We handle view changes with our own buttons
          onSelectEvent={handleSelectEvent}
          selectable={false}
          components={{
            toolbar: () => null, // We use our own toolbar
            event: EventComponent,
          }}
          step={30}
          timeslots={2}
          showMultiDayTimes
          views={{
            week: true,
          }}
          formats={{
            timeGutterFormat: 'h A',
            dayHeaderFormat: 'ddd M/D',
          }}
          min={new Date(0, 0, 0, 6, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          scrollToTime={new Date(0, 0, 0, 8, 0, 0)}
          className={styles.bigCalendar}
        />
      </div>
    </div>
  );
}

export default NotionCalendarWeekView;
