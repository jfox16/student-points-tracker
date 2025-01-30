import { Student, StudentId } from "./student.type";
import { TabOptions } from "./tabOptions.type";

export type TabId = string;

export interface Tab {
  id: TabId;
  name: string;
  students: Student[];
  selectedStudentIds?: Set<StudentId>;
  tabOptions?: TabOptions;
}
