import { create } from 'zustand';
import { Student, StudentId } from '../types/student.type';
import { generateUuid } from '../utils/generateUuid';
import { moveItem } from '../utils/moveItem';

// Animation sets (similar to context implementation)
export const studentIdsWithDelayedPointsAnimation = new Set<StudentId>();
export const studentIdsWithNextPointsAnimation = new Set<StudentId>();

interface StudentState {
  // State
  students: Student[];
  dragHoverIndex: number;
  keyBindingsMap: Record<StudentId, string>;
  
  // Computed
  numSelectedStudents: number;
  
  // Actions
  setStudents: (students: Student[]) => void;
  setDragHoverIndex: (index: number) => void;
  setKeyBindingsMap: (map: Record<StudentId, string>) => void;
  
  addStudent: () => void;
  deleteStudent: (id: StudentId) => void;
  updateStudent: (id: StudentId, changes: Partial<Student>) => void;
  updateAllStudents: (changes: Partial<Student>) => void;
  moveStudent: (fromIndex: number, toIndex: number) => void;
  reverseStudentOrder: () => void;
  
  addPointsToStudent: (id: StudentId, points?: number) => void;
  addPointsToAllStudents: (points?: number) => void;
  addPointsToSelectedStudents: (points?: number) => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  // State
  students: [],
  dragHoverIndex: -1,
  keyBindingsMap: {},
  
  // Computed values
  get numSelectedStudents() {
    return get().students.filter(student => student.selected).length;
  },
  
  // Basic setters
  setStudents: (students) => set({ students }),
  setDragHoverIndex: (dragHoverIndex) => set({ dragHoverIndex }),
  setKeyBindingsMap: (keyBindingsMap) => set({ keyBindingsMap }),
  
  // Student management
  addStudent: () => {
    const id = generateUuid();
    const newStudent: Student = { id, points: 0, name: "" };
    set(state => ({ 
      students: [...state.students, newStudent] 
    }));
  },
  
  deleteStudent: (id) => {
    set(state => ({
      students: state.students.filter(student => student.id !== id)
    }));
  },
  
  updateStudent: (id, changes) => {
    set(state => ({
      students: state.students.map(student => 
        student.id === id ? { ...student, ...changes } : student
      )
    }));
  },
  
  updateAllStudents: (changes) => {
    set(state => ({
      students: state.students.map(student => ({ ...student, ...changes }))
    }));
  },
  
  moveStudent: (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    set(state => ({
      students: moveItem(state.students, fromIndex, toIndex)
    }));
  },
  
  reverseStudentOrder: () => {
    set(state => ({
      students: [...state.students].reverse()
    }));
  },
  
  // Points management
  addPointsToStudent: (id, points = 1) => {
    studentIdsWithNextPointsAnimation.add(id);
    set(state => ({
      students: state.students.map(student =>
        student.id === id ? { ...student, points: student.points + points } : student
      )
    }));
  },
  
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
})); 