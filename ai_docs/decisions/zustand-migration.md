# Zustand Migration Plan

## Motivation
The application currently uses React Context for state management, which is causing performance issues due to unnecessary re-renders. Context triggers re-renders in all consuming components when any part of the context value changes.

Zustand offers a more granular approach to state updates, allowing components to subscribe only to the specific parts of state they need.

## Goals
- Improve application performance by reducing unnecessary re-renders
- Enable more granular state updates
- Maintain the existing functionality and user experience
- Allow for incremental adoption without breaking changes

## Implementation Strategy
We'll implement the migration incrementally, starting with the most performance-critical parts of the application. This allows us to validate the performance improvements at each step and ensure nothing breaks.

### Phase 1: Student Management (High Priority)
Students data is the most performance-critical part of the application since it changes frequently and impacts many components.

1. Create a `useStudentStore` with the following features:
   - State: student list, selection state, drag state
   - Actions: CRUD operations, selection management, drag-and-drop
   - Computed values: selected count, etc.
   
2. Integrate with key components:
   - StudentList
   - StudentCard
   - PointsCounter

### Phase 2: Tab Management (Medium Priority)
Tabs dictate which students are shown and impact the overall application state.

1. Create a `useTabStore` with:
   - State: tabs list, active tab
   - Actions: CRUD operations, tab switching
   - Connection to student data for tab-specific operations

2. Integrate with components:
   - TabList
   - TabCard
   - TabOptionsRow

### Phase 3: Supporting Stores (Medium Priority)
Create additional stores for other features:

- ✅ `useModalStore` - For modal management
- ✅ `useSoundStore` - For sound effects
- ✅ `useBankStore` - For banked points
- ✅ `useAppOptionsStore` - For application settings

### Phase 4: Complete Migration (Lower Priority)
Replace all Context usage with Zustand stores:

1. Update all remaining components to use Zustand
2. Remove Context providers
3. Clean up unused Context files

## Performance Optimizations

### Specific optimizations for StudentStore
- Use `useShallow` for array comparisons to prevent unnecessary re-renders
- Implement selective updates that only affect changed students
- Use the Zustand selector pattern to access only needed state properties
- Add `immer` middleware for easier state updates if complex nested state becomes an issue

### Key bindings handling
- Implement a custom hook `useZustandKeyBindings` that manages key events
- Only update specific students when their assigned keys are pressed
- Allow for modifier keys (shift) without re-rendering unaffected components

## Implementation Notes

1. Ensure backwards compatibility during transition
2. Add tests for new stores
3. Measure and document performance improvements
4. Consider adding devtools middleware for debugging

## Expected Benefits
- Reduced render frequency for student cards (only when their specific data changes)
- Faster UI response during keyboard interactions
- Smoother drag and drop experience
- Better isolation between features 