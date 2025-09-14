import { type CalendarEvent } from '@/components/ui/Calendar';

// Color palette for different courses/event types
const EVENT_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange-red
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

// Assignment priority colors
const PRIORITY_COLORS = {
  high: '#ef4444',    // Red
  medium: '#f59e0b',  // Orange
  low: '#10b981',     // Green
};

// Course-based color assignment
const courseColorMap = new Map<string, string>();

export function getCourseColor(courseCode: string): string {
  if (!courseColorMap.has(courseCode)) {
    const colorIndex = courseColorMap.size % EVENT_COLORS.length;
    courseColorMap.set(courseCode, EVENT_COLORS[colorIndex]);
  }
  return courseColorMap.get(courseCode)!;
}

export function getAssignmentPriority(dueDate: Date): 'high' | 'medium' | 'low' {
  const now = new Date();
  const timeDiff = dueDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff <= 1) return 'high';
  if (daysDiff <= 7) return 'medium';
  return 'low';
}

// Convert course meeting times to calendar events
export function courseToCalendarEvents(course: {
  _id: string;
  title: string;
  code: string;
  meetingDays?: string[];
  meetingStart?: string;
  meetingEnd?: string;
  instructor?: string;
}, startDate: Date, endDate: Date): CalendarEvent[] {
  if (!course.meetingDays || !course.meetingStart || !course.meetingEnd) {
    return [];
  }

  const events: CalendarEvent[] = [];
  const dayMap: { [key: string]: number } = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };

  // Parse time strings (format: "HH:MM")
  const [startHour, startMinute] = course.meetingStart.split(':').map(Number);
  const [endHour, endMinute] = course.meetingEnd.split(':').map(Number);

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
    
    if (dayName && course.meetingDays.includes(dayName)) {
      const eventStart = new Date(current);
      eventStart.setHours(startHour, startMinute, 0, 0);
      
      const eventEnd = new Date(current);
      eventEnd.setHours(endHour, endMinute, 0, 0);

      events.push({
        id: `${course._id}-${current.toISOString().split('T')[0]}`,
        title: course.title,
        type: 'class',
        startTime: eventStart,
        endTime: eventEnd,
        color: getCourseColor(course.code),
        courseCode: course.code,
        description: course.instructor ? `Instructor: ${course.instructor}` : undefined,
      });
    }
    
    current.setDate(current.getDate() + 1);
  }

  return events;
}

// Convert assignments to calendar events
export function assignmentToCalendarEvent(assignment: {
  _id: string;
  title: string;
  dueAt: number;
  status: 'todo' | 'done';
  notes?: string;
}, course?: {
  code: string;
  title: string;
}): CalendarEvent {
  const dueDate = new Date(assignment.dueAt);
  const priority = getAssignmentPriority(dueDate);
  
  return {
    id: assignment._id,
    title: assignment.title,
    type: 'assignment',
    startTime: dueDate,
    color: course ? getCourseColor(course.code) : PRIORITY_COLORS[priority],
    courseCode: course?.code,
    description: assignment.notes,
    isAllDay: true, // Assignments are typically all-day events
  };
}

// Generate recurring events for a course schedule
export function generateRecurringEvents(
  course: {
    _id: string;
    title: string;
    code: string;
    meetingDays?: string[];
    meetingStart?: string;
    meetingEnd?: string;
    instructor?: string;
  },
  termStart: string,
  termEnd: string
): CalendarEvent[] {
  const startDate = new Date(termStart);
  const endDate = new Date(termEnd);
  
  return courseToCalendarEvents(course, startDate, endDate);
}

// Filter events by date range
export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = event.startTime;
    return eventDate >= startDate && eventDate <= endDate;
  });
}

// Get events for today
export function getTodaysEvents(events: CalendarEvent[]): CalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  return filterEventsByDateRange(events, today, tomorrow);
}

// Get events for this week
export function getThisWeeksEvents(events: CalendarEvent[]): CalendarEvent[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  return filterEventsByDateRange(events, startOfWeek, endOfWeek);
}

// Sort events by start time
export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Group events by date
export function groupEventsByDate(events: CalendarEvent[]): { [date: string]: CalendarEvent[] } {
  return events.reduce((groups, event) => {
    const dateKey = event.startTime.toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as { [date: string]: CalendarEvent[] });
}

// Get upcoming assignments (due within next 7 days)
export function getUpcomingAssignments(events: CalendarEvent[]): CalendarEvent[] {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  
  return events
    .filter(event => 
      event.type === 'assignment' && 
      event.startTime >= now && 
      event.startTime <= nextWeek
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Check for schedule conflicts
export function findScheduleConflicts(events: CalendarEvent[]): CalendarEvent[][] {
  const conflicts: CalendarEvent[][] = [];
  const sortedEvents = sortEventsByTime(events.filter(e => !e.isAllDay));
  
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    if (current.endTime && 
        current.startTime.toDateString() === next.startTime.toDateString() &&
        current.endTime > next.startTime) {
      conflicts.push([current, next]);
    }
  }
  
  return conflicts;
}

export default {
  getCourseColor,
  getAssignmentPriority,
  courseToCalendarEvents,
  assignmentToCalendarEvent,
  generateRecurringEvents,
  filterEventsByDateRange,
  getTodaysEvents,
  getThisWeeksEvents,
  sortEventsByTime,
  groupEventsByDate,
  getUpcomingAssignments,
  findScheduleConflicts,
};
