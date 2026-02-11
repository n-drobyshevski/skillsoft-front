# Assessment Questions - New Question Flow

## Overview
The new question creation flow has been enhanced to provide a better user experience when creating assessment questions, especially when behavioral indicator IDs are not pre-selected.

## Flow Description

### 1. Direct Access (with IDs)
When users navigate to `/assessment-questions/new?competencyId=X&behavioralIndicatorId=Y`, they proceed directly to the question form.

### 2. Indicator Selection (without IDs)
When users navigate to `/assessment-questions/new` without the required IDs, they see the IndicatorSelector component which allows them to:

- **Filter by Competency**: Dropdown to filter indicators by specific competencies
- **Search**: Real-time search across indicator titles, descriptions, and competency names
- **Select**: Click to select an indicator from the filtered list
- **Continue**: Proceed to the question form with the selected indicator

### 3. Mobile Responsiveness
The indicator selector is fully mobile-responsive with:
- Responsive grid layout for filters
- Touch-friendly selection interface
- Mobile-optimized buttons and spacing
- Proper overflow handling for long lists

## Technical Implementation

### Components Added
- `IndicatorSelector.tsx`: Main selector component with filtering and search
- Enhanced `page.tsx`: Conditional rendering based on URL parameters

### Key Features
- **State Management**: Uses React hooks to manage selection state
- **URL Synchronization**: Updates URL parameters when indicator is selected
- **API Integration**: Fetches competencies and indicators from the backend
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Proper loading indicators during data fetching

### Mobile Enhancements
- Responsive layout using Tailwind CSS grid system
- Touch-friendly interaction targets
- Proper text truncation and overflow handling
- Mobile-first design approach

## Usage Examples

1. **Create Question with Pre-selected Indicator**:
   ```
   /assessment-questions/new?competencyId=123&behavioralIndicatorId=456
   ```

2. **Create Question with Indicator Selection**:
   ```
   /assessment-questions/new
   ```

3. **From Assessment Questions Page**:
   Click the "Create Question" button in the page header