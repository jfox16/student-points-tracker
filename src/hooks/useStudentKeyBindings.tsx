import { useEffect, useMemo, useCallback } from "react";

import { Student } from "../types/student.type";

interface UseStudentKeyBindingsProps {
  columns: number;
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const useStudentKeyBindings = (props: UseStudentKeyBindingsProps) => {
  const {
    columns,
    students,
    setStudents,
  } = props;

  // Define key rows dynamically
  const keyRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];

  // Generate mappings
  const { keyToIdMap, idToKeyMap } = useMemo(() => {
    const keyToId: Record<string, string> = {};
    const idToKey: Record<string, string> = {};

    students.forEach(({ id }, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      if (keyRows[row] && keyRows[row][col]) {
        const key = keyRows[row][col].toLowerCase(); // Ensure lowercase
        keyToId[key] = id;
        idToKey[id] = key.toUpperCase(); // Store uppercase for display
      }
    });

    return { keyToIdMap: keyToId, idToKeyMap: idToKey };
  }, [students, columns]);

  // Handle key presses
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
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
