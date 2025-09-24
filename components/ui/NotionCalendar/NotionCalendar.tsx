"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  Video, 
  MapPin, 
  Clock,
  Settings
} from 'lucide-react';
import { type CalendarEvent } from '@/components/ui/Calendar';
import { useEventDetailsModal } from '@/providers/EventDetailsModalProvider';
import { useAddEventModal } from '@/providers/AddEventModalProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import styles from './NotionCalendar.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

export type NotionCalendarView = 'day' | 'week' | 'month';

export interface Term {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  instructor?: string;
  termId: string;
}

export interface CalendarSource {
  id: string;
  name: string;
  type: 'personal' | 'term' | 'course';
  color: string;
  visible: boolean;
  termId?: string;
  courseId?: string;
}

interface NotionCalendarProps {
  events?: CalendarEvent[];
  terms?: Term[];
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date, hour?: number) => void;
  className?: string;
}

export function NotionCalendar({
  events = [],
  terms = [],
  selectedDate = new Date(),
  onDateChange,
  onEventClick,
  onAddEvent,
  className
}: NotionCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<NotionCalendarView>('week');
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>([]);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const { open: openEventDetailsModal } = useEventDetailsModal();
  const { open: openAddEventModal } = useAddEventModal();

  // Convex hooks
  const dbEvents = useQuery(api.events.list) || [];

  // Initialize calendar sources when terms change
  React.useEffect(() => {
    const sources: CalendarSource[] = [
      // Personal calendar always at top
      {
        id: 'personal',
        name: 'Personal',
        type: 'personal',
        color: '#3b82f6',
        visible: true,
      }
    ];

    // Add terms and their courses
    terms.forEach(term => {
      sources.push({
        id: term.id,
        name: term.name,
        type: 'term',
        color: '#6b7280',
        visible: true,
      });

      term.courses.forEach(course => {
        sources.push({
          id: course.id,
          name: course.code,
          type: 'course',
          color: course.color,
          visible: true,
          termId: term.id,
          courseId: course.id,
        });
      });
    });

    setCalendarSources(sources);
    
    // Initialize expanded terms - expand current terms by default
    const currentTermIds = new Set(
      terms
        .filter(term => {
          const now = new Date();
          return now >= term.startDate && now <= term.endDate;
        })
        .map(term => term.id)
    );
    setExpandedTerms(currentTermIds);
  }, [terms]);

  // Combine database events with mock events
  const allEvents = useMemo(() => {
    // Convert database events to CalendarEvent format
    const convertedDbEvents: CalendarEvent[] = dbEvents.map((dbEvent: any) => ({
      id: dbEvent._id,
      title: dbEvent.title,
      type: dbEvent.type,
      startTime: new Date(dbEvent.startTime),
      endTime: dbEvent.endTime ? new Date(dbEvent.endTime) : undefined,
      color: dbEvent.color,
      courseCode: dbEvent.courseCode,
      location: dbEvent.location,
      description: dbEvent.description,
      isAllDay: dbEvent.isAllDay,
      attendees: dbEvent.attendees,
      meetingUrl: dbEvent.meetingUrl,
      meetingType: dbEvent.meetingType,
    }));

    // Combine with mock events (filter out duplicates by ID)
    const combinedEvents = [...convertedDbEvents];
    events.forEach(mockEvent => {
      if (!convertedDbEvents.find(dbEvent => dbEvent.id === mockEvent.id)) {
        combinedEvents.push(mockEvent);
      }
    });

    return combinedEvents;
  }, [dbEvents, events]);

  // Handle URL parameters for event selection and add event modal
  useEffect(() => {
    const eventId = searchParams.get('event');
    const hasAddEvent = searchParams.get('addEvent') !== null;
    
    if (eventId) {
      const event = allEvents.find(e => e.id === eventId);
      if (event) {
        openEventDetailsModal(event);
      }
    } else if (hasAddEvent) {
      // Parse initial date and hour from URL if provided
      const dateParam = searchParams.get('date');
      const hourParam = searchParams.get('hour');
      
      const initialDate = dateParam ? new Date(dateParam) : new Date();
      const initialHour = hourParam ? parseInt(hourParam, 10) : undefined;
      
      openAddEventModal(initialDate, initialHour);
    }
    // Modal closing is handled by the modal providers checking URL changes
  }, [searchParams, allEvents, openEventDetailsModal, openAddEventModal]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const url = new URL(window.location.href);
      const eventId = url.searchParams.get('event');
      
      if (eventId) {
        const foundEvent = allEvents.find(e => e.id === eventId);
        if (foundEvent) {
          openEventDetailsModal(foundEvent);
        }
      }
      // Modal provider will handle closing when no event ID
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allEvents, openEventDetailsModal]);

  // Toggle calendar source visibility
  const toggleCalendarSource = (sourceId: string) => {
    setCalendarSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, visible: !source.visible }
          : source
      )
    );
  };

  // Toggle term expansion
  const toggleTermExpansion = (termId: string) => {
    setExpandedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(termId)) {
        newSet.delete(termId);
      } else {
        newSet.add(termId);
      }
      return newSet;
    });
  };


  // Handle event selection with URL routing
  const handleEventSelect = (event: CalendarEvent) => {
    // Update URL without page reload using browser history API
    const newUrl = `/calendar?event=${event.id}`;
    window.history.pushState({ eventId: event.id }, '', newUrl);
    
    // Open the modal
    openEventDetailsModal(event);
    onEventClick?.(event);
  };

  // Convert our view types to React Big Calendar view types
  const mapViewToBigCalendar = (view: NotionCalendarView): View => {
    switch (view) {
      case 'day':
        return Views.DAY;
      case 'week':
        return Views.WEEK;
      case 'month':
        return Views.MONTH;
      default:
        return Views.WEEK;
    }
  };

  // Filter events based on visible calendar sources
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Check if this event's calendar source is visible
      if (event.courseCode) {
        // This is a course-related event (class, assignment, exam, office-hours)
        // Check if the course is visible
        const courseSource = calendarSources.find(source => 
          source.type === 'course' && source.name === event.courseCode
        );
        return courseSource ? courseSource.visible : true; // Show by default if source not found
      } else {
        // This is a personal event (meetings, personal appointments, etc.)
        // Check if personal calendar is visible
        const personalSource = calendarSources.find(source => source.type === 'personal');
        return personalSource ? personalSource.visible : true; // Show by default if source not found
      }
    });
  }, [allEvents, calendarSources]);

  // Convert our filtered events to React Big Calendar format
  const bigCalendarEvents = useMemo(() => {
    return filteredEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime || event.startTime,
      allDay: event.isAllDay || false,
      resource: event, // Store original event data
    }));
  }, [filteredEvents]);

  // Handle date navigation
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // Handle event selection from BigCalendar
  const handleSelectEvent = (event: any) => {
    if (event.resource) {
      handleEventSelect(event.resource);
    }
  };

  // Handle slot selection (for adding events) with URL routing
  const handleSelectSlot = (slotInfo: any) => {
    const hour = slotInfo.start.getHours();
    
    // Update URL without page reload using browser history API
    const newUrl = `/app/v1/calendar?addEvent=true&date=${slotInfo.start.toISOString()}&hour=${hour}`;
    window.history.pushState({ addEvent: true, date: slotInfo.start.toISOString(), hour }, '', newUrl);
    
    // Open the modal
    openAddEventModal(slotInfo.start, hour);
    onAddEvent?.(slotInfo.start, hour);
  };

  // Generate mini calendar for sidebar
  const generateMiniCalendar = () => {
    const today = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = currentMonth.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.miniCalendarEmpty}></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === currentDate.toDateString();
      
      days.push(
        <button
          key={day}
          className={`${styles.miniCalendarDay} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
          onClick={() => handleNavigate(date)}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  // Custom event component
  const EventComponent = ({ event }: any) => {
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
          return <Video size={9} />;
        case 'zoom':
          return <Video size={9} />;
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
        onClick={() => handleEventSelect(originalEvent)}
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
        
        {(originalEvent.attendees || originalEvent.meetingUrl) && (
          <div className={styles.eventMeetingInfo}>
            {originalEvent.attendees && originalEvent.attendees.length > 0 && (
              <div className={styles.eventAvatars}>
                {originalEvent.attendees.slice(0, 2).map((attendee, index) => (
                  <div key={index} className={styles.eventAvatar} title={attendee.name}>
                    {attendee.initials}
                  </div>
                ))}
                {originalEvent.attendees.length > 2 && (
                  <div className={styles.eventAvatar} title={`+${originalEvent.attendees.length - 2} more`}>
                    +{originalEvent.attendees.length - 2}
                  </div>
                )}
              </div>
            )}
            
            {originalEvent.meetingUrl && (
              <div className={styles.meetingIndicator}>
                {getMeetingIcon(originalEvent.meetingType)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const formatSelectedDate = () => {
    return currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className={`${styles.notionCalendar} ${className || ''}`}>
      {/* Left Sidebar */}
      <div className={styles.sidebar}>

        {/* Mini Calendar */}
        <div className={styles.miniCalendarSection}>
          <div className={styles.miniCalendarHeader}>
            <button onClick={() => handleNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
              <ChevronLeft size={16} />
            </button>
            <h3>{formatSelectedDate()}</h3>
            <button onClick={() => handleNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className={styles.miniCalendarGrid}>
            <div className={styles.miniCalendarDayHeaders}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className={styles.miniCalendarDayHeader}>{day}</div>
              ))}
            </div>
            <div className={styles.miniCalendarDays}>
              {generateMiniCalendar()}
            </div>
          </div>
        </div>

        {/* Calendar List */}
        <div className={styles.calendarList}>
          
          {calendarSources.map(source => {
            const isTermHeader = source.type === 'term';
            const isCourse = source.type === 'course';
            const isTermExpanded = expandedTerms.has(source.id);
            
            // Only show courses if their term is expanded
            const shouldShowCourse = !isCourse || (isCourse && source.termId && expandedTerms.has(source.termId));
            
            if (!shouldShowCourse && isCourse) {
              return null;
            }
            
            return (
              <div key={source.id}>
                {source.type === 'personal' && (
                  <div 
                    className={`${styles.calendarItem} ${styles.personalCalendar}`}
                    onClick={() => toggleCalendarSource(source.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={source.visible} 
                      onChange={() => {}} 
                      className={styles.calendarCheckbox}
                    />
                    <div className={styles.calendarColor} style={{ backgroundColor: source.color }}></div>
                    <span className={styles.calendarName}>Personal</span>
                    <span className={styles.calendarStatus}>Default</span>
                  </div>
                )}
                
                {isTermHeader && (
                  <button 
                    className={`${styles.termHeader} ${styles.termHeaderButton}`}
                    onClick={() => toggleTermExpansion(source.id)}
                  >
                    <ChevronDown 
                      size={14} 
                      className={`${styles.termChevron} ${isTermExpanded ? styles.expanded : ''}`}
                    />
                    <span className={styles.termName}>{source.name}</span>
                  </button>
                )}
                
                {isCourse && (
                  <div 
                    className={`${styles.calendarItem} ${styles.courseItem}`}
                    onClick={() => toggleCalendarSource(source.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={source.visible} 
                      onChange={() => {}} 
                      className={styles.calendarCheckbox}
                    />
                    <div className={styles.calendarColor} style={{ backgroundColor: source.color }}></div>
                    <span className={styles.calendarName}>{source.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Calendar */}
      <div className={styles.mainCalendar}>
        {/* Header */}
        <div className={styles.calendarHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.viewSwitcher}>
              {(['week', 'day', 'month'] as NotionCalendarView[]).map((view) => (
                <button
                  key={view}
                  className={`${styles.viewButton} ${currentView === view ? styles.active : ''}`}
                  onClick={() => setCurrentView(view)}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            <button className={styles.todayButton} onClick={() => handleNavigate(new Date())}>
              Today
            </button>
            <div className={styles.dateNavigation}>
              <button onClick={() => {
                const newDate = new Date(currentDate);
                if (currentView === 'day') {
                  newDate.setDate(currentDate.getDate() - 1);
                } else if (currentView === 'week') {
                  newDate.setDate(currentDate.getDate() - 7);
                } else {
                  newDate.setMonth(currentDate.getMonth() - 1);
                }
                handleNavigate(newDate);
              }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => {
                const newDate = new Date(currentDate);
                if (currentView === 'day') {
                  newDate.setDate(currentDate.getDate() + 1);
                } else if (currentView === 'week') {
                  newDate.setDate(currentDate.getDate() + 7);
                } else {
                  newDate.setMonth(currentDate.getMonth() + 1);
                }
                handleNavigate(newDate);
              }}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.addButton} onClick={() => {
              // Update URL and open modal
              const newUrl = `/app/v1/calendar?addEvent=true`;
              window.history.pushState({ addEvent: true }, '', newUrl);
              openAddEventModal(new Date());
            }}>
              <Plus size={16} />
              Add Event
            </button>
            <Settings size={20} />
          </div>
        </div>

        {/* Big Calendar */}
        <div className={styles.bigCalendarContainer}>
          <ErrorBoundary>
            <BigCalendar
              localizer={localizer}
              events={bigCalendarEvents}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              view={mapViewToBigCalendar(currentView)}
              onNavigate={handleNavigate}
              onView={() => {}} // We handle view changes with our own buttons
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              components={{
                toolbar: () => null, // We use our own toolbar
                event: EventComponent,
              }}
              step={30}
              timeslots={2}
              showMultiDayTimes
              views={{
                month: true,
                week: true,
                day: true,
              }}
              formats={{
                timeGutterFormat: 'h A',
                dayHeaderFormat: 'ddd M/D',
              }}
              min={new Date(0, 0, 0, 0, 0, 0)}
              max={new Date(0, 0, 0, 23, 59, 59)}
              scrollToTime={new Date(0, 0, 0, 8, 0, 0)}
              className={styles.bigCalendar}
            />
          </ErrorBoundary>
        </div>
      </div>

    </div>
  );
}

export default NotionCalendar;
