# Points Counter Component System

<!--
Last Updated: 2024-04-01
Updated By: AI Assistant
Changes Made:
- Initial documentation for PointsCounter component system
Reason for Changes:
Documentation needed to explain the component structure and key features of the points counter system.
-->

## Overview

The Points Counter is a composite component system that handles point management for students. It consists of three main components that work together to provide a rich user experience for point manipulation and display.

## Components

### 1. PointsCounter (Container)
- Main container component that orchestrates the point management system
- Manages state and business logic
- Handles animations and sound effects
- Coordinates between child components
- Key features:
  - Debounced click handling to prevent double-clicks
  - Sound effect coordination
  - Animation triggering
  - Recent change tracking

### 2. PointsButton
- Reusable button component for increment/decrement actions
- Props:
  - `onClick`: Handler for button clicks
  - `symbol`: "+" or "-" to indicate action
  - `disabled`: Optional state to prevent clicks
- Features:
  - Hover effects
  - Disabled state styling
  - Prevents text selection
  - Handles pointer events appropriately

### 3. PointsDisplay
- Manages the display of points and recent changes
- Props:
  - `points`: Current point value
  - `recentChange`: Optional value to show recent changes
  - `onChange`: Handler for direct point input
  - `animationTrigger`: Value to trigger animations
- Features:
  - Dynamic color based on point value
  - Recent change overlay
  - Pop animation on value changes
  - Negative value highlighting

## Key Features

### Animation System
- Uses CSS keyframes for pop animation
- Triggers on point changes
- Supports delayed animations for batch updates
- Smooth transitions for visual feedback

### Sound Effects
- Plays different sounds for:
  - Single point changes
  - Batch point changes
- Coordinated with animations

### Input Handling
- Supports both button clicks and direct number input
- Debounced click handling prevents accidental double-clicks
- Visual feedback for disabled state

### Visual Feedback
- Dynamic color gradient based on point value
- Recent change overlay with +/- indicators
- Hover effects on buttons
- Clear disabled states

## Technical Notes

### State Management
- Uses React's useState for local state
- Leverages useCallback for memoized handlers
- Implements useDebounce for click handling
- Uses usePrevious hook for change detection

### Performance Considerations
- Memoized color calculations
- Debounced handlers to prevent rapid-fire events
- Efficient animation triggering
- Optimized re-renders through proper prop passing

### Accessibility
- Clear visual feedback for interactions
- Proper disabled states
- Non-selectable text
- Appropriate cursor states

## Related Components
- StudentCard
- NumberInput
- SoundContext
- StudentContext

## Usage Example

```tsx
<PointsCounter
  student={student}
  index={studentIndex}
  className="custom-class"
/>
```

## Future Considerations
- Custom animation timing options
- Configurable sound effects
- Custom color gradient ranges
- Additional input validation
- Keyboard shortcut support 