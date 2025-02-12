import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { Student, StudentId } from "../types/student.type";
import { generateUuid } from "../utils/generateUuid";
import { moveItem } from "../utils/moveItem";
import { useTabContext } from "./TabContext";
import useStudentKeyBindings from "../hooks/useStudentKeyBindings";

interface StudentContextValue {
  students: Student[];
  addStudent: () => void;
  deleteStudent: (id: StudentId) => void;
  updateStudent: (id: StudentId, changes: Partial<Student>) => void;
  updateAllStudents: (changes: Partial<Student>) => void;
  moveStudent: (fromIndex: number, toIndex: number) => void;
  reverseStudentOrder: () => void;
  addPointsToStudent: (id: StudentId, points?: number) => void;
  addPointsToAllStudents: (points?: number) => void;
  addPointsToSelectedStudents: (points?: number) => void;
  numSelectedStudents: number;
  dragHoverIndex: number;
  setDragHoverIndex: (dragHoverIndex: number) => void;
  keyBindingsMap: Record<StudentId, string>;
}

/** ✅ Context Setup */
const StudentContext = createContext<StudentContextValue | undefined>(undefined);

/** ✅ Animation-related Sets */
const studentIdsWithDelayedPointsAnimation = new Set<StudentId>();
const studentIdsWithNextPointsAnimation = new Set<StudentId>();

export const StudentContextProvider = ({ children }: { children: React.ReactNode }) => {
  /** ✅ State & Context */
  const { activeTab, updateTab } = useTabContext();
  const [dragHoverIndex, setDragHoverIndex] = useState(-1);

  const students = activeTab.students;
  const setStudents = useCallback(
    (students: Student[]) => updateTab(activeTab.id, { students }),
    [activeTab.id, updateTab]
  );

  /** ✅ Memoized Value */
  const numSelectedStudents = useMemo(
    () => students.filter((student) => student.selected).length,
    [students]
  );

  /** ✅ Student Actions */

  /** 🎯 Add Points to a Single Student (Triggers Animation Next Update) */
  const addPointsToStudent = useCallback(
    (id: StudentId, points: number = 1) => {
      studentIdsWithNextPointsAnimation.add(id);
      setStudents(
        students.map((student) =>
          student.id === id ? { ...student, points: student.points + points } : student
        )
      );
    },
    [students, setStudents]
  );

  /** 🎯 Add Points to All Students (Triggers Delayed Animation) */
  const addPointsToAllStudents = useCallback(
    (points: number = 1) => {
      const affectedStudents = new Set<StudentId>();

      if (numSelectedStudents > 0) {
        students.forEach((student) => {
          if (student.selected) affectedStudents.add(student.id);
        });
      } else {
        students.forEach((student) => affectedStudents.add(student.id));
      }

      affectedStudents.forEach((id) => studentIdsWithDelayedPointsAnimation.add(id));

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

  /** 🎯 Add Points to Selected Students (Triggers Delayed Animation) */
  const addPointsToSelectedStudents = useCallback(
    (points: number = 1) => {
      const affectedStudents = new Set<StudentId>();

      students.forEach((student) => {
        if (student.selected) affectedStudents.add(student.id);
      });

      affectedStudents.forEach((id) => studentIdsWithDelayedPointsAnimation.add(id));

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

  /** 🎯 Manage Student List */
  const addStudent = useCallback(() => {
    const id = generateUuid();
    const newStudent: Student = { id, points: 0, name: "" };
    setStudents([...students, newStudent]);
  }, [students, setStudents]);

  const deleteStudent = useCallback(
    (id: StudentId) => setStudents(students.filter((student) => student.id !== id)),
    [students, setStudents]
  );

  const updateStudent = useCallback(
    (id: StudentId, changes: Partial<Student>) => {
      setStudents(
        students.map((student) => (student.id === id ? { ...student, ...changes } : student))
      );
    },
    [students, setStudents]
  );

  const updateAllStudents = useCallback(
    (changes: Partial<Student>) => setStudents(students.map((student) => ({ ...student, ...changes }))),
    [students, setStudents]
  );

  const moveStudent = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex !== toIndex) setStudents(moveItem(students, fromIndex, toIndex));
    },
    [students, setStudents]
  );

  const reverseStudentOrder = useCallback(() => {
    setStudents([...students].reverse());
  }, [students, setStudents]);
  

  /** ✅ Context Value */
  const value = {
    students,
    addStudent,
    deleteStudent,
    updateStudent,
    updateAllStudents,
    moveStudent,
    reverseStudentOrder,
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

/** ✅ Hook for Consuming Context */
export const useStudentContext = (): StudentContextValue => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudentContext must be used within a StudentContextProvider");
  }
  return context;
};

/** ✅ Export Animation Sets */
export { studentIdsWithDelayedPointsAnimation, studentIdsWithNextPointsAnimation };
