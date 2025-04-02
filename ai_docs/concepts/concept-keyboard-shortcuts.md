# Keyboard Shortcuts

## Overview
The keyboard shortcut system provides quick access to common actions in the Student Points Tracker application, particularly for point management and student selection.

## Core Features

### Point Management Shortcuts
- Space bar: Add 1 point to all students or selected students
- Shift + Space bar: Subtract 1 point from all students or selected students
- Number keys (1-0): Add 1 point to specific student
- Shift + Number keys (1-0): Subtract 1 point from specific student
- Letter keys (Q-P, A-L, Z-M): Add 1 point to specific student
- Shift + Letter keys (Q-P, A-L, Z-M): Subtract 1 point from specific student
- Keys are mapped based on student position in grid

### Shortcut Display
- Keyboard shortcuts are shown on student cards when enabled
- Keys are displayed in uppercase
- Empty space shown when no shortcut assigned
- Shortcuts update when student order changes

## Technical Implementation

### Key Mapping System
```typescript
interface UseStudentKeyBindingsProps {
  columns: number;
  students: Student[];
  addPointsToStudent: (id: string, points: number) => void;
  addPointsToAllStudents: (points: number) => void;
}
```

### Key Layout
```
1234567890
QWERTYUIOP
ASDFGHJKL;
ZXCVBNM,./
```

### Key Assignment Rules
1. Keys are assigned based on student position in grid
2. Row and column determine key assignment
3. Keys are only assigned if:
   - No students are selected, or
   - The student is selected
4. Keys are case-insensitive
5. Shift key modifies point operations to subtract instead of add
6. Other modifier keys (Ctrl, Alt) disable shortcuts

## Related Concepts
- [Student Management](./concept-student-management.md)
- [Points System](./concept-points-system.md)
- [UI Components](./arch-ui-components.md)

## AI Notes
- Consider adding custom key mappings
- Implement shortcut conflict detection
- Add visual feedback for key presses
- Consider adding shortcut categories
- Implement shortcut help overlay
- Consider adding visual indicator for shift key state

## Last Updated
2024-04-02

## References
- `src/hooks/useStudentKeyBindings.tsx`
- `src/components/StudentCard/StudentCard.tsx`
- `src/context/StudentContext.tsx`
- `src/components/AppHeader/InfoModal.tsx` 