import { Student } from "./studentTypes";

export type TabId = string;

export interface Tab {
  id: TabId;
  tabName: string;
  students: Student[];
}
