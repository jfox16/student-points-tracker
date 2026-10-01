import { StudentId } from "./student.type";

export const CLASSROOM_LAYOUT_VERSION = 2;
export type DeskRotation = 0 | 90 | 180 | 270;
export const CLASSROOM_CONTROL_GROUP_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type ClassroomControlGroupNumber =
  typeof CLASSROOM_CONTROL_GROUP_NUMBERS[number];
export type ClassroomControlGroups = Partial<
  Record<ClassroomControlGroupNumber, StudentId[]>
>;
export type ClassroomControlGroupNames = Partial<
  Record<ClassroomControlGroupNumber, string>
>;

export interface ClassroomDesk {
  studentId: StudentId;
  x: number;
  y: number;
  rotation: DeskRotation;
}

export interface ClassroomLabel {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
}

export interface ClassroomLayout {
  version: typeof CLASSROOM_LAYOUT_VERSION;
  desks: ClassroomDesk[];
  controlGroups?: ClassroomControlGroups;
  controlGroupNames?: ClassroomControlGroupNames;
  labels?: ClassroomLabel[];
  width?: number;
  height?: number;
}
