import { StudentId } from "../types/student.type";

export type DeskSelectionMode = "replace" | "add" | "remove";

type SelectionModifierEvent = {
  button?: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

// Click replaces the selection. ⌘/Ctrl adds, Shift removes.
// The same modifiers apply to a drag-box on the classroom floor.
export const getDeskSelectionMode = (
  event: SelectionModifierEvent,
): DeskSelectionMode => {
  if (event.button !== undefined && event.button !== 0) return "replace";
  if (event.metaKey || event.ctrlKey) return "add";
  if (event.shiftKey) return "remove";
  return "replace";
};

export const applyDeskSelection = (
  currentIds: ReadonlySet<StudentId>,
  targetIds: ReadonlySet<StudentId>,
  mode: DeskSelectionMode,
): Set<StudentId> => {
  if (mode === "replace") return new Set(targetIds);

  const nextIds = new Set(currentIds);
  targetIds.forEach((studentId) => {
    if (mode === "add") nextIds.add(studentId);
    else nextIds.delete(studentId);
  });
  return nextIds;
};
