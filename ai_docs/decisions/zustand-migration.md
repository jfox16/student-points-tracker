# Zustand Migration Plan

## Background

The Class Points Tracker application currently uses React Context for state management, with multiple nested providers. While this works, it has some limitations:

1. Performance issues due to unnecessary re-renders
2. Deep nesting of providers adds complexity
3. Prop drilling in some components
4. Difficult to test components in isolation

## Solution: Zustand

Zustand is a simple, lightweight state management library that offers several advantages:

1. **Minimalist API** - Simple to learn and use
2. **No Provider components** - Access state directly where needed
3. **Improved performance** - Only re-renders components that use specific parts of state
4. **Built-in persistence** - Easy to save state to localStorage
5. **TypeScript support** - Fully typed API

## Migration Strategy

We'll implement a gradual migration strategy to minimize risk:

### Phase 1: Create Zustand Stores ✅

1. Create equivalent Zustand stores for each Context:
   - ✅ `useTabStore` - For tab management
   - ✅ `useStudentStore` - For student data
   - ✅ `useAppOptionsStore` - For app options 
   - ⬜ `useBankStore` - For banked points
   - ⬜ `useModalStore` - For modal management
   - ⬜ `useSoundStore` - For sound effects

2. Each store should:
   - Match the API of its corresponding Context
   - Use the persist middleware for localStorage when needed
   - Have proper TypeScript types

### Phase 2: Create Zustand-Compatible Components ✅

1. Create Zustand versions of key components:
   - ✅ `ZustandStudentCard`
   - ✅ `ZustandStudentList`
   - ✅ `ZustandKeyBindingsManager`
   - ⬜ `ZustandTabList`
   - ⬜ `ZustandBankSidebar`

2. Create a demo component:
   - ✅ `ZustandDemo` - Shows the Zustand implementation working

### Phase 3: Implement Side-by-Side ✅

1. ✅ Add routing to allow viewing both implementations
2. ✅ Create a demo route (/demo) using Zustand components
3. ✅ Maintain the original implementation on the main route

### Phase 4: Complete Migration ⬜

1. Once all stores and components are ready:
   - Replace context imports with Zustand hooks in original components
   - Remove Context providers from the application
   - Clean up unused context files
   - Update tests

## Implementation Details

### Store Structure

Each Zustand store should follow this pattern:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SomeState {
  // State properties
  someData: SomeType[];
  
  // Actions
  addSomeData: (data: SomeType) => void;
  updateSomeData: (id: string, data: Partial<SomeType>) => void;
  // ...more actions
}

export const useSomeStore = create<SomeState>()(
  persist(
    (set) => ({
      // Initial state
      someData: [],
      
      // Actions
      addSomeData: (data) => 
        set((state) => ({ 
          someData: [...state.someData, data] 
        })),
      updateSomeData: (id, data) => 
        set((state) => ({
          someData: state.someData.map(item => 
            item.id === id ? { ...item, ...data } : item
          )
        })),
      // ...more actions
    }),
    {
      name: 'some-storage-key',
    }
  )
);
```

### Benefits of This Approach

1. **Gradual adoption** - We can migrate one component at a time
2. **Reduced risk** - The original app continues to work while we migrate
3. **Performance improvements** - Each component only re-renders when its specific data changes
4. **Better developer experience** - Simpler, more direct API
5. **Better maintainability** - Logic is centralized in stores, not scattered across providers and reducers

## Next Steps

1. Complete the remaining stores
2. Migrate more components to use Zustand
3. Implement tests for the Zustand stores
4. Benchmark performance improvements
5. Complete the full migration once ready 