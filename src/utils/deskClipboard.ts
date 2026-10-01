import { DeskRotation } from "../types/classroomLayout.type";

export interface CopiedClassroomDesk {
  name: string;
  rotation: DeskRotation;
  offsetX: number;
  offsetY: number;
}

export interface CopiedClassroomLabel {
  text: string;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface CopiedClassroomSelection {
  desks: CopiedClassroomDesk[];
  labels: CopiedClassroomLabel[];
}

const emptySelection = (): CopiedClassroomSelection => ({
  desks: [],
  labels: [],
});

let copiedSelection: CopiedClassroomSelection = emptySelection();

export const copyClassroomSelection = (
  selection: CopiedClassroomSelection,
) => {
  copiedSelection = {
    desks: selection.desks.map((desk) => ({ ...desk })),
    labels: selection.labels.map((label) => ({ ...label })),
  };
};

export const getCopiedClassroomSelection = (): CopiedClassroomSelection =>
  copiedSelection;

export const clearCopiedClassroomSelection = () => {
  copiedSelection = emptySelection();
};
