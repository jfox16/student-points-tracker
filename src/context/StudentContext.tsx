import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import useStudentKeyBindings from "../hooks/useStudentKeyBindings";
import { Student, StudentId } from "../types/student.type";
import { generateUuid } from "../utils/generateUuid";
import { moveItem } from "../utils/moveItem";

import { useTabContext } from "./TabContext";

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

  keyBindingsMap: Record<StudentId, string>;
  dragHoverIndex: number;
  setDragHoverIndex: (dragHoverIndex: number) => void;
}

const StudentContext = createContext<StudentContextValue | undefined>(undefined);

export const studentIdsWithDelayedPointsAnimation = new Set<StudentId>();

export const StudentContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeTab, updateTab } = useTabContext();
  const [dragHoverIndex, setDragHoverIndex] = useState(-1);

  const students = activeTab.students;
  const setStudents = useCallback(
    (students: Student[]) => {
      updateTab(activeTab.id, { students });
    },
    [activeTab.id, updateTab]
  );

const numSelectedStudents = useMemo(() => {
    return students.filter((student) => student.selected).length;
  }, [students]);

  const addPointsToStudent = useCallback(
    (id: StudentId, points: number = 1) => {
      setStudents(
        students.map((student) =>
          student.id === id ? { ...student, points: student.points + points } : student
        )
      );
    },
    [students, setStudents]
  );const addPointsToAllStudents = useCallback(
    (points: number = 1) => {
      const affectedStudents = new Set<StudentId>();
  
      if (numSelectedStudents > 0) {
        students.forEach((student) => {
          if (student.selected) affectedStudents.add(student.id);
        });
      } else {
        students.forEach((student) => affectedStudents.add(student.id));
      }
  
      affectedStudents.forEach(id => studentIdsWithDelayedPointsAnimation.add(id));
  
      setStudents(
        students.map((student) =>
          affectedStudents.has(student.id)
            ? { ...student, points: student.points + points }
            : student
        )
      );
    },
    [students, setStudents, numSelectedStudents]
  );
  
  const addPointsToSelectedStudents = useCallback(
    (points: number = 1) => {
      const affectedStudents = new Set<StudentId>();
  
      students.forEach((student) => {
        if (student.selected) affectedStudents.add(student.id);
      });
  
      affectedStudents.forEach(id => studentIdsWithDelayedPointsAnimation.add(id));
  
      setStudents(
        students.map((student) =>
          affectedStudents.has(student.id)
            ? { ...student, points: student.points + points }
            : student
        )
      );
    },
    [students, setStudents]
  );

  const value = {
    students,
    addStudent: () => {
      const id = generateUuid();
      const newStudent: Student = {
        id,
        points: 0,
        name: "",
      };
      setStudents([...students, newStudent]);
    },
    deleteStudent: (id: StudentId) => {
      setStudents(students.filter((student) => student.id !== id));
    },
    updateStudent: (id: StudentId, changes: Partial<Student>) => {
      setStudents(
        students.map((student) => (student.id === id ? { ...student, ...changes } : student))
      );
    },
    updateAllStudents: (changes: Partial<Student>) => {
      setStudents(students.map((student) => ({ ...student, ...changes })));
    },
    moveStudent: (fromIndex: number, toIndex: number) => {
      if (fromIndex !== toIndex) {
        setStudents(moveItem(students, fromIndex, toIndex));
      }
    },
    addPointsToStudent,
    addPointsToAllStudents,
    addPointsToSelectedStudents,
    numSelectedStudents,
    dragHoverIndex,
    setDragHoverIndex,
    keyBindingsMap: useStudentKeyBindings({
      columns: activeTab.tabOptions?.columns ?? 1,
      students,
      addPointsToStudent,
      addPointsToAllStudents,
    }).idToKeyMap,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};

export const useStudentContext = (): StudentContextValue => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudentContext must be used within a StudentContextProvider");
  }
  return context;
};
