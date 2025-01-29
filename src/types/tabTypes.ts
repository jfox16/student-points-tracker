import { Student } from "./studentTypes";

export type TabId = string;

export interface Tab {
  id: TabId;
  name: string;
  students: Student[];
  tabOptions?: TabOptions;
}

export interface TabOptions {
  columns?: number;
}
