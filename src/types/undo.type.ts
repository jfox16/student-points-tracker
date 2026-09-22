import { StudentId } from "./student.type";
import { TabId } from "./tab.type";

export interface AddPointsCommand {
  type: "add-points";
  tabId: TabId;
  studentIds: StudentId[];
  delta: number;
}

export type UndoCommand = AddPointsCommand;

export interface UndoStack {
  past: UndoCommand[];
  future: UndoCommand[];
}
