import { useEffect, useMemo, useCallback } from "react";
import { Student, StudentId } from "../types/student.type";
import { useAppContext } from "../context/AppContext";
import { getKeyMappingByKey } from "../utils/keyMappings";

interface UseStudentKeyBindingsProps {
  columns: number;
  students: Student[];
  addPointsToStudent: (id: StudentId, points: number) => void;
  addPointsToAllStudents: (points: number) => void;
}

interface KeyMaps {
  keyToIdMap: Record<string, string>;
  idToKeyMap: Record<string, string>;
}

interface CreateKeyMapsParams {
  students: Student[];
  columns: number;
  reverseOrder: boolean;
  keyRows: string[];
  numSelectedStudents: number;
}

const createKeyMaps = ({
  students,
  columns,
  reverseOrder,
  keyRows,
  numSelectedStudents,
}: CreateKeyMapsParams): KeyMaps => {
  const keyToIdMap: Record<string, string> = {};
  const idToKeyMap: Record<string, string> = {};

  const rows = Math.floor(students.length / columns);
  const offset = reverseOrder ? columns - (students.length % columns) : 0;

  students.forEach((student, index) => {
    let row = Math.floor(index / columns);
    let col = index % columns;

    if (reverseOrder) {
      row = rows - row; 
      col = columns - 1 - col;
      if (offset === columns) {
        row -= 1;
      }
    }

    const studentKbEnabled = numSelectedStudents === 0 || student.selected;

    if (keyRows[row] && keyRows[row][col] && studentKbEnabled) {
      const key = keyRows[row][col].toLowerCase();
      const keyMapping = getKeyMappingByKey(key);
      if (keyMapping) {
        keyToIdMap[keyMapping.code] = student.id;
        idToKeyMap[student.id] = keyMapping.displayKey;
      }
    }
  });

  return { keyToIdMap, idToKeyMap };
};

const useStudentKeyBindings = (props: UseStudentKeyBindingsProps) => {
  const { columns, students, addPointsToStudent, addPointsToAllStudents } = props;
  const { appOptions: { reverseOrder = false, enableKeybinds } } = useAppContext();

  const numSelectedStudents = useMemo(() => {
    return students.filter((student) => student.selected).length;
  }, [students]);

  // Define the physical layout of keys we want to use
  const keyRows = useMemo(() => [
    "1234567890",
    "QWERTYUIOP",
    "ASDFGHJKL;",
    "ZXCVBNM,./"
  ], []);

  // Generate key mappings with correct row shifts
  const { keyToIdMap, idToKeyMap } = useMemo(() => 
    createKeyMaps({
      students,
      columns,
      reverseOrder,
      keyRows,
      numSelectedStudents,
    }),
    [students, columns, reverseOrder, keyRows, numSelectedStudents]
  );

  // Handle key presses
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement).tagName);
      if (isTyping) return;

      // Ignore if any modifier keys other than shift are pressed
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.code === "Space") {
        addPointsToAllStudents(event.shiftKey ? -1 : 1);
        event.preventDefault();
        return;
      }

      const studentId = keyToIdMap[event.code];

      if (enableKeybinds && studentId !== undefined) {
        addPointsToStudent(studentId, event.shiftKey ? -1 : 1);
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
