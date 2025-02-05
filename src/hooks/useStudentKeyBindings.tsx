import { useEffect, useMemo, useCallback } from "react";

import { Student } from "../types/student.type";
import { useTabContext } from "../context/TabContext";

interface UseStudentKeyBindingsProps {
  columns: number;
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const useStudentKeyBindings = (props: UseStudentKeyBindingsProps) => {
  const {
    activeTab
  } = useTabContext();
  const {
    columns,
    students,
    setStudents,
  } = props;

  const enableKeybinds = activeTab.tabOptions?.enableKeybinds;

  const numSelectedStudents = useMemo(() => {
    return students.filter(student => student.selected).length;
  }, [
    students
  ]);

  // Define key rows dynamically
  const keyRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];

  // Generate mappings
  const { keyToIdMap, idToKeyMap } = useMemo(() => {
    const keyToId: Record<string, string> = {};
    const idToKey: Record<string, string> = {};

    students.forEach((student, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const studentKbEnabled = numSelectedStudents === 0 || student.selected;
      if (keyRows[row] && keyRows[row][col] && studentKbEnabled) {
        const key = keyRows[row][col].toLowerCase(); // Ensure lowercase
        keyToId[key] = student.id;
        idToKey[student.id] = key.toUpperCase(); // Store uppercase for display
      }
    });

    return { keyToIdMap: keyToId, idToKeyMap: idToKey };
  }, [students, columns]);

  // Handle key presses
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enableKeybinds) return;

      const notTyping = !["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement).tagName);

      if (notTyping) {
        const studentId = keyToIdMap[event.key.toLowerCase()];
        if (studentId !== undefined) {
          setStudents(students.map(student => student.id === studentId ? { ...student, points: student.points + 1 } : student));
        }
      }
    },
    [keyToIdMap, setStudents]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return { idToKeyMap };
};

export default useStudentKeyBindings;
