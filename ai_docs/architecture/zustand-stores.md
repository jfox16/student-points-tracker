# Zustand Store Architecture

## Overview

This application uses Zustand for state management, which offers several benefits over React Context:

1. **Performance** - Only re-renders components that use specific parts of state
2. **Simplicity** - No provider components needed, just import the hooks
3. **Granularity** - Components can subscribe to only the parts of state they need

## Store Organization

| Store | Purpose | Persisted |
|-------|---------|-----------|
| `useStudentStore` | Manages student data and operations | Yes |
| `useTabStore` | Handles tabs and active tab selection | Yes |
| `useAppOptionsStore` | Manages application settings | Yes |
| `useModalStore` | Controls modal dialogs | No |
| `useSoundStore` | Manages sound effects | Yes |
| `useBankStore` | Tracks banked/saved points | Yes |

## Store Implementation Pattern

Each store follows a consistent pattern:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SomeState {
  // State properties
  someData: SomeType[];
  
  // Computed values (optional)
  get derivedValue() { /* derived from state */ }
  
  // Actions
  setSomeData: (data: SomeType[]) => void;
  addSomeData: (data: SomeType) => void;
  // ... more actions
}

export const useSomeStore = create<SomeState>()(
  persist(
    (set, get) => ({
      // Initial state
      someData: [],
      
      // Computed values
      get derivedValue() {
        return get().someData.length;
      },
      
      // Actions
      setSomeData: (data) => set({ someData: data }),
      addSomeData: (data) => set((state) => ({ 
        someData: [...state.someData, data] 
      })),
      // ... more actions
    }),
    { name: 'storage-key' } // Persistence configuration
  )
);
```

## Store Details

### useStudentStore

The student store is the most performance-critical store in the application. It manages all student data, including:

- Students list
- Selection state
- Drag-and-drop state
- Key bindings for keyboard shortcuts

**Key optimizations:**
- Uses selective updates to only modify the specific students that change
- Maintains animation sets outside the store to avoid re-renders
- Provides computed values for selection counts

**Example usage:**
```typescript
const { students, addStudent, updateStudent } = useStudentStore();
```

### useTabStore

The tab store manages tabs and the active tab selection:

- List of tabs
- Active tab selection
- Tab CRUD operations

**Example usage:**
```typescript
const { tabs, activeTab, setActiveTab } = useTabStore();
```

### useAppOptionsStore

Manages application settings:

- Column count
- Order settings
- Keyboard settings
- Sound settings

**Example usage:**
```typescript
const { appOptions, updateAppOptions } = useAppOptionsStore();
```

### useModalStore

Controls modal dialog display and interactions:

- Modal visibility
- Modal content
- Confirmation actions

**Example usage:**
```typescript
const { openModal, closeModal } = useModalStore();

// Open a modal
openModal({
  title: 'Confirm Action',
  content: 'Are you sure?',
  onConfirm: () => doSomething(),
  confirmText: 'Yes',
  cancelText: 'No'
});
```

### useSoundStore

Manages sound effects and their settings:

- Sound enabled/disabled
- Sound variants
- Play sound function

**Example usage:**
```typescript
const { playSound } = useSoundStore();
playSound('add');
```

### useBankStore

Tracks banked/saved points for students:

- Points banked by student ID
- Sidebar visibility
- Point deposit/withdrawal functions

**Example usage:**
```typescript
const { bankedPoints, incrementBankedPoints } = useBankStore();
```

## Integration Patterns

### Components that need multiple stores

Many components will need data from multiple stores. Simply import the necessary hooks:

```typescript
function MyComponent() {
  const { activeTab } = useTabStore();
  const { students } = useStudentStore();
  
  // Now you can use both activeTab and students
}
```

### Using selectors for performance

For better performance, use selectors to only access the specific state you need:

```typescript
// This component will only re-render when studentCount changes
function StudentCounter() {
  const studentCount = useStudentStore(state => state.students.length);
  return <div>Total students: {studentCount}</div>;
}
```

### Integrating with effects

You can watch for store changes in effects:

```typescript
useEffect(() => {
  // This effect runs whenever activeTab changes
  loadStudentsForTab(activeTab.id);
}, [activeTab.id]);
``` 