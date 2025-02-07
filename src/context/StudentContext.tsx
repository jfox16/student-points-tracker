
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import useStudentKeyBindings from '../hooks/useStudentKeyBindings';
import { Student, StudentId } from '../types/student.type';
import { generateUuid } from '../utils/generateUuid';
import { moveItem } from '../utils/moveItem';

import { useTabContext } from './TabContext';

interface StudentContextValue {
  students: Student[];
  addStudent: () => void;
  deleteStudent: (id: StudentId) => void;
  updateStudent: (id: StudentId, changes: Partial<Student>) => void;
  updateAllStudents: (changes: Partial<Student>) => void;
  moveStudent: (fromIndex: number, toIndex: number) => void;
  addPointsToStudent: (id: StudentId, points?: number) => void;
  addPointsToAllStudents: (points?: number) => void;
  addPointsToSelectedStudents: (points?: number) => void;
  numSelectedStudents: number;

  keyBindingsMap: Record<StudentId, string>; // Map of student ids to key bindings
  dragHoverIndex: number;
  setDragHoverIndex: (dragHoverIndex: number) => void;
}

const StudentContext = createContext<StudentContextValue|undefined>(undefined);

export const StudentContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const { activeTab, updateTab } = useTabContext();
  const [ dragHoverIndex, setDragHoverIndex ] = useState(-1);

  const students = activeTab.students;
  const setStudents = useCallback((students: Student[]) => {
    updateTab(activeTab.id, { students });
  }, [
    activeTab.id,
    updateTab
  ]);

  const numSelectedStudents = useMemo(() => {
    return students.filter(student => student.selected).length;
  }, [
    students,
  ])

  const addPointsToStudent = useCallback((id: StudentId, points: number = 1) => {
    setStudents(students.map(student => student.id === id
      ? { ...student, points: student.points + points }
      : student
    ));
  }, [
    students,
    setStudents
  ]);

  const addPointsToAllStudents = useCallback((points: number = 1) => {
    // If any students are selected, only add points to them.
    if (numSelectedStudents > 0) {
      setStudents(students.map(student => student.selected ? ({
        ...student,
        points: student.points + points
      }) : student));
      return;
    }
    setStudents(students.map(student => ({
      ...student,
      points: student.points + points
    })));
  }, [
    students,
    setStudents
  ]);

  const addPointsToSelectedStudents = useCallback((points: number = 1) => {
    setStudents(students.map(student => student.selected ? ({
      ...student,
      points: student.points + points
    }) : student));
  }, [
    students,
    setStudents,
  ])

  const { idToKeyMap: keyBindingsMap } = useStudentKeyBindings({
    columns: activeTab.tabOptions?.columns ?? 1,
    students,
    addPointsToStudent,
    addPointsToAllStudents,
  });

  const addStudent = useCallback(() => {
    const id = generateUuid();
    const newStudent: Student = {
      id,
      points: 0,
      name: ''
    };
    const students = [
      ...activeTab.students ?? [],
      newStudent,
    ];

    updateTab(activeTab.id, {
      students
    });
  }, [
    activeTab.id,
    activeTab.students,
    updateTab,
  ])

  const deleteStudent = useCallback((id: StudentId) => {
    const newStudents = activeTab.students.filter(student => {
      return student.id !== id;
    });
    setStudents(newStudents);
  }, [
    activeTab.students,
    setStudents,
  ])

  const updateStudent = useCallback((id: StudentId, changes: Partial<Student>) => {
    const newStudents = activeTab.students.map(student => {
      return student.id === id ? { ...student, ...changes } : student
    });
    setStudents(newStudents);
  }, [
    activeTab.students,
    setStudents,
  ]);

  const updateAllStudents = useCallback((changes: Partial<Student>) => {
    setStudents(students.map(student => ({ ...student, ...changes })));
  }, [
    students,
    setStudents,
  ])

  const moveStudent = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      const newStudents = moveItem(students, fromIndex, toIndex);
      setStudents(newStudents);
    }
  }, [
    students,
    setStudents,
  ]);

  const value = {
    students,
    addStudent,
    deleteStudent,
    updateStudent,
    updateAllStudents,
    moveStudent,
    addPointsToStudent,
    addPointsToAllStudents,
    addPointsToSelectedStudents,
    numSelectedStudents,
    dragHoverIndex,
    setDragHoverIndex,
    keyBindingsMap,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudentContext = (): StudentContextValue => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudentContext must be used within an StudentContextProvider');
  }
  return context;
};
