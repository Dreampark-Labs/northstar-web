"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Plus, Video, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import styles from './Calendar.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

export type CalendarView = 'today' | 'five-day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'assignment' | 'exam' | 'office-hours' | 'meeting';
  startTime: Date;
  endTime?: Date;
  color: string;
  courseCode?: string;
  location?: string;
  description?: string;
  isAllDay?: boolean;
  attendees?: Array<{
    name: string;
    initials: string;
    avatar?: string;
  }>;
  meetingUrl?: string;
  meetingType?: 'google-meet' | 'zoom' | 'teams';
}

interface CalendarProps {
  events?: CalendarEvent[];
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date, hour?: number) => void;
  className?: string;
}

// Map our view types to React Big Calendar view types
const mapViewToBigCalendar = (view: CalendarView): View => {
  switch (view) {
    case 'today':
      return Views.DAY;
    case 'five-day':
      return Views.WORK_WEEK;
    case 'week':
      return Views.WEEK;
    case 'month':
      return Views.MONTH;
    default:
      return Views.WEEK;
  }
};

const mapBigCalendarViewToOur = (view: View): CalendarView => {
  switch (view) {
    case Views.DAY:
      return 'today';
    case Views.WORK_WEEK:
      return 'five-day';
    case Views.WEEK:
      return 'week';
    case Views.MONTH:
      return 'month';
    default:
      return 'week';
  }
};

export function Calendar({
  events = [],
  view = 'week',
  onViewChange,
  onDateChange,
  onEventClick,
  onAddEvent,
  className
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>(view);

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

  // Handle view changes
  const handleViewChange = useCallback((newView: View) => {
    const mappedView = mapBigCalendarViewToOur(newView);
    setCurrentView(mappedView);
    onViewChange?.(mappedView);
  }, [onViewChange]);

  // Handle date navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [onDateChange]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: any) => {
    if (event.resource) {
      onEventClick?.(event.resource);
    }
  }, [onEventClick]);

  // Handle slot selection (for adding events)
  const handleSelectSlot = useCallback((slotInfo: any) => {
    const hour = slotInfo.start.getHours();
    onAddEvent?.(slotInfo.start, hour);
  }, [onAddEvent]);

  // Custom event component
  const EventComponent = ({ event }: any) => {
    const originalEvent = event.resource as CalendarEvent;
    
    // Get the event's DOM element height to determine display strategy
    const getEventHeight = () => {
      // This is an approximation since we don't have direct DOM access
      // React Big Calendar will handle the actual sizing
      return 'auto';
    };
    
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
    
    const formatShortTime = (start: Date) => {
      return start.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        hour12: true 
      }).replace(' ', '');
    };

    const getMeetingIcon = (type?: string) => {
      switch (type) {
        case 'google-meet':
          return <Video size={10} />;
        case 'zoom':
          return <Video size={10} />;
        case 'teams':
          return <Video size={10} />;
        default:
          return null;
      }
    };

    return (
      <div 
        className={styles.customEvent} 
        style={{ backgroundColor: originalEvent.color }}
        data-event-type={originalEvent.type}
      >
        {/* Primary content - always visible */}
        <div className={styles.eventPrimaryContent}>
          <div className={styles.eventTitle} title={originalEvent.title}>
            {originalEvent.title || 'Untitled Event'}
          </div>
          {!originalEvent.isAllDay && (
            <div className={styles.eventTimeCompact}>
              {formatShortTime(originalEvent.startTime)}
            </div>
          )}
        </div>
        
        {/* Secondary content - shown when there's space */}
        <div className={styles.eventSecondaryContent}>
          {originalEvent.courseCode && (
            <div className={styles.eventCourse}>{originalEvent.courseCode}</div>
          )}
          
          {!originalEvent.isAllDay && (
            <div className={styles.eventTime}>
              <Clock size={10} style={{ marginRight: '4px' }} />
              {formatTime(originalEvent.startTime, originalEvent.endTime)}
            </div>
          )}
          
          {originalEvent.location && (
            <div className={styles.eventLocation}>
              <MapPin size={10} />
              {originalEvent.location}
            </div>
          )}
          
          {(originalEvent.attendees || originalEvent.meetingUrl) && (
            <div className={styles.eventMeetingInfo}>
              {originalEvent.attendees && originalEvent.attendees.length > 0 && (
                <div className={styles.eventAvatars}>
                  {originalEvent.attendees.slice(0, 3).map((attendee, index) => (
                    <div key={index} className={styles.eventAvatar} title={attendee.name}>
                      {attendee.initials}
                    </div>
                  ))}
                  {originalEvent.attendees.length > 3 && (
                    <div className={styles.eventAvatar} title={`+${originalEvent.attendees.length - 3} more`}>
                      +{originalEvent.attendees.length - 3}
                    </div>
                  )}
                </div>
              )}
              
              {originalEvent.meetingUrl && (
                <a 
                  href={originalEvent.meetingUrl} 
                  className={styles.meetingLink}
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getMeetingIcon(originalEvent.meetingType)}
                  Join
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom toolbar
  const CustomToolbar = ({ date, view, onNavigate, onView }: any) => {
    const goToBack = () => {
      const newDate = new Date(date);
      switch (currentView) {
        case 'today':
          newDate.setDate(date.getDate() - 1);
          break;
        case 'five-day':
          newDate.setDate(date.getDate() - 5);
          break;
        case 'week':
          newDate.setDate(date.getDate() - 7);
          break;
        case 'month':
          newDate.setMonth(date.getMonth() - 1);
          break;
      }
      onNavigate(newDate);
    };

    const goToNext = () => {
      const newDate = new Date(date);
      switch (currentView) {
        case 'today':
          newDate.setDate(date.getDate() + 1);
          break;
        case 'five-day':
          newDate.setDate(date.getDate() + 5);
          break;
        case 'week':
          newDate.setDate(date.getDate() + 7);
          break;
        case 'month':
          newDate.setMonth(date.getMonth() + 1);
          break;
      }
      onNavigate(newDate);
    };

    const goToToday = () => {
      onNavigate(new Date());
    };

    const getDateTitle = () => {
      switch (currentView) {
        case 'today':
          return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        case 'five-day':
        case 'week':
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        case 'month':
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        default:
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      }
    };

    return (
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button onClick={goToBack} className={styles.navButton}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={goToToday} className={styles.todayButton}>
            Today
          </button>
          <button onClick={goToNext} className={styles.navButton}>
            <ChevronRight size={18} />
          </button>
          <h2 className={styles.dateTitle}>{getDateTitle()}</h2>
        </div>
        
        <div className={styles.viewControls}>
          {(['today', 'five-day', 'week', 'month'] as CalendarView[]).map((viewOption) => (
            <button
              key={viewOption}
              data-variant={currentView === viewOption ? 'primary' : 'secondary'}
              onClick={() => {
                setCurrentView(viewOption);
                onView(mapViewToBigCalendar(viewOption));
                onViewChange?.(viewOption);
              }}
              className={styles.viewButton}
            >
              {viewOption === 'five-day' ? '5 Day' :
               viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.calendar} ${className || ''}`}>
      <ErrorBoundary>
        <BigCalendar
          localizer={localizer}
          events={bigCalendarEvents}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={mapViewToBigCalendar(currentView)}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          components={{
            toolbar: CustomToolbar,
            event: EventComponent,
          }}
          step={30}
          timeslots={2}
          showMultiDayTimes
          views={{
            month: true,
            week: true,
            work_week: true,
            day: true,
          }}
          formats={{
            timeGutterFormat: 'h A',
            dayHeaderFormat: 'ddd M/D',
            dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
              localizer?.format(start, 'MMM DD', culture) + ' - ' + 
              localizer?.format(end, 'MMM DD', culture),
          }}
          min={new Date(0, 0, 0, 0, 0, 0)} // 12 AM (midnight)
          max={new Date(0, 0, 0, 23, 59, 59)} // 11:59 PM
          scrollToTime={new Date(0, 0, 0, 8, 0, 0)} // Scroll to 8 AM
          className={styles.bigCalendar}
        />
      </ErrorBoundary>
    </div>
  );
}

export default Calendar;