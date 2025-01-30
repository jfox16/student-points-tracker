
import React, { createContext, useCallback, useContext, useMemo } from 'react';

import { Student, StudentId } from '../types/student.type';
import { useTabContext } from './TabContext';
import { generateUuid } from '../utils/generateUuid';

interface StudentsContextValue {
  addStudent: () => void;
  deleteStudent: (id: StudentId) => void;
  updateStudent: (id: StudentId, changes: Partial<Student>) => void;
  selectedStudentIds: Set<StudentId>;
  setSelectedStudentIds: (set: Set<StudentId>) => void;
  setStudentSelected: (id: StudentId, selected?: boolean) => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const StudentsContext = createContext<StudentsContextValue|undefined>(undefined);

export const StudentsContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const { activeTab, updateTab } = useTabContext();

  const students = activeTab.students;
  const setStudents = useCallback((students: Student[]) => {
    updateTab(activeTab.id, { students });
  }, [
    activeTab.id,
    updateTab
  ])

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

  const selectedStudentIds = useMemo(() => {
    return activeTab.selectedStudentIds ?? new Set<StudentId>();
  }, [
    activeTab.selectedStudentIds,
  ]);

  const setSelectedStudentIds = useCallback((selectedStudentIds: Set<StudentId>) => {
    updateTab(activeTab.id, {
      selectedStudentIds
    });
  }, [
    activeTab.id,
    updateTab,
  ])

  const setStudentSelected = useCallback((id: StudentId, selected?: boolean) => {
    if (selectedStudentIds.has(id) === !!selected) {
      return;
    }

    const newSet = new Set<StudentId>(selectedStudentIds);
    if (selected) {
      newSet.add(id)
    } else {
      newSet.delete(id);
    }
    setSelectedStudentIds(newSet);
  }, [
    selectedStudentIds,
    setSelectedStudentIds
  ]);

  const value: StudentsContextValue = useMemo(() => {
    return {
      students,
      setStudents,
      addStudent,
      deleteStudent,
      updateStudent,
      selectedStudentIds,
      setSelectedStudentIds,
      setStudentSelected,
    };
  }, [
    students,
    setStudents,
    addStudent,
    deleteStudent,
    updateStudent,
    selectedStudentIds,
    setSelectedStudentIds,
    setStudentSelected,
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
