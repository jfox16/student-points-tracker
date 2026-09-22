import { Student } from "./student.type";
import { TabOptions } from "./tabOptions.type";
import { ClassroomLayout } from "./classroomLayout.type";

export type TabId = string;

export interface Tab {
  id: TabId;
  name: string;
  students: Student[];
  tabOptions?: TabOptions;
  classroomLayout?: ClassroomLayout;
}
