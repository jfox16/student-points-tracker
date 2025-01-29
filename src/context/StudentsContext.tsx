
import React, { createContext, useCallback, useContext, useMemo } from 'react';

import { Student, StudentId } from '../types/studentTypes';
import { DEFAULT_TAB, useTabContext } from './TabContext';
import { generateUuid } from '../utils/generateUuid';

interface StudentsContextValue {
  addStudent: () => void;
  deleteStudent: (id: StudentId) => void;
  updateStudent: (id: StudentId, changes: Partial<Student>) => void;
  students: Student[];
}

const StudentsContext = createContext<StudentsContextValue|undefined>(undefined);

export const StudentsContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const { activeTab, updateTab } = useTabContext();

  const students = activeTab.students;
  const setStudents = (students: Student[]) => {
    updateTab(activeTab.id, { students });
  }

  const addStudent = useCallback(() => {
    const id = generateUuid();
    const newStudent: Student = {
      id,
      points: 0,
      name: ''
    };
    const students = [
      ...activeTab.students,
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
    activeTab.id,
    activeTab.students,
    updateTab
  ])

  const updateStudent = useCallback((id: StudentId, changes: Partial<Student>) => {
    const newStudents = activeTab.students.map(student => {
      return student.id === id ? { ...student, ...changes } : student
    });
    setStudents(newStudents);
  }, [
    activeTab.id,
    activeTab.students,
    updateTab,
  ]);

  const value: StudentsContextValue = useMemo(() => {
    return {
      addStudent,
      deleteStudent,
      updateStudent,
      students,
    };
  }, [
    students,
    addStudent,
    deleteStudent,
    updateStudent
  ])

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
}

export const useStudentsContext = (): StudentsContextValue => {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudentsContext must be used within an StudentsContextProvider');
  }
  return context;
};
