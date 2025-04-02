import { useEffect, useMemo, useCallback } from "react";
import { Student, StudentId } from "../types/student.type";
import { useAppContext } from "../context/AppContext";
import { useStudentStore } from "../stores/useStudentStore";
import { useTabStore } from "../stores/useTabStore";

interface KeyMappings {
  keyToIdMap: Record<string, string>;
  idToKeyMap: Record<string, string>;
}

export const useZustandKeyBindings = () => {
  const { appOptions: { reverseOrder, enableKeybinds } } = useAppContext();
  const { 
    students, 
    addPointsToStudent, 
    addPointsToAllStudents,
    setKeyBindingsMap
  } = useStudentStore();
  
  const { activeTab } = useTabStore();
  const columns = activeTab.tabOptions?.columns ?? 1;

  const numSelectedStudents = useMemo(() => {
    return students.filter((student) => student.selected).length;
  }, [students]);

  const keyRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];

  // Generate key mappings with correct row shifts
  const keyMappings = useMemo<KeyMappings>(() => {
    const keyToId: Record<string, string> = {};
    const idToKey: Record<string, string> = {};

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
        keyToId[key] = student.id;
        idToKey[student.id] = key.toUpperCase();
      }
    });

    // Update the keyBindingsMap in the store
    setKeyBindingsMap(idToKey);

    return { keyToIdMap: keyToId, idToKeyMap: idToKey };
  }, [students, columns, reverseOrder, numSelectedStudents, setKeyBindingsMap]);

  const { keyToIdMap, idToKeyMap } = keyMappings;

  // Handle key presses
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle key presses if Ctrl or Cmd is held down
      if (event.ctrlKey || event.metaKey) return;

      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement).tagName);

      if (isTyping) return;

      const kbKey = event.key.toLowerCase();
      let handled = false;

      if (kbKey === " ") {
        addPointsToAllStudents(event.shiftKey ? -1 : 1);
        handled = true;
      } else {
        const studentId = keyToIdMap[kbKey];

        if (enableKeybinds && studentId !== undefined) {
          addPointsToStudent(studentId, event.shiftKey ? -1 : 1);
          handled = true;
        }
      }

      // Only prevent default if we actually handled the key press
      if (handled) {
        event.preventDefault();
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