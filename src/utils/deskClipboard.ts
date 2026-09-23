import { DeskRotation } from "../types/classroomLayout.type";

export interface CopiedClassroomDesk {
  name: string;
  rotation: DeskRotation;
}

let copiedDesks: CopiedClassroomDesk[] = [];

export const copyClassroomDesks = (desks: readonly CopiedClassroomDesk[]) => {
  copiedDesks = desks.map((desk) => ({ ...desk }));
};

export const getCopiedClassroomDesks = (): readonly CopiedClassroomDesk[] =>
  copiedDesks;

export const clearCopiedClassroomDesks = () => {
  copiedDesks = [];
};
