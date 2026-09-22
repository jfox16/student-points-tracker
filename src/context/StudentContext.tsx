import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import useStudentKeyBindings from "../hooks/useStudentKeyBindings";
import { useUndoRedoKeyBindings } from "../hooks/useUndoRedoKeyBindings";
import { Student, StudentId } from "../types/student.type";
import { TabId } from "../types/tab.type";
import { AddPointsCommand, UndoStack } from "../types/undo.type";
import { generateUuid } from "../utils/generateUuid";
import { moveItem } from "../utils/moveItem";
import {
  EMPTY_UNDO_STACK,
  pushUndoCommand,
  takeRedoCommand,
  takeUndoCommand,
} from "../utils/undoStack";
import { useTabContext } from "./TabContext";

interface StudentContextValue {
  students: Student[];
  addStudent: () => void;
  deleteStudent: (id: StudentId) => void;
  updateStudent: (id: StudentId, changes: Partial<Student>) => void;
  updateAllStudents: (changes: Partial<Student>) => void;
  moveStudent: (fromIndex: number, toIndex: number) => void;
  reverseStudentOrder: () => void;
  addPointsToStudent: (id: StudentId, points?: number) => void;
  addPointsToStudents: (ids: Iterable<StudentId>, points?: number) => void;
  addPointsToAllStudents: (points?: number) => void;
  addPointsToSelectedStudents: (points?: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  numSelectedStudents: number;
  dragHoverIndex: number;
  setDragHoverIndex: (dragHoverIndex: number) => void;
  keyBindingsMap: Record<StudentId, string>;
}

type PointAnimation = "next" | "delayed";

/** ✅ Context Setup */
const StudentContext = createContext<StudentContextValue | undefined>(undefined);

/** ✅ Animation-related Sets */
const studentIdsWithDelayedPointsAnimation = new Set<StudentId>();
const studentIdsWithNextPointsAnimation = new Set<StudentId>();

export const StudentContextProvider = ({ children }: { children: React.ReactNode }) => {
  /** ✅ State & Context */
  const { activeTab, updateTab } = useTabContext();
  const [dragHoverIndex, setDragHoverIndex] = useState(-1);
  const [undoStacks, setUndoStacks] = useState<Record<TabId, UndoStack>>({});

  const students = activeTab.students;
  const activeUndoStack = undoStacks[activeTab.id] ?? EMPTY_UNDO_STACK;
  const canUndo = activeUndoStack.past.length > 0;
  const canRedo = activeUndoStack.future.length > 0;
  const setStudents = useCallback(
    (students: Student[]) => updateTab(activeTab.id, { students }),
    [activeTab.id, updateTab]
  );

  /** ✅ Memoized Value */
  const numSelectedStudents = useMemo(
    () => students.filter((student) => student.selected).length,
    [students]
  );

  const applyPointDelta = useCallback(
    (
      ids: Iterable<StudentId>,
      points: number,
      options: {
        animation: PointAnimation;
        recordHistory?: boolean;
      },
    ) => {
      const affectedStudentIds = Array.from(new Set(ids)).filter((id) =>
        students.some((student) => student.id === id),
      );
      if (affectedStudentIds.length === 0 || points === 0) return;

      const animationSet = options.animation === "delayed"
        ? studentIdsWithDelayedPointsAnimation
        : studentIdsWithNextPointsAnimation;
      affectedStudentIds.forEach((id) => animationSet.add(id));

      if (options.recordHistory !== false) {
        const command: AddPointsCommand = {
          type: "add-points",
          tabId: activeTab.id,
          studentIds: affectedStudentIds,
          delta: points,
        };
        setUndoStacks((currentStacks) => ({
          ...currentStacks,
          [activeTab.id]: pushUndoCommand(
            currentStacks[activeTab.id] ?? EMPTY_UNDO_STACK,
            command,
          ),
        }));
      }

      const affectedStudentIdSet = new Set(affectedStudentIds);
      setStudents(
        students.map((student) =>
          affectedStudentIdSet.has(student.id)
            ? { ...student, points: student.points + points }
            : student
        )
      );
    },
    [activeTab.id, setStudents, students]
  );

  /** ✅ Student Actions */

  /** 🎯 Add Points to a Single Student (Triggers Animation Next Update) */
  const addPointsToStudent = useCallback(
    (id: StudentId, points: number = 1) => {
      applyPointDelta([id], points, { animation: "next" });
    },
    [applyPointDelta]
  );

  const addPointsToStudents = useCallback(
    (ids: Iterable<StudentId>, points: number = 1) => {
      applyPointDelta(ids, points, { animation: "delayed" });
    },
    [applyPointDelta]
  );

  /** 🎯 Add Points to All Students (Triggers Delayed Animation) */
  const addPointsToAllStudents = useCallback(
    (points: number = 1) => {
      const affectedStudents = students
        .filter((student) => numSelectedStudents === 0 || student.selected)
        .map((student) => student.id);
      applyPointDelta(affectedStudents, points, { animation: "delayed" });
    },
    [applyPointDelta, numSelectedStudents, students]
  );

  /** 🎯 Add Points to Selected Students (Triggers Delayed Animation) */
  const addPointsToSelectedStudents = useCallback(
    (points: number = 1) => {
      applyPointDelta(
        students.filter((student) => student.selected).map((student) => student.id),
        points,
        { animation: "delayed" },
      );
    },
    [applyPointDelta, students]
  );

  const replayPointCommand = useCallback(
    (command: AddPointsCommand, direction: 1 | -1) => {
      if (command.tabId !== activeTab.id) return;
      applyPointDelta(command.studentIds, command.delta * direction, {
        animation: command.studentIds.length > 1 ? "delayed" : "next",
        recordHistory: false,
      });
    },
    [activeTab.id, applyPointDelta]
  );

  const undo = useCallback(() => {
    const { command, stack } = takeUndoCommand(
      undoStacks[activeTab.id] ?? EMPTY_UNDO_STACK,
    );
    if (!command) return;

    setUndoStacks((currentStacks) => ({
      ...currentStacks,
      [activeTab.id]: stack,
    }));
    if (command.type === "add-points") replayPointCommand(command, -1);
  }, [activeTab.id, replayPointCommand, undoStacks]);

  const redo = useCallback(() => {
    const { command, stack } = takeRedoCommand(
      undoStacks[activeTab.id] ?? EMPTY_UNDO_STACK,
    );
    if (!command) return;

    setUndoStacks((currentStacks) => ({
      ...currentStacks,
      [activeTab.id]: stack,
    }));
    if (command.type === "add-points") replayPointCommand(command, 1);
  }, [activeTab.id, replayPointCommand, undoStacks]);

  useUndoRedoKeyBindings({
    canRedo,
    canUndo,
    redo,
    undo,
  });

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
    addPointsToStudents,
    addPointsToAllStudents,
    addPointsToSelectedStudents,
    undo,
    redo,
    canUndo,
    canRedo,
    numSelectedStudents,
    dragHoverIndex,
    setDragHoverIndex,
    keyBindingsMap: useStudentKeyBindings({
      columns: activeTab.tabOptions?.columns ?? 1,
      students,
      addPointsToStudent,
      addPointsToAllStudents,
      enabled: activeTab.tabOptions?.viewMode !== "map",
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
