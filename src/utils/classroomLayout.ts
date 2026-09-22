import {
  CLASSROOM_LAYOUT_VERSION,
  ClassroomControlGroupNumber,
  ClassroomControlGroups,
  ClassroomDesk,
  ClassroomLabel,
  ClassroomLayout,
  DeskRotation,
} from "../types/classroomLayout.type";
import { Student, StudentId } from "../types/student.type";

export const CLASSROOM_DESK_DRAG_TYPE = "application/x-classroom-desk";
export const CLASSROOM_LABEL_DRAG_TYPE = "application/x-classroom-label";
export const CLASSROOM_GRID_SIZE = 20;
export const CLASSROOM_MAP_WIDTH = CLASSROOM_GRID_SIZE * 150;
export const CLASSROOM_MAP_HEIGHT = CLASSROOM_GRID_SIZE * 100;
export const CLASSROOM_LABEL_WIDTH = CLASSROOM_GRID_SIZE * 12;
export const CLASSROOM_LABEL_HEIGHT = CLASSROOM_GRID_SIZE * 5;
export const CLASSROOM_LABEL_MIN_WIDTH = CLASSROOM_GRID_SIZE * 2;
export const CLASSROOM_LABEL_MIN_HEIGHT = CLASSROOM_GRID_SIZE * 2;
export const CLASSROOM_DESK_WIDTH = CLASSROOM_GRID_SIZE * 8;
export const CLASSROOM_DESK_HEIGHT = CLASSROOM_GRID_SIZE * 6;
export const CLASSROOM_CHAIR_WIDTH = Math.max(
  CLASSROOM_GRID_SIZE * 2,
  CLASSROOM_DESK_WIDTH - CLASSROOM_GRID_SIZE * 4,
);
export const CLASSROOM_CHAIR_DEPTH = Math.max(
  CLASSROOM_GRID_SIZE * 2,
  Math.round(
    CLASSROOM_DESK_HEIGHT / 2 / CLASSROOM_GRID_SIZE,
  ) * CLASSROOM_GRID_SIZE,
);
export const CLASSROOM_CHAIR_OVERLAP = CLASSROOM_GRID_SIZE;
export const CLASSROOM_CHAIR_OFFSET =
  (CLASSROOM_DESK_WIDTH - CLASSROOM_CHAIR_WIDTH) / 2;
export const CLASSROOM_DESK_FOOTPRINT_WIDTH = CLASSROOM_DESK_WIDTH;
export const CLASSROOM_DESK_FOOTPRINT_HEIGHT =
  CLASSROOM_DESK_HEIGHT +
  CLASSROOM_CHAIR_DEPTH -
  CLASSROOM_CHAIR_OVERLAP;

export interface ClassroomDeskFootprint {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClassroomBounds {
  width: number;
  height: number;
}

export const CLASSROOM_BOUNDS: ClassroomBounds = {
  width: CLASSROOM_MAP_WIDTH,
  height: CLASSROOM_MAP_HEIGHT,
};

export const snapToClassroomGrid = (value: number): number =>
  Math.round(value / CLASSROOM_GRID_SIZE) * CLASSROOM_GRID_SIZE;

export const rotateDeskClockwise = (rotation: DeskRotation): DeskRotation =>
  ((rotation + 90) % 360) as DeskRotation;

export const rotateDeskCounterClockwise = (
  rotation: DeskRotation,
): DeskRotation => ((rotation + 270) % 360) as DeskRotation;

export const getClassroomControlGroupNumber = (
  keyboardCode: string,
): ClassroomControlGroupNumber | undefined => {
  const match = keyboardCode.match(/^Digit([1-9])$/);
  return match
    ? Number(match[1]) as ClassroomControlGroupNumber
    : undefined;
};

export const assignClassroomControlGroup = (
  controlGroups: ClassroomControlGroups,
  groupNumber: ClassroomControlGroupNumber,
  studentIds: Iterable<StudentId>,
): ClassroomControlGroups => ({
  ...controlGroups,
  [groupNumber]: Array.from(new Set(studentIds)),
});

const haveSameStudentIds = (
  first: readonly StudentId[],
  second: readonly StudentId[],
): boolean =>
  first.length === second.length &&
  first.every((studentId) => second.includes(studentId));

export const toggleClassroomControlGroup = (
  controlGroups: ClassroomControlGroups,
  groupNumber: ClassroomControlGroupNumber,
  studentIds: Iterable<StudentId>,
): ClassroomControlGroups => {
  const selectedStudentIds = Array.from(new Set(studentIds));
  const groupedStudentIds = controlGroups[groupNumber] ?? [];

  if (
    selectedStudentIds.length > 0 &&
    haveSameStudentIds(selectedStudentIds, groupedStudentIds)
  ) {
    const remainingGroups = { ...controlGroups };
    delete remainingGroups[groupNumber];
    return remainingGroups;
  }

  return assignClassroomControlGroup(
    controlGroups,
    groupNumber,
    selectedStudentIds,
  );
};

export const addToClassroomControlGroup = (
  controlGroups: ClassroomControlGroups,
  groupNumber: ClassroomControlGroupNumber,
  studentIds: Iterable<StudentId>,
): ClassroomControlGroups => assignClassroomControlGroup(
  controlGroups,
  groupNumber,
  [...(controlGroups[groupNumber] ?? []), ...studentIds],
);

export const getClassroomDeskFootprint = (
  desk: ClassroomDesk,
): ClassroomDeskFootprint => {
  const isSideways = desk.rotation === 90 || desk.rotation === 270;

  return {
    x: desk.x,
    y: desk.y,
    width: isSideways
      ? CLASSROOM_DESK_FOOTPRINT_HEIGHT
      : CLASSROOM_DESK_FOOTPRINT_WIDTH,
    height: isSideways
      ? CLASSROOM_DESK_FOOTPRINT_WIDTH
      : CLASSROOM_DESK_FOOTPRINT_HEIGHT,
  };
};

export const classroomDeskFootprintsOverlap = (
  first: ClassroomDesk,
  second: ClassroomDesk,
): boolean => {
  const firstFootprint = getClassroomDeskFootprint(first);
  const secondFootprint = getClassroomDeskFootprint(second);

  return (
    firstFootprint.x < secondFootprint.x + secondFootprint.width &&
    firstFootprint.x + firstFootprint.width > secondFootprint.x &&
    firstFootprint.y < secondFootprint.y + secondFootprint.height &&
    firstFootprint.y + firstFootprint.height > secondFootprint.y
  );
};

export const isClassroomDeskPlacementValid = (
  desk: ClassroomDesk,
  desks: ClassroomDesk[],
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): boolean => {
  const footprint = getClassroomDeskFootprint(desk);

  return (
    footprint.x >= 0 &&
    footprint.y >= 0 &&
    footprint.x + footprint.width <= bounds.width &&
    footprint.y + footprint.height <= bounds.height &&
    desks.every(
      (otherDesk) =>
        otherDesk.studentId === desk.studentId ||
        !classroomDeskFootprintsOverlap(desk, otherDesk),
    )
  );
};

export const getClosestValidClassroomDeskPosition = (
  desk: ClassroomDesk,
  desks: ClassroomDesk[],
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): Pick<ClassroomDesk, "x" | "y"> => {
  if (isClassroomDeskPlacementValid(desk, desks, bounds)) {
    return { x: desk.x, y: desk.y };
  }

  const footprint = getClassroomDeskFootprint(desk);
  const otherFootprints = desks
    .filter((otherDesk) => otherDesk.studentId !== desk.studentId)
    .map(getClassroomDeskFootprint);
  const candidateXs = new Set([
    desk.x,
    0,
    bounds.width - footprint.width,
  ]);
  const candidateYs = new Set([
    desk.y,
    0,
    bounds.height - footprint.height,
  ]);

  otherFootprints.forEach((otherFootprint) => {
    candidateXs.add(otherFootprint.x - footprint.width);
    candidateXs.add(otherFootprint.x + otherFootprint.width);
    candidateYs.add(otherFootprint.y - footprint.height);
    candidateYs.add(otherFootprint.y + otherFootprint.height);
  });

  const candidates = Array.from(candidateXs).flatMap((x) =>
    Array.from(candidateYs).map((y) => ({
      x,
      y,
      distanceSquared: (x - desk.x) ** 2 + (y - desk.y) ** 2,
    })),
  );
  candidates.sort((first, second) =>
    first.distanceSquared - second.distanceSquared
  );

  const closestCandidate = candidates.find(({ x, y }) =>
    isClassroomDeskPlacementValid({ ...desk, x, y }, desks, bounds)
  );

  return closestCandidate
    ? { x: closestCandidate.x, y: closestCandidate.y }
    : { x: desk.x, y: desk.y };
};

export const getClassroomLabelSize = (
  label: Partial<Pick<ClassroomLabel, "width" | "height">> = {},
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): { width: number; height: number } => ({
  width: Math.min(
    Math.max(
      snapToClassroomGrid(label.width ?? CLASSROOM_LABEL_WIDTH),
      CLASSROOM_LABEL_MIN_WIDTH,
    ),
    bounds.width,
  ),
  height: Math.min(
    Math.max(
      snapToClassroomGrid(label.height ?? CLASSROOM_LABEL_HEIGHT),
      CLASSROOM_LABEL_MIN_HEIGHT,
    ),
    bounds.height,
  ),
});

export const isClassroomLabelPlacementValid = (
  label: Pick<ClassroomLabel, "x" | "y"> &
    Partial<Pick<ClassroomLabel, "width" | "height">>,
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): boolean => {
  const { width, height } = getClassroomLabelSize(label, bounds);
  return (
    label.x >= 0 &&
    label.y >= 0 &&
    label.x + width <= bounds.width &&
    label.y + height <= bounds.height
  );
};

export const clampClassroomLabelPosition = (
  x: number,
  y: number,
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
  size: { width: number; height: number } = {
    width: CLASSROOM_LABEL_WIDTH,
    height: CLASSROOM_LABEL_HEIGHT,
  },
): Pick<ClassroomLabel, "x" | "y"> => ({
  x: Math.min(
    Math.max(0, snapToClassroomGrid(x)),
    Math.max(0, bounds.width - size.width),
  ),
  y: Math.min(
    Math.max(0, snapToClassroomGrid(y)),
    Math.max(0, bounds.height - size.height),
  ),
});

export const getClassroomLabels = (
  layout?: ClassroomLayout,
): ClassroomLabel[] => {
  if (layout?.version !== CLASSROOM_LAYOUT_VERSION) return [];

  return (layout.labels ?? []).map((label) => ({
    id: label.id,
    x: label.x,
    y: label.y,
    text: label.text ?? "",
    ...getClassroomLabelSize(label),
  }));
};

export const getPlacedClassroomDesks = (
  students: Student[],
  layout?: ClassroomLayout,
): ClassroomDesk[] => {
  if (layout?.version !== CLASSROOM_LAYOUT_VERSION) return [];

  const studentIds = new Set(students.map((student) => student.id));
  return layout.desks
    .filter((desk) => studentIds.has(desk.studentId))
    .map((desk) => ({
      ...desk,
      rotation: desk.rotation ?? 0,
    }));
};

export const classroomDesksMatch = (
  first: ClassroomDesk[] = [],
  second: ClassroomDesk[] = [],
): boolean => {
  if (first.length !== second.length) return false;

  return first.every((desk, index) => {
    const otherDesk = second[index];
    return (
      desk.studentId === otherDesk.studentId &&
      desk.x === otherDesk.x &&
      desk.y === otherDesk.y &&
      desk.rotation === otherDesk.rotation
    );
  });
};
