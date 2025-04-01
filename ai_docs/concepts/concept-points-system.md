# Points System

## Overview
The points system is the core functionality of the Student Points Tracker application. It provides a simple way to track and modify points for students in a classroom setting.

## Core Features

### Point Management
- Add/remove points to individual students
- Add/remove points to all students at once
- Add/remove points to selected students
- Reset all points to zero
- Direct point value editing

### Point Display
- Points are displayed with dynamic colors based on value
- Color gradient from black (0) to gold (100+)
- Animated point changes
- Recent change indicators

### Point Input Methods
1. Click the "+" button to add 1 point
2. Direct number input
3. Keyboard shortcuts (if enabled)
4. Space bar to add points to all/selected students

## Technical Implementation

### Data Structure
```typescript
interface Student {
  id: string;
  name: string;
  points: number;
  selected?: boolean;
}
```

### Key Components
- `PointsCounter`: Handles point display and input
- `StudentContext`: Manages point state and operations
- `GroupSelectWidget`: Handles group point operations

### Point Operations
```typescript
// Add points to a single student
addPointsToStudent(id: string, points: number = 1)

// Add points to all students
addPointsToAllStudents(points: number = 1)

// Add points to selected students
addPointsToSelectedStudents(points: number = 1)

// Reset all points
updateAllStudents({ points: 0 })
```

## Related Concepts
- [Student Management](./concept-student-management.md)
- [Keyboard Shortcuts](./concept-keyboard-shortcuts.md)
- [UI Components](./arch-ui-components.md)

## AI Notes
- Consider adding point history tracking
- Add point categories or types
- Implement point statistics and analytics
- Add point export/import functionality
- Consider adding point goals or achievements

## Last Updated
2024-04-01

## References
- `src/components/StudentCard/PointsCounter/PointsCounter.tsx`
- `src/context/StudentContext.tsx`
- `src/components/TabOptionsRow/Widgets/ResetAllWidget.tsx` 