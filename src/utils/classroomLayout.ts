import {
  CLASSROOM_CONTROL_GROUP_NUMBERS,
  CLASSROOM_LAYOUT_VERSION,
  ClassroomControlGroupNumber,
  ClassroomControlGroupNames,
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
export const CLASSROOM_MAP_MIN_WIDTH = CLASSROOM_GRID_SIZE * 16;
export const CLASSROOM_MAP_MIN_HEIGHT = CLASSROOM_GRID_SIZE * 12;
export const CLASSROOM_MAP_MAX_WIDTH = CLASSROOM_GRID_SIZE * 250;
export const CLASSROOM_MAP_MAX_HEIGHT = CLASSROOM_GRID_SIZE * 180;
export const CLASSROOM_LABEL_WIDTH = CLASSROOM_GRID_SIZE * 12;
export const CLASSROOM_LABEL_HEIGHT = CLASSROOM_GRID_SIZE * 5;
export const CLASSROOM_LABEL_MIN_WIDTH = CLASSROOM_GRID_SIZE * 2;
export const CLASSROOM_LABEL_MIN_HEIGHT = CLASSROOM_GRID_SIZE * 2;
export const CLASSROOM_LABEL_DEFAULT_TEXT = "Text";
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
  const match = keyboardCode.match(/^Digit([1-8])$/);
  return match
    ? Number(match[1]) as ClassroomControlGroupNumber
    : undefined;
};

export const defaultControlGroupName = (
  groupNumber: ClassroomControlGroupNumber,
) => `Group ${groupNumber}`;

export const withDefaultControlGroupName = (
  names: ClassroomControlGroupNames | undefined,
  groupNumber: ClassroomControlGroupNumber,
): ClassroomControlGroupNames => {
  if (names?.[groupNumber]?.trim()) return names ?? {};
  return {
    ...names,
    [groupNumber]: defaultControlGroupName(groupNumber),
  };
};

export const withMissingControlGroupNames = (
  layout: ClassroomLayout | undefined,
): ClassroomLayout | undefined => {
  if (!layout) return layout;

  const controlGroups = layout.controlGroups ?? {};
  const controlGroupNames = layout.controlGroupNames ?? {};
  const missingNames = CLASSROOM_CONTROL_GROUP_NUMBERS.filter((groupNumber) =>
    (controlGroups[groupNumber]?.length ?? 0) > 0 &&
    controlGroupNames[groupNumber] == null
  );
  if (missingNames.length === 0) return layout;

  return {
    ...layout,
    controlGroupNames: {
      ...controlGroupNames,
      ...Object.fromEntries(missingNames.map((groupNumber) => [
        groupNumber,
        defaultControlGroupName(groupNumber),
      ])),
    },
  };
};

// A student belongs to at most one group, so assigning moves them out of
// any other group. Groups left empty are deleted.
export const assignClassroomControlGroup = (
  controlGroups: ClassroomControlGroups,
  groupNumber: ClassroomControlGroupNumber,
  studentIds: Iterable<StudentId>,
): ClassroomControlGroups => {
  const assignedStudentIds = Array.from(new Set(studentIds));
  const assignedIdSet = new Set(assignedStudentIds);
  const nextControlGroups: ClassroomControlGroups = {};

  (Object.keys(controlGroups).map(Number) as ClassroomControlGroupNumber[])
    .forEach((otherGroupNumber) => {
      if (otherGroupNumber === groupNumber) return;
      const remainingStudentIds = (controlGroups[otherGroupNumber] ?? []).filter(
        (studentId) => !assignedIdSet.has(studentId),
      );
      if (remainingStudentIds.length > 0) {
        nextControlGroups[otherGroupNumber] = remainingStudentIds;
      }
    });

  nextControlGroups[groupNumber] = assignedStudentIds;
  return nextControlGroups;
};

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

export const removeFromClassroomControlGroup = (
  controlGroups: ClassroomControlGroups,
  groupNumber: ClassroomControlGroupNumber,
  studentIds: Iterable<StudentId>,
): ClassroomControlGroups => {
  const removedStudentIds = new Set(studentIds);
  const groupedStudentIds = controlGroups[groupNumber] ?? [];
  const remainingStudentIds = groupedStudentIds.filter(
    (studentId) => !removedStudentIds.has(studentId),
  );
  if (remainingStudentIds.length === groupedStudentIds.length) return controlGroups;
  if (remainingStudentIds.length === 0) {
    const remainingGroups = { ...controlGroups };
    delete remainingGroups[groupNumber];
    return remainingGroups;
  }

  return { ...controlGroups, [groupNumber]: remainingStudentIds };
};

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

const rectanglesOverlap = (
  first: ClassroomDeskFootprint,
  second: ClassroomDeskFootprint,
): boolean => (
  first.x < second.x + second.width &&
  first.x + first.width > second.x &&
  first.y < second.y + second.height &&
  first.y + first.height > second.y
);

export const classroomDeskFootprintsOverlap = (
  first: ClassroomDesk,
  second: ClassroomDesk,
): boolean => rectanglesOverlap(
  getClassroomDeskFootprint(first),
  getClassroomDeskFootprint(second),
);

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

interface OpenSpan {
  start: number;
  end: number;
}

interface ForbiddenTranslation {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// Closed [start, end] minus the open cuts. Endpoints of a cut stay available
// because desks may touch without counting as an overlap.
const freeSegments = (
  start: number,
  end: number,
  cuts: readonly OpenSpan[],
): OpenSpan[] => {
  if (end < start) return [];

  const overlapping = cuts
    .filter((cut) => cut.start < cut.end && cut.start < end && cut.end > start)
    .sort((first, second) =>
      first.start - second.start || first.end - second.end
    );
  const free: OpenSpan[] = [];
  let cursor = start;

  overlapping.forEach((cut) => {
    if (cursor > end) return;
    if (cursor <= cut.start) {
      free.push({ start: cursor, end: Math.min(end, cut.start) });
    }
    if (cut.end > cursor) cursor = cut.end;
  });
  if (cursor <= end) free.push({ start: cursor, end });

  return free;
};

// Translate the whole selection together to the valid spot nearest the
// positions it was dragged to. Each dragged desk against each stationary
// desk becomes an open rectangle of illegal translations; the nearest legal
// point is on the boundary of that region.
export const getClosestValidClassroomDeskPositions = (
  movingDesks: readonly ClassroomDesk[],
  desks: readonly ClassroomDesk[],
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): Pick<ClassroomDesk, "studentId" | "x" | "y">[] | undefined => {
  if (movingDesks.length === 0) return [];

  const movingIds = new Set(movingDesks.map((desk) => desk.studentId));
  let dxMin = -Infinity;
  let dxMax = Infinity;
  let dyMin = -Infinity;
  let dyMax = Infinity;
  const movingFootprints = movingDesks.map((desk) => {
    const footprint = getClassroomDeskFootprint(desk);
    dxMin = Math.max(dxMin, -footprint.x);
    dyMin = Math.max(dyMin, -footprint.y);
    dxMax = Math.min(dxMax, bounds.width - footprint.width - footprint.x);
    dyMax = Math.min(dyMax, bounds.height - footprint.height - footprint.y);
    return footprint;
  });
  if (dxMin > dxMax || dyMin > dyMax) return undefined;

  const forbidden: ForbiddenTranslation[] = [];
  desks.forEach((stationaryDesk) => {
    if (movingIds.has(stationaryDesk.studentId)) return;
    const obstacle = getClassroomDeskFootprint(stationaryDesk);
    movingFootprints.forEach((footprint) => {
      const rect = {
        left: obstacle.x - footprint.width - footprint.x,
        right: obstacle.x + obstacle.width - footprint.x,
        top: obstacle.y - footprint.height - footprint.y,
        bottom: obstacle.y + obstacle.height - footprint.y,
      };
      if (
        rect.right <= rect.left ||
        rect.bottom <= rect.top ||
        rect.right <= dxMin ||
        rect.left >= dxMax ||
        rect.bottom <= dyMin ||
        rect.top >= dyMax
      ) return;
      forbidden.push(rect);
    });
  });

  const originBlocked = forbidden.some((rect) =>
    0 > rect.left && 0 < rect.right && 0 > rect.top && 0 < rect.bottom
  );
  if (
    dxMin <= 0 && dxMax >= 0 &&
    dyMin <= 0 && dyMax >= 0 &&
    !originBlocked
  ) {
    return movingDesks.map(({ studentId, x, y }) => ({ studentId, x, y }));
  }

  let best: { dx: number; dy: number; distanceSquared: number } | undefined;
  const consider = (dx: number, dy: number) => {
    const distanceSquared = dx * dx + dy * dy;
    if (
      !best ||
      distanceSquared < best.distanceSquared ||
      (
        distanceSquared === best.distanceSquared &&
        (dy < best.dy || (dy === best.dy && dx < best.dx))
      )
    ) {
      best = { dx, dy, distanceSquared };
    }
  };
  const considerVertical = (x: number, span: OpenSpan) => {
    consider(x, Math.min(span.end, Math.max(span.start, 0)));
  };
  const considerHorizontal = (y: number, span: OpenSpan) => {
    consider(Math.min(span.end, Math.max(span.start, 0)), y);
  };

  const verticalCuts = (x: number) => forbidden.flatMap((rect) => (
    x > rect.left && x < rect.right
      ? [{ start: rect.top, end: rect.bottom }]
      : []
  ));
  const horizontalCuts = (y: number) => forbidden.flatMap((rect) => (
    y > rect.top && y < rect.bottom
      ? [{ start: rect.left, end: rect.right }]
      : []
  ));
  const visitVertical = (x: number, top: number, bottom: number) => {
    if (x < dxMin || x > dxMax) return;
    const start = Math.max(top, dyMin);
    const end = Math.min(bottom, dyMax);
    freeSegments(start, end, verticalCuts(x)).forEach((span) => {
      considerVertical(x, span);
    });
  };
  const visitHorizontal = (y: number, left: number, right: number) => {
    if (y < dyMin || y > dyMax) return;
    const start = Math.max(left, dxMin);
    const end = Math.min(right, dxMax);
    freeSegments(start, end, horizontalCuts(y)).forEach((span) => {
      considerHorizontal(y, span);
    });
  };

  forbidden.forEach((rect) => {
    visitVertical(rect.left, rect.top, rect.bottom);
    visitVertical(rect.right, rect.top, rect.bottom);
    visitHorizontal(rect.top, rect.left, rect.right);
    visitHorizontal(rect.bottom, rect.left, rect.right);
  });
  visitVertical(dxMin, dyMin, dyMax);
  visitVertical(dxMax, dyMin, dyMax);
  visitHorizontal(dyMin, dxMin, dxMax);
  visitHorizontal(dyMax, dxMin, dxMax);

  if (!best) return undefined;

  return movingDesks.map(({ studentId, x, y }) => ({
    studentId,
    x: x + best!.dx,
    y: y + best!.dy,
  }));
};

export const getClosestValidClassroomDeskPosition = (
  desk: ClassroomDesk,
  desks: ClassroomDesk[],
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): Pick<ClassroomDesk, "x" | "y"> => {
  const [closest] = getClosestValidClassroomDeskPositions([desk], desks, bounds)
    ?? [];
  return closest ? { x: closest.x, y: closest.y } : { x: desk.x, y: desk.y };
};

const rotateAroundCenter = (
  x: number,
  y: number,
  pivotX: number,
  pivotY: number,
  direction: "clockwise" | "counterclockwise",
) => {
  const dx = x - pivotX;
  const dy = y - pivotY;
  return direction === "clockwise"
    ? { x: pivotX - dy, y: pivotY + dx }
    : { x: pivotX + dy, y: pivotY - dx };
};

export const rotateClassroomDesks = (
  desks: ClassroomDesk[],
  studentIds: ReadonlySet<StudentId>,
  direction: "clockwise" | "counterclockwise",
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): ClassroomDesk[] | undefined => {
  const selectedDesks = desks.filter((desk) => studentIds.has(desk.studentId));
  if (selectedDesks.length === 0) return undefined;

  const footprints = selectedDesks.map(getClassroomDeskFootprint);
  const minX = Math.min(...footprints.map((footprint) => footprint.x));
  const minY = Math.min(...footprints.map((footprint) => footprint.y));
  const maxX = Math.max(...footprints.map((footprint) => footprint.x + footprint.width));
  const maxY = Math.max(...footprints.map((footprint) => footprint.y + footprint.height));
  const pivotX = (minX + maxX) / 2;
  const pivotY = (minY + maxY) / 2;
  const rotate = direction === "clockwise"
    ? rotateDeskClockwise
    : rotateDeskCounterClockwise;

  const rotatedSelected = selectedDesks.map((desk) => {
    const footprint = getClassroomDeskFootprint(desk);
    const nextRotation = rotate(desk.rotation);
    const nextFootprint = getClassroomDeskFootprint({
      ...desk,
      rotation: nextRotation,
      x: 0,
      y: 0,
    });
    const nextCenter = rotateAroundCenter(
      footprint.x + footprint.width / 2,
      footprint.y + footprint.height / 2,
      pivotX,
      pivotY,
      direction,
    );
    return {
      ...desk,
      rotation: nextRotation,
      x: nextCenter.x - nextFootprint.width / 2,
      y: nextCenter.y - nextFootprint.height / 2,
    };
  });

  const rotatedFootprints = rotatedSelected.map(getClassroomDeskFootprint);
  const groupMinX = Math.min(...rotatedFootprints.map((footprint) => footprint.x));
  const groupMinY = Math.min(...rotatedFootprints.map((footprint) => footprint.y));
  const groupMaxX = Math.max(...rotatedFootprints.map(
    (footprint) => footprint.x + footprint.width,
  ));
  const groupMaxY = Math.max(...rotatedFootprints.map(
    (footprint) => footprint.y + footprint.height,
  ));
  if (
    groupMaxX - groupMinX > bounds.width ||
    groupMaxY - groupMinY > bounds.height
  ) {
    return undefined;
  }

  let shiftX = snapToClassroomGrid(groupMinX) - groupMinX;
  let shiftY = snapToClassroomGrid(groupMinY) - groupMinY;
  const snappedMinX = groupMinX + shiftX;
  const snappedMinY = groupMinY + shiftY;
  const snappedMaxX = groupMaxX + shiftX;
  const snappedMaxY = groupMaxY + shiftY;
  if (snappedMinX < 0) shiftX -= snappedMinX;
  else if (snappedMaxX > bounds.width) shiftX += bounds.width - snappedMaxX;
  if (snappedMinY < 0) shiftY -= snappedMinY;
  else if (snappedMaxY > bounds.height) shiftY += bounds.height - snappedMaxY;

  const placedSelected = rotatedSelected.map((desk) => ({
    ...desk,
    x: snapToClassroomGrid(desk.x + shiftX),
    y: snapToClassroomGrid(desk.y + shiftY),
  }));
  const placedById = new Map(
    placedSelected.map((desk) => [desk.studentId, desk]),
  );
  const nextDesks = desks.map((desk) => placedById.get(desk.studentId) ?? desk);
  const fits = placedSelected.every((desk) =>
    isClassroomDeskPlacementValid(desk, nextDesks, bounds)
  );
  return fits ? nextDesks : undefined;
};

const PLACEMENT_PROBE_STUDENT_ID = "classroom-desk-placement-probe";

const ceilToClassroomGrid = (value: number) =>
  Math.ceil(value / CLASSROOM_GRID_SIZE) * CLASSROOM_GRID_SIZE;

const floorToClassroomGrid = (value: number) =>
  Math.floor(value / CLASSROOM_GRID_SIZE) * CLASSROOM_GRID_SIZE;

export const clampClassroomMapSize = (
  width: number,
  height: number,
  minimum: ClassroomBounds = {
    width: CLASSROOM_MAP_MIN_WIDTH,
    height: CLASSROOM_MAP_MIN_HEIGHT,
  },
): ClassroomBounds => ({
  width: Math.max(
    minimum.width,
    Math.min(CLASSROOM_MAP_MAX_WIDTH, snapToClassroomGrid(width)),
  ),
  height: Math.max(
    minimum.height,
    Math.min(CLASSROOM_MAP_MAX_HEIGHT, snapToClassroomGrid(height)),
  ),
});

export const getMinimumClassroomMapSize = (
  desks: ClassroomDesk[],
  labels: ClassroomLabel[] = [],
): ClassroomBounds => {
  let width = CLASSROOM_MAP_MIN_WIDTH;
  let height = CLASSROOM_MAP_MIN_HEIGHT;

  desks.forEach((desk) => {
    const footprint = getClassroomDeskFootprint(desk);
    width = Math.max(width, footprint.x + footprint.width);
    height = Math.max(height, footprint.y + footprint.height);
  });
  labels.forEach((label) => {
    const size = getClassroomLabelSize(label);
    width = Math.max(width, label.x + size.width);
    height = Math.max(height, label.y + size.height);
  });

  return {
    width: ceilToClassroomGrid(width),
    height: ceilToClassroomGrid(height),
  };
};

export const getClassroomMapSize = (
  layout?: ClassroomLayout,
  minimum?: ClassroomBounds,
): ClassroomBounds => clampClassroomMapSize(
  layout?.version === CLASSROOM_LAYOUT_VERSION
    ? layout.width ?? CLASSROOM_MAP_WIDTH
    : CLASSROOM_MAP_WIDTH,
  layout?.version === CLASSROOM_LAYOUT_VERSION
    ? layout.height ?? CLASSROOM_MAP_HEIGHT
    : CLASSROOM_MAP_HEIGHT,
  minimum,
);

const placementProbe = (
  rotation: DeskRotation,
  position: Pick<ClassroomDesk, "x" | "y"> = { x: 0, y: 0 },
): ClassroomDesk => ({
  studentId: PLACEMENT_PROBE_STUDENT_ID,
  rotation,
  ...position,
});

// First open cell in reading order after a desk: the rest of its row,
// then the rows below, then the rows above, then the cells behind it.
export const getNextAvailableClassroomDeskPosition = (
  afterDesk: Pick<ClassroomDesk, "x" | "y" | "rotation">,
  desks: ClassroomDesk[],
  rotation: DeskRotation = afterDesk.rotation,
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): Pick<ClassroomDesk, "x" | "y"> | undefined => {
  const anchorFootprint = getClassroomDeskFootprint({
    ...placementProbe(afterDesk.rotation, afterDesk),
    studentId: `${PLACEMENT_PROBE_STUDENT_ID}-anchor`,
  });
  const placedFootprint = getClassroomDeskFootprint(placementProbe(rotation));
  const maxX = bounds.width - placedFootprint.width;
  const maxY = bounds.height - placedFootprint.height;
  if (maxX < 0 || maxY < 0) return undefined;

  const startX = ceilToClassroomGrid(anchorFootprint.x + anchorFootprint.width);
  const startY = snapToClassroomGrid(afterDesk.y);
  const step = CLASSROOM_GRID_SIZE;
  const placementAt = (x: number, y: number) =>
    isClassroomDeskPlacementValid(placementProbe(rotation, { x, y }), desks, bounds)
      ? { x, y }
      : undefined;

  const scanRow = (y: number, fromX: number, toX: number) => {
    for (let x = fromX; x <= toX; x += step) {
      const position = placementAt(x, y);
      if (position) return position;
    }
    return undefined;
  };

  if (startY >= 0 && startY <= maxY) {
    const besideAnchor = scanRow(startY, Math.max(0, startX), maxX);
    if (besideAnchor) return besideAnchor;
  }

  for (let y = Math.max(0, startY + step); y <= maxY; y += step) {
    const position = scanRow(y, 0, maxX);
    if (position) return position;
  }

  for (let y = 0; y <= Math.min(maxY, startY - step); y += step) {
    const position = scanRow(y, 0, maxX);
    if (position) return position;
  }

  if (startY >= 0 && startY <= maxY && startX > 0) {
    return scanRow(startY, 0, Math.min(maxX, startX - step));
  }

  return undefined;
};

export const getClassroomDeskPositionNearCenter = (
  rotation: DeskRotation,
  desks: ClassroomDesk[],
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
): Pick<ClassroomDesk, "x" | "y"> | undefined => {
  const footprint = getClassroomDeskFootprint(placementProbe(rotation));
  const preferred = placementProbe(rotation, {
    x: snapToClassroomGrid((bounds.width - footprint.width) / 2),
    y: snapToClassroomGrid((bounds.height - footprint.height) / 2),
  });
  if (!isClassroomDeskPlacementValid(preferred, [], bounds)) return undefined;

  const position = getClosestValidClassroomDeskPosition(preferred, desks, bounds);
  return isClassroomDeskPlacementValid({ ...preferred, ...position }, desks, bounds)
    ? position
    : undefined;
};

interface ClassroomDeskPasteCopy {
  rotation: DeskRotation;
  offsetX?: number;
  offsetY?: number;
}

const getPasteGroupFootprint = (
  copies: readonly Required<ClassroomDeskPasteCopy>[],
): ClassroomDeskFootprint => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  copies.forEach((copy, index) => {
    const footprint = getClassroomDeskFootprint({
      studentId: `${PLACEMENT_PROBE_STUDENT_ID}-group-${index}`,
      x: copy.offsetX,
      y: copy.offsetY,
      rotation: copy.rotation,
    });
    minX = Math.min(minX, footprint.x);
    minY = Math.min(minY, footprint.y);
    maxX = Math.max(maxX, footprint.x + footprint.width);
    maxY = Math.max(maxY, footprint.y + footprint.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const getClassroomDesksBounds = (
  desks: readonly Pick<ClassroomDesk, "x" | "y" | "rotation">[],
): ClassroomDeskFootprint | undefined => {
  if (desks.length === 0) return undefined;

  return getPasteGroupFootprint(desks.map((desk) => ({
    rotation: desk.rotation,
    offsetX: desk.x,
    offsetY: desk.y,
  })));
};

// Slide the whole copied arrangement to the nearest open rectangle.
// Returns nothing when no single spot can hold every desk.
const findClassroomDeskGroupPastePositions = (
  copies: readonly Required<ClassroomDeskPasteCopy>[],
  desks: ClassroomDesk[],
  anchor: Pick<ClassroomDesk, "x" | "y" | "rotation"> | undefined,
  bounds: ClassroomBounds,
  near?: ClassroomDeskFootprint,
): Pick<ClassroomDesk, "x" | "y" | "rotation">[] | undefined => {
  const group = getPasteGroupFootprint(copies);
  const maxX = bounds.width - group.width;
  const maxY = bounds.height - group.height;
  if (maxX < 0 || maxY < 0) return undefined;

  const anchorFootprint = near ?? (anchor
    ? getClassroomDeskFootprint({
      ...placementProbe(anchor.rotation, anchor),
      studentId: `${PLACEMENT_PROBE_STUDENT_ID}-anchor`,
    })
    : undefined);
  const preferredX = anchorFootprint
    ? ceilToClassroomGrid(anchorFootprint.x + anchorFootprint.width)
    : snapToClassroomGrid((bounds.width - group.width) / 2);
  const preferredY = anchorFootprint
    ? snapToClassroomGrid(anchorFootprint.y)
    : snapToClassroomGrid((bounds.height - group.height) / 2);

  const candidateXs = new Set<number>([
    0,
    preferredX,
    floorToClassroomGrid(maxX),
  ]);
  const candidateYs = new Set<number>([
    0,
    preferredY,
    floorToClassroomGrid(maxY),
  ]);
  desks.forEach((desk) => {
    const footprint = getClassroomDeskFootprint(desk);
    candidateXs.add(ceilToClassroomGrid(footprint.x + footprint.width));
    candidateXs.add(floorToClassroomGrid(footprint.x - group.width));
    candidateYs.add(ceilToClassroomGrid(footprint.y + footprint.height));
    candidateYs.add(floorToClassroomGrid(footprint.y - group.height));
  });

  const occupied = desks.map(getClassroomDeskFootprint);
  const fits = (x: number, y: number) => {
    if (x < 0 || y < 0 || x > maxX || y > maxY) return false;
    const groupRect = { x, y, width: group.width, height: group.height };
    return occupied.every((footprint) => !rectanglesOverlap(groupRect, footprint));
  };

  const candidates = Array.from(candidateXs).flatMap((x) =>
    Array.from(candidateYs).map((y) => ({
      x,
      y,
      distanceSquared: (x - preferredX) ** 2 + (y - preferredY) ** 2,
    })),
  );
  candidates.sort((first, second) =>
    first.distanceSquared - second.distanceSquared
    || first.y - second.y
    || first.x - second.x
  );

  const origin = candidates.find(({ x, y }) => fits(x, y));
  if (!origin) return undefined;

  return copies.map((copy) => ({
    x: origin.x + copy.offsetX - group.x,
    y: origin.y + copy.offsetY - group.y,
    rotation: copy.rotation,
  }));
};

export const findClassroomDeskPastePositions = (
  copies: readonly ClassroomDeskPasteCopy[],
  desks: ClassroomDesk[],
  anchor?: Pick<ClassroomDesk, "x" | "y" | "rotation">,
  bounds: ClassroomBounds = CLASSROOM_BOUNDS,
  near?: ClassroomDeskFootprint,
): Pick<ClassroomDesk, "x" | "y" | "rotation">[] => {
  const copiesWithLayout = copies.flatMap((copy) => (
    copy.offsetX === undefined || copy.offsetY === undefined
      ? []
      : [{
        rotation: copy.rotation,
        offsetX: copy.offsetX,
        offsetY: copy.offsetY,
      }]
  ));
  if (copies.length > 1 && copiesWithLayout.length === copies.length) {
    const grouped = findClassroomDeskGroupPastePositions(
      copiesWithLayout,
      desks,
      anchor,
      bounds,
      near,
    );
    if (grouped) return grouped;
  }

  const occupied = [...desks];
  const positions: Pick<ClassroomDesk, "x" | "y" | "rotation">[] = [];
  let nextAnchor = anchor;

  for (let index = 0; index < copies.length; index += 1) {
    const rotation = copies[index].rotation;
    const position = nextAnchor
      ? getNextAvailableClassroomDeskPosition(nextAnchor, occupied, rotation, bounds)
      : getClassroomDeskPositionNearCenter(rotation, occupied, bounds);
    if (!position) break;

    const placed: ClassroomDesk = {
      studentId: `${PLACEMENT_PROBE_STUDENT_ID}-${index}`,
      rotation,
      ...position,
    };
    occupied.push(placed);
    positions.push({ ...position, rotation });
    nextAnchor = placed;
  }

  return positions;
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

export type ClassroomLabelTextSize = "sm" | "md" | "lg" | "xl";

export const getClassroomLabelTextSize = (
  size: Partial<Pick<ClassroomLabel, "width" | "height">> = {},
): ClassroomLabelTextSize => {
  const { width, height } = getClassroomLabelSize(size);
  const minSide = Math.min(width, height);
  if (minSide >= 240) return "xl";
  if (minSide >= 160) return "lg";
  if (minSide >= 80) return "md";
  return "sm";
};

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

