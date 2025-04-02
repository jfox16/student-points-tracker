# Zustand Store Architecture

## Overview

This document describes the architecture of our Zustand store implementation for the Student Points Tracker application. Zustand provides a lightweight, unopinionated state management solution that helps eliminate unnecessary re-renders and simplifies our codebase.

## Store Structure

We've organized the application state into logical stores, each responsible for a specific domain:

| Store | Purpose | Persisted? |
|-------|---------|------------|
| `useTabStore` | Manages tabs and tab options | Yes |
| `useStudentStore` | Manages student data and operations | Yes (per tab) |
| `useAppOptionsStore` | Handles application settings | Yes |
| `useBankStore` | Manages banked points | Yes |
| `useModalStore` | Controls modal dialogs | No |
| `useSoundStore` | Handles sound effects | Partially |

## Store Details

### useTabStore

Manages tabs, their settings, and the active tab selection.

```typescript
{
  tabs: Tab[];
  activeTab: Tab;
  activeTabId: string;
  
  setActiveTabId: (id: string) => void;
  addTab: (tab?: Partial<Tab>) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  removeTab: (id: string) => void;
  // ...
}
```

### useStudentStore

Manages student data, including points, selection state, and key bindings.

```typescript
{
  students: Student[];
  keyBindingsMap: Record<string, string>;
  
  setStudents: (students: Student[]) => void;
  addStudent: (student?: Partial<Student>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  removeStudent: (id: string) => void;
  addPointsToStudent: (id: string, points: number) => void;
  addPointsToAllStudents: (points: number) => void;
  setKeyBindingsMap: (map: Record<string, string>) => void;
  // ...
}
```

### useAppOptionsStore

Manages application-wide settings.

```typescript
{
  appOptions: {
    enableKeybinds: boolean;
    pointSound: string;
    reverseOrder: boolean;
  };
  
  updateAppOptions: (updates: Partial<AppOptions>) => void;
}
```

### useBankStore

Manages the bank sidebar and banked points per student.

```typescript
{
  bankedPoints: {
    [tabId: string]: {
      [studentId: string]: number;
    }
  };
  sidebarVisible: boolean;
  
  setBankedPoints: (tabId: string, studentId: string, points: number) => void;
  incrementBankedPoints: (tabId: string, studentId: string, increment: number) => void;
  withdrawAllPoints: (tabId: string, studentId: string) => number;
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
}
```

### useModalStore

Manages modal dialog display and interactions.

```typescript
{
  isOpen: boolean;
  title: string;
  content: ReactNode | null;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  confirmText: string;
  cancelText: string;
  hideCancel: boolean;
  
  openModal: (options: {...}) => void;
  closeModal: () => void;
}
```

### useSoundStore

Manages sound effects and sound settings.

```typescript
{
  sounds: SoundMap;
  soundEnabled: boolean;
  
  playSound: (sound: SoundType) => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
}
```

## Store Integration

Stores can interact with each other for coordinated state changes. For example:

1. When a tab is selected in `useTabStore`, the students are loaded in `useStudentStore`
2. When a sound setting is changed in `useAppOptionsStore`, it affects sound playback in `useSoundStore`
3. When a student earns points, they can be banked using `useBankStore`

## Using Stores in Components

Using stores in components is straightforward:

```tsx
import { useTabStore } from '../stores/useTabStore';
import { useStudentStore } from '../stores/useStudentStore';

const MyComponent = () => {
  // Only access the specific state and actions you need
  const { activeTab } = useTabStore();
  const { addPointsToStudent } = useStudentStore();
  
  return (
    <div>
      <h1>{activeTab.name}</h1>
      <button onClick={() => addPointsToStudent('123', 1)}>
        Add Point
      </button>
    </div>
  );
};
```

## Benefits of Zustand Implementation

1. **Performance**: Components only re-render when their specific dependencies change
2. **Simplicity**: No provider components or context nesting
3. **Modularity**: State logic is organized by domain
4. **Persistence**: Built-in storage with flexible configuration
5. **TypeScript**: Full type safety across the application

## Testing Strategy

Stores can be tested in isolation:

```tsx
import { useTabStore } from './useTabStore';

describe('useTabStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useTabStore.setState({
      tabs: [],
      activeTabId: '',
      // ...initial state
    });
  });

  it('should add a tab', () => {
    const { addTab } = useTabStore.getState();
    addTab({ name: 'Test Tab' });
    
    const { tabs } = useTabStore.getState();
    expect(tabs.length).toBe(1);
    expect(tabs[0].name).toBe('Test Tab');
  });
});
``` 