# Student Management

## Overview
The student management system handles the creation, organization, and manipulation of student records in the Student Points Tracker application.

## Core Features

### Student Operations
- Add new students
- Delete students
- Update student information
- Move students (drag and drop reordering)
- Select/deselect students
- Reverse student order

### Student Display
- Grid-based layout
- Configurable number of columns
- Drag and drop reordering
- Keyboard shortcut indicators
- Selection highlighting

### Student Data
- Unique ID
- Name
- Points
- Selection state
- Position in list

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
- `StudentCard`: Displays individual student information
- `StudentList`: Manages the grid of student cards
- `StudentContext`: Handles student state and operations
- `TabContext`: Manages multiple student lists (tabs)

### Student Operations
```typescript
// Add a new student
addStudent()

// Delete a student
deleteStudent(id: string)

// Update student information
updateStudent(id: string, changes: Partial<Student>)

// Update all students
updateAllStudents(changes: Partial<Student>)

// Move student position
moveStudent(fromIndex: number, toIndex: number)

// Reverse student order
reverseStudentOrder()
```

## Related Concepts
- [Points System](./concept-points-system.md)
- [Keyboard Shortcuts](./concept-keyboard-shortcuts.md)
- [Tab Management](./concept-tab-management.md)

## AI Notes
- Consider adding student groups or sections
- Implement student import/export
- Add student statistics and analytics
- Consider adding student notes or comments
- Implement student search/filter functionality

## Last Updated
2024-04-01

## References
- `src/components/StudentCard/StudentCard.tsx`
- `src/components/StudentList/StudentList.tsx`
- `src/context/StudentContext.tsx`
- `src/context/TabContext.tsx` 