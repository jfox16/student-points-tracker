import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, StudentId } from '../types/student.type';
import { generateUuid } from '../utils/generateUuid';
import { moveItem } from '../utils/moveItem';

// Animation sets (similar to context implementation)
export const studentIdsWithDelayedPointsAnimation = new Set<StudentId>();
export const studentIdsWithNextPointsAnimation = new Set<StudentId>();

interface StudentState {
  // State
  students: Student[];
  dragHoverIndex: number | null;
  keyBindingsMap: Record<string, string>;
  
  // Computed
  numSelectedStudents: number;
  
  // Actions
  setStudents: (students: Student[]) => void;
  setDragHoverIndex: (index: number | null) => void;
  setKeyBindingsMap: (map: Record<string, string>) => void;
  
  addStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  updateAllStudents: (changes: Partial<Student>) => void;
  moveStudent: (dragIndex: number, hoverIndex: number) => void;
  reverseStudentOrder: () => void;
  
  addPointsToStudent: (id: string, points: number) => void;
  addPointsToAllStudents: (points?: number) => void;
  addPointsToSelectedStudents: (points?: number) => void;
  selectAllStudents: () => void;
  selectStudentsByGroup: () => void;
  resetAllStudents: () => void;
  setKeyBinding: (studentId: string, key: string) => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      // State
      students: [],
      dragHoverIndex: null,
      keyBindingsMap: {},
      
      // Computed values
      get numSelectedStudents() {
        return get().students.filter(student => student.selected).length;
      },
      
      // Basic setters
      setStudents: (students) => set({ students }),
      setDragHoverIndex: (dragHoverIndex) => set({ dragHoverIndex }),
      setKeyBindingsMap: (map) => set({ keyBindingsMap: map }),
      
      // Student management
      addStudent: (student) =>
        set((state) => ({
          students: [...state.students, student],
        })),
      
      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((student) => student.id !== id),
          keyBindingsMap: Object.fromEntries(
            Object.entries(state.keyBindingsMap).filter(([studentId]) => studentId !== id)
          ),
        })),
      
      updateStudent: (id, updates) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === id ? { ...student, ...updates } : student
          ),
        })),
      
      updateAllStudents: (changes) => {
        set(state => ({
          students: state.students.map(student => ({ ...student, ...changes }))
        }));
      },
      
      moveStudent: (dragIndex, hoverIndex) =>
        set((state) => {
          const newStudents = [...state.students];
          const [movedStudent] = newStudents.splice(dragIndex, 1);
          newStudents.splice(hoverIndex, 0, movedStudent);
          return { students: newStudents };
        }),
      
      reverseStudentOrder: () => {
        set(state => ({
          students: [...state.students].reverse()
        }));
      },
      
      // Points management
      addPointsToStudent: (id, points) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === id
              ? { ...student, points: student.points + points }
              : student
          ),
        })),
      
      addPointsToAllStudents: (points = 1) => {
        const state = get();
        const { students, numSelectedStudents } = state;
        const affectedStudents = new Set<StudentId>();
        
        if (numSelectedStudents > 0) {
          students.forEach(student => {
            if (student.selected) affectedStudents.add(student.id);
          });
        } else {
          students.forEach(student => affectedStudents.add(student.id));
        }
        
        affectedStudents.forEach(id => studentIdsWithDelayedPointsAnimation.add(id));
        
        set({
          students: students.map(student =>
            affectedStudents.has(student.id)
              ? { ...student, points: student.points + points }
              : student
          )
        });
      },
      
      addPointsToSelectedStudents: (points = 1) => {
        const state = get();
        const { students } = state;
        const affectedStudents = new Set<StudentId>();
        
        students.forEach(student => {
          if (student.selected) affectedStudents.add(student.id);
        });
        
        affectedStudents.forEach(id => studentIdsWithDelayedPointsAnimation.add(id));
        
        set({
          students: students.map(student =>
            affectedStudents.has(student.id)
              ? { ...student, points: student.points + points }
              : student
          )
        });
      },
      
      selectAllStudents: () =>
        set((state) => ({
          students: state.students.map((student) => ({ ...student, selected: true })),
        })),
      
      selectStudentsByGroup: () =>
        set((state) => {
          const selectedStudents = state.students.filter((s) => s.selected);
          if (selectedStudents.length === 0) return state;

          const groupName = selectedStudents[0].className;
          return {
            students: state.students.map((student) =>
              student.className === groupName
                ? { ...student, selected: true }
                : student
            ),
          };
        }),
      
      resetAllStudents: () =>
        set((state) => ({
          students: state.students.map((student) => ({ ...student, points: 0 })),
        })),
      
      setKeyBinding: (studentId, key) =>
        set((state) => ({
          keyBindingsMap: {
            ...state.keyBindingsMap,
            [studentId]: key,
          },
        })),
    }),
    {
      name: 'student-storage',
    }
  )
); 
