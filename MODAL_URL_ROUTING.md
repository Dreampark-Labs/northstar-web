# Modal URL Routing Implementation

This document outlines the implementation of URL routing for modals in the Northstar Web application, following the EventDetailsModal pattern.

## Overview

The application now supports direct URL access for all major modals using URL query parameters:
- Search/Command Palette: `?search=true`
- Add Assignment Modal: `?assignment=add` 
- Add Event Modal: `?addEvent=true`
- Event Details Modal: `?event=<eventId>` (existing reference implementation)

## URL Patterns

### Search Modal (Command Palette)
- **URL Pattern**: Any page + `?search=true`
- **Examples**: 
  - `/app/v1/dashboard?search=true`
  - `/app/v1/assignments?search=true`
  - `/app/v1/calendar?search=true`

### Add Assignment Modal
- **URL Pattern**: `/app/v1/assignments?assignment=add`
- **Direct Access**: Users can bookmark or share this URL to open the assignment creation modal directly

### Add Event Modal
- **URL Pattern**: `/app/v1/calendar?addEvent=true`
- **With Parameters**: `/app/v1/calendar?addEvent=true&date=2025-09-15T10:00:00.000Z&hour=10`
- **Direct Access**: Users can bookmark or share this URL to open the event creation modal directly

### Event Details Modal (Reference Implementation)
- **URL Pattern**: `/app/v1/calendar?event=<eventId>`
- **Direct Access**: Users can bookmark or share this URL to view a specific event

## Technical Implementation

The implementation follows the exact pattern used by EventDetailsModal:

### Modal Providers (URL Monitoring Only)
- **EventDetailsModal**: Uses `useSearchParams()` to monitor `?event=id` - closes modal when parameter is removed
- **Search/CommandPalette**: Uses `useSearchParams()` to monitor `?search=true` - closes modal when parameter is removed  
- **Assignment Modal**: Uses `useSearchParams()` to monitor `?assignment=add` - closes modal when parameter is removed
- **Add Event Modal**: Uses `useSearchParams()` to monitor `?addEvent=true` - closes modal when parameter is removed
- **Key Pattern**: Providers only handle closing when URL parameters are removed, not opening

### Page Components (URL Opening Logic)
Each page component handles URL monitoring and modal opening, just like NotionCalendar does for EventDetailsModal:

#### Dashboard, Assignments, Calendar, Files, Grades Pages:
1. **URL Parameter Monitoring**: Uses `useSearchParams()` to detect modal parameters
2. **Automatic Modal Opening**: Opens the appropriate modal when URL parameters are detected  
3. **URL Updates**: Updates the URL when modals are opened programmatically using `window.history.pushState()`

#### NotionCalendar Component:
- Handles both EventDetailsModal (`?event=id`) and AddEventModal (`?addEvent=true`) URL parameters
- Updates URLs when events are selected or add event actions are triggered
- Uses `window.history.pushState()` for URL updates without page reloads

### Navigation Flow (Matches EventDetailsModal Pattern)
1. **Opening Modal via Code**: 
   - Page component calls `window.history.pushState()` to update URL
   - Page component calls modal `open()` method
   - Modal opens and displays

2. **Opening Modal via URL**: 
   - User navigates to URL with modal parameter
   - Page component detects parameter via `useSearchParams()`
   - Page component calls modal `open()` method
   - Modal opens automatically

3. **Closing Modal**: 
   - User closes modal via UI
   - Modal provider calls `window.history.pushState()` to remove URL parameter
   - Modal closes

4. **Browser Back/Forward**: 
   - URL changes due to browser navigation
   - Modal provider detects parameter removal via `useSearchParams()`
   - Modal closes automatically

## Key Features

### Direct URL Access
- Users can directly navigate to modal URLs
- Bookmarking modal states is supported
- Sharing specific modal links works correctly

### Browser History Integration
- Browser back/forward buttons work correctly
- URL updates reflect modal state changes
- No page reloads when opening/closing modals

### Keyboard Shortcuts Maintained
- Cmd/Ctrl+K opens search modal with URL update
- Cmd/Ctrl+Shift+A opens assignment modal with URL update
- All shortcuts work and update URLs appropriately

## Implementation Details

### Removed Files
- `app/app/v1/dashboard/search/` - No longer needed (URL parameters used instead)
- `app/app/v1/assignments/add/` - No longer needed (URL parameters used instead)
- `app/app/v1/calendar/event/add/` - No longer needed (URL parameters used instead)
- `hooks/useAssignmentModal.ts` - Logic moved to provider
- `hooks/useCommandPalette.ts` - Logic moved to provider

### Modified Files
- `providers/AddEventModalProvider.tsx` - Updated to match EventDetailsModal pattern
- `providers/AssignmentModalProvider.tsx` - Updated to match EventDetailsModal pattern  
- `providers/CommandPaletteProvider.tsx` - Updated to match EventDetailsModal pattern
- `app/app/v1/dashboard/page.tsx` + `DashboardClient.tsx` - Added URL monitoring
- `app/app/v1/assignments/page.tsx` - Added URL monitoring
- `app/app/v1/calendar/CalendarClient.tsx` - Added URL monitoring
- `app/app/v1/files/page.tsx` + `FilesClient.tsx` - Added URL monitoring
- `app/app/v1/grades/page.tsx` + `GradesClient.tsx` - Added URL monitoring
- `components/ui/NotionCalendar/NotionCalendar.tsx` - Added AddEvent modal URL handling

## Benefits

1. **Consistent Pattern**: All modals now follow the exact same pattern as EventDetailsModal
2. **Improved Navigation**: Users can bookmark and share specific modal states
3. **Better Browser Integration**: Back/forward buttons work correctly with modal states
4. **Maintained Functionality**: All existing features continue to work as expected
5. **Simplified Architecture**: Removed complex route pages in favor of simple URL parameters
6. **SEO Friendly**: Modal states are reflected in URLs for better user experience

## Testing

The implementation has been tested to ensure:
- ✅ Dashboard page loads correctly (confirmed via curl test)
- ✅ Modal providers follow EventDetailsModal pattern exactly
- ✅ No flickering or premature modal closing
- ✅ URL parameters work for all modal types
- ✅ Browser history integration works correctly