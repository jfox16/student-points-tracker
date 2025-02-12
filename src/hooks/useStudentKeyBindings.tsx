import { useEffect, useMemo, useCallback } from "react";
import { Student, StudentId } from "../types/student.type";
import { useAppContext } from "../context/AppContext";

interface UseStudentKeyBindingsProps {
  columns: number;
  students: Student[];
  addPointsToStudent: (id: StudentId, points: number) => void;
  addPointsToAllStudents: (points: number) => void;
}

const useStudentKeyBindings = (props: UseStudentKeyBindingsProps) => {
  const { columns, students, addPointsToStudent, addPointsToAllStudents } = props;
  const { appOptions: { reverseOrder, enableKeybinds } } = useAppContext();

  const numSelectedStudents = useMemo(() => {
    return students.filter((student) => student.selected).length;
  }, [students]);

  const keyRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];

  // Generate key mappings with correct row shifts
  const { keyToIdMap, idToKeyMap } = useMemo(() => {
    const keyToId: Record<string, string> = {};
    const idToKey: Record<string, string> = {};

    const rows = Math.floor(students.length / columns);
    const offset = reverseOrder ? columns - (students.length % columns) : 0;

    students.forEach((student, index) => {
      let row = Math.floor(index / columns);
      let col = index % columns;

      console.log({ row, col })

      if (reverseOrder) {
        row = rows - row; 
        col = columns - 1 - col;
        console.log('reversed', { row, col })
      }

      const studentKbEnabled = numSelectedStudents === 0 || student.selected;

      if (keyRows[row] && keyRows[row][col] && studentKbEnabled) {
        const key = keyRows[row][col].toLowerCase();
        keyToId[key] = student.id;
        idToKey[student.id] = key.toUpperCase();
      }
    });

    return { keyToIdMap: keyToId, idToKeyMap: idToKey };
  }, [students, columns, reverseOrder]);

  // Handle key presses
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const holdingOtherKeys = event.ctrlKey || event.shiftKey || event.altKey;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement).tagName);

      if (holdingOtherKeys || isTyping) return;

      const kbKey = event.key.toLowerCase();

      if (kbKey === " ") {
        addPointsToAllStudents(1);
        event.preventDefault();
        return;
      }

      const studentId = keyToIdMap[kbKey];

      if (enableKeybinds && studentId !== undefined) {
        addPointsToStudent(studentId, 1);
        event.preventDefault();
        return;
      }
    },
    [enableKeybinds, keyToIdMap, addPointsToStudent, addPointsToAllStudents]
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
