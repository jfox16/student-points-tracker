
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Student, StudentId } from '../types/studentTypes';
import { v4 as uuidv4 } from 'uuid';
import { useDebounce } from '../utils/useDebounce';

interface TabContextValue {
  addStudent: () => void;
  updateStudent: (id: StudentId, changes: Partial<Student>) => void;
  students: Student[];
}

const TabContext = createContext<TabContextValue|undefined>(undefined);

export const TabContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const [students, setStudents] = useState<Student[]>([]);

  const saveStudents = useCallback(() => {
    console.log('saveStudents')
    localStorage.setItem('ok-to-delete-students', JSON.stringify(students));
  }, [
    students
  ]);

  const loadStudents = useCallback(() => {
    console.log('loadStudents')
    const storedValue = localStorage.getItem('ok-to-delete-students');
    console.info()
    if (storedValue) {
      const students = JSON.parse(storedValue);
      setStudents(students);
    }
  }, [])

  const debouncedSaveStudents = useDebounce(saveStudents, 500);

  useEffect(() => {
    loadStudents();
  }, [])

  useEffect(() => {
    debouncedSaveStudents();
  }, [students])

  const addStudent = () => {
    const id = uuidv4();
    const newStudent: Student = {
      id,
      points: 0,
      name: ''
    };
    setStudents([
      ...students,
      newStudent,
    ])
  }

  const updateStudent = (id: StudentId, changes: Partial<Student>) => {
    const updatedStudents = students.map(student => {
      return student.id === id ? { ...student, ...changes } : student
    });
    setStudents(updatedStudents);
  }

  const value: TabContextValue = {
    addStudent,
    updateStudent,
    students
  }

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
}

export const useTabContext = (): TabContextValue => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabContext must be used within an TabContextProvider');
  }
  return context;
};
