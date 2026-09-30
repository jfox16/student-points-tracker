import { describe, expect, it } from "vitest";

import {
  CLASSROOM_LAYOUT_VERSION,
  ClassroomDesk,
} from "../types/classroomLayout.type";
import { Student } from "../types/student.type";
import {
  CLASSROOM_CHAIR_DEPTH,
  CLASSROOM_CHAIR_OFFSET,
  CLASSROOM_CHAIR_OVERLAP,
  CLASSROOM_CHAIR_WIDTH,
  CLASSROOM_DESK_FOOTPRINT_HEIGHT,
  CLASSROOM_DESK_FOOTPRINT_WIDTH,
  CLASSROOM_DESK_HEIGHT,
  CLASSROOM_DESK_WIDTH,
  CLASSROOM_GRID_SIZE,
  CLASSROOM_BOUNDS,
  CLASSROOM_LABEL_HEIGHT,
  CLASSROOM_LABEL_WIDTH,
  CLASSROOM_MAP_HEIGHT,
  CLASSROOM_MAP_WIDTH,
  assignClassroomControlGroup,
  addToClassroomControlGroup,
  toggleClassroomControlGroup,
  classroomDeskFootprintsOverlap,
  classroomDesksMatch,
  findClassroomDeskPastePositions,
  getClassroomDeskFootprint,
  getClassroomControlGroupNumber,
  getClassroomDeskPositionNearCenter,
  getClosestValidClassroomDeskPosition,
  getNextAvailableClassroomDeskPosition,
  clampClassroomLabelPosition,
  getClassroomLabels,
  getPlacedClassroomDesks,
  isClassroomDeskPlacementValid,
  isClassroomLabelPlacementValid,
  rotateDeskCounterClockwise,
  rotateDeskClockwise,
  snapToClassroomGrid,
} from "./classroomLayout";

const students: Student[] = [
  { id: "student-1", name: "Ada", points: 0 },
  { id: "student-2", name: "Grace", points: 0 },
];

describe("classroom control groups", () => {
  it("recognizes only number-row control group shortcuts", () => {
    expect(getClassroomControlGroupNumber("Digit1")).toBe(1);
    expect(getClassroomControlGroupNumber("Digit9")).toBe(9);
    expect(getClassroomControlGroupNumber("Digit0")).toBeUndefined();
    expect(getClassroomControlGroupNumber("Numpad1")).toBeUndefined();
  });

  it("assigns unique student IDs without changing other slots", () => {
    expect(
      assignClassroomControlGroup(
        { 1: ["student-1"] },
        2,
        ["student-2", "student-2"],
      ),
    ).toEqual({
      1: ["student-1"],
      2: ["student-2"],
    });
  });

  it("clears a group when the selection is already exactly that group", () => {
    expect(
      toggleClassroomControlGroup(
        { 1: ["student-2", "student-1"], 2: ["student-2"] },
        1,
        ["student-1", "student-2"],
      ),
    ).toEqual({
      2: ["student-2"],
    });
  });

  it("reassigns a group when the selection is only part of it", () => {
    expect(
      toggleClassroomControlGroup(
        { 1: ["student-1", "student-2"] },
        1,
        ["student-1"],
      ),
    ).toEqual({
      1: ["student-1"],
    });
  });

  it("adds selected students to a group without removing the ones already in it", () => {
    expect(
      addToClassroomControlGroup(
        { 1: ["student-1"], 2: ["student-2"] },
        1,
        ["student-2", "student-1"],
      ),
    ).toEqual({
      1: ["student-1", "student-2"],
      2: ["student-2"],
    });
  });
});

describe("getPlacedClassroomDesks", () => {
  it("starts with an empty map", () => {
    expect(getPlacedClassroomDesks(students)).toEqual([]);
  });

  it("loads explicitly placed desks and removes desks for deleted students", () => {
    const savedDesks: ClassroomDesk[] = [
      { studentId: "student-1", x: 425, y: 275, rotation: 90 },
      { studentId: "deleted-student", x: 10, y: 20, rotation: 0 },
    ];

    const desks = getPlacedClassroomDesks(students, {
      version: CLASSROOM_LAYOUT_VERSION,
      desks: savedDesks,
    });

    expect(desks[0]).toEqual({
      studentId: "student-1",
      x: 425,
      y: 275,
      rotation: 90,
    });
    expect(desks.some((desk) => desk.studentId === "deleted-student")).toBe(false);
  });

  it("ignores auto-generated layouts from the earlier prototype", () => {
    const oldLayout = {
      desks: [{ studentId: "student-1", x: 80, y: 80 }],
    };

    expect(getPlacedClassroomDesks(students, oldLayout as never)).toEqual([]);
  });
});

describe("classroomDesksMatch", () => {
  it("compares desk identity and position", () => {
    const desks: ClassroomDesk[] = [
      { studentId: "student-1", x: 80, y: 80, rotation: 0 },
      { studentId: "student-2", x: 290, y: 80, rotation: 0 },
    ];

    expect(classroomDesksMatch(desks, desks.map((desk) => ({ ...desk })))).toBe(true);
    expect(
      classroomDesksMatch(desks, [
        { ...desks[0], x: desks[0].x + 1 },
        desks[1],
      ]),
    ).toBe(false);
  });
});

describe("rotateDeskClockwise", () => {
  it("rotates through quarter turns", () => {
    expect(rotateDeskClockwise(0)).toBe(90);
    expect(rotateDeskClockwise(90)).toBe(180);
    expect(rotateDeskClockwise(180)).toBe(270);
    expect(rotateDeskClockwise(270)).toBe(0);
  });
});

describe("rotateDeskCounterClockwise", () => {
  it("rotates through quarter turns", () => {
    expect(rotateDeskCounterClockwise(0)).toBe(270);
    expect(rotateDeskCounterClockwise(270)).toBe(180);
    expect(rotateDeskCounterClockwise(180)).toBe(90);
    expect(rotateDeskCounterClockwise(90)).toBe(0);
  });
});

describe("classroom desk placement", () => {
  const firstDesk: ClassroomDesk = {
    studentId: "student-1",
    x: 0,
    y: 0,
    rotation: 0,
  };

  it("calculates the full desk and chair footprint from rotation", () => {
    expect(getClassroomDeskFootprint(firstDesk)).toEqual({
      x: 0,
      y: 0,
      width: CLASSROOM_DESK_FOOTPRINT_WIDTH,
      height: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
    });
    expect(
      getClassroomDeskFootprint({ ...firstDesk, rotation: 90 }),
    ).toEqual({
      x: 0,
      y: 0,
      width: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
      height: CLASSROOM_DESK_FOOTPRINT_WIDTH,
    });
  });

  it("allows touching footprints but rejects overlaps", () => {
    const touchingDesk: ClassroomDesk = {
      studentId: "student-2",
      x: CLASSROOM_DESK_FOOTPRINT_WIDTH,
      y: 0,
      rotation: 0,
    };

    expect(classroomDeskFootprintsOverlap(firstDesk, touchingDesk)).toBe(false);
    expect(
      classroomDeskFootprintsOverlap(firstDesk, {
        ...touchingDesk,
        x: touchingDesk.x - CLASSROOM_GRID_SIZE,
      }),
    ).toBe(true);
  });

  it("keeps placements inside the large classroom floor", () => {
    expect(
      isClassroomDeskPlacementValid(
        {
          ...firstDesk,
          x: CLASSROOM_MAP_WIDTH - CLASSROOM_DESK_FOOTPRINT_WIDTH,
          y: CLASSROOM_MAP_HEIGHT - CLASSROOM_DESK_FOOTPRINT_HEIGHT,
        },
        [],
      ),
    ).toBe(true);
    expect(
      isClassroomDeskPlacementValid(
        {
          ...firstDesk,
          x: -CLASSROOM_GRID_SIZE,
        },
        [],
      ),
    ).toBe(false);
  });

  it("ignores the moving desk itself while rejecting other desks", () => {
    expect(isClassroomDeskPlacementValid(firstDesk, [firstDesk])).toBe(true);
    expect(
      isClassroomDeskPlacementValid(firstDesk, [
        firstDesk,
        {
          studentId: "student-2",
          x: CLASSROOM_GRID_SIZE,
          y: CLASSROOM_GRID_SIZE,
          rotation: 0,
        },
      ]),
    ).toBe(false);
  });

  it("finds the closest valid position beside an obstructing desk", () => {
    const obstructingDesk: ClassroomDesk = {
      studentId: "student-2",
      x: CLASSROOM_DESK_FOOTPRINT_WIDTH,
      y: 0,
      rotation: 0,
    };
    const movingDesk: ClassroomDesk = {
      ...firstDesk,
      x: CLASSROOM_DESK_FOOTPRINT_WIDTH - CLASSROOM_GRID_SIZE,
    };

    expect(
      getClosestValidClassroomDeskPosition(movingDesk, [obstructingDesk]),
    ).toEqual({ x: 0, y: 0 });
  });

  it("places the next desk in the first open space after an anchor", () => {
    const bounds = {
      width: CLASSROOM_DESK_FOOTPRINT_WIDTH * 4,
      height: CLASSROOM_DESK_FOOTPRINT_HEIGHT * 2,
    };
    const blocker: ClassroomDesk = {
      studentId: "student-2",
      x: CLASSROOM_DESK_FOOTPRINT_WIDTH - CLASSROOM_GRID_SIZE,
      y: 0,
      rotation: 0,
    };

    expect(
      getNextAvailableClassroomDeskPosition(firstDesk, [firstDesk], 0, bounds),
    ).toEqual({ x: CLASSROOM_DESK_FOOTPRINT_WIDTH, y: 0 });
    expect(
      getNextAvailableClassroomDeskPosition(
        firstDesk,
        [firstDesk, blocker],
        90,
        bounds,
      ),
    ).toEqual({
      x: blocker.x + CLASSROOM_DESK_FOOTPRINT_WIDTH,
      y: 0,
    });
    expect(
      getNextAvailableClassroomDeskPosition(firstDesk, [firstDesk], 0, {
        width: CLASSROOM_DESK_FOOTPRINT_WIDTH,
        height: CLASSROOM_DESK_FOOTPRINT_HEIGHT * 2,
      }),
    ).toEqual({ x: 0, y: CLASSROOM_DESK_FOOTPRINT_HEIGHT });
  });

  it("places a desk near the middle when that spot is open or blocked", () => {
    const footprint = getClassroomDeskFootprint(firstDesk);
    const center = {
      x: snapToClassroomGrid((CLASSROOM_MAP_WIDTH - footprint.width) / 2),
      y: snapToClassroomGrid((CLASSROOM_MAP_HEIGHT - footprint.height) / 2),
    };

    expect(getClassroomDeskPositionNearCenter(0, [])).toEqual(center);

    const centerDesk: ClassroomDesk = {
      ...firstDesk,
      ...center,
    };
    const besideCenter = getClassroomDeskPositionNearCenter(0, [centerDesk]);
    expect(besideCenter).toBeDefined();
    expect(isClassroomDeskPlacementValid(
      { ...firstDesk, studentId: "student-2", ...besideCenter },
      [centerDesk],
    )).toBe(true);
    expect(
      (besideCenter!.x - center.x) ** 2 + (besideCenter!.y - center.y) ** 2,
    ).toBe(footprint.height ** 2);
  });

  it("chains pasted desks after the anchor, or from the middle when there is none", () => {
    const center = getClassroomDeskPositionNearCenter(0, [])!;
    const footprint = getClassroomDeskFootprint(firstDesk);

    expect(findClassroomDeskPastePositions(
      [{ rotation: 0 }, { rotation: 180 }],
      [],
    )).toEqual([
      { ...center, rotation: 0 },
      {
        x: center.x + footprint.width,
        y: center.y,
        rotation: 180,
      },
    ]);
    expect(findClassroomDeskPastePositions(
      [{ rotation: 90 }],
      [firstDesk],
      firstDesk,
    )).toEqual([{
      x: CLASSROOM_DESK_FOOTPRINT_WIDTH,
      y: 0,
      rotation: 90,
    }]);
  });
});

describe("classroom text boxes", () => {
  it("loads saved text boxes only for the current layout version", () => {
    expect(getClassroomLabels({
      version: CLASSROOM_LAYOUT_VERSION,
      desks: [],
      labels: [{ id: "label-1", x: 40, y: 60, text: "Front" }],
    })).toEqual([{
      id: "label-1",
      x: 40,
      y: 60,
      text: "Front",
      width: CLASSROOM_LABEL_WIDTH,
      height: CLASSROOM_LABEL_HEIGHT,
    }]);

    expect(getClassroomLabels({
      version: CLASSROOM_LAYOUT_VERSION,
      desks: [],
    })).toEqual([]);
    expect(getClassroomLabels({ desks: [] } as never)).toEqual([]);
  });

  it("keeps a text box inside the classroom and on the grid", () => {
    expect(CLASSROOM_LABEL_WIDTH % CLASSROOM_GRID_SIZE).toBe(0);
    expect(CLASSROOM_LABEL_HEIGHT % CLASSROOM_GRID_SIZE).toBe(0);
    expect(clampClassroomLabelPosition(-15, 28)).toEqual({ x: 0, y: 20 });
    expect(isClassroomLabelPlacementValid({ x: 0, y: 20 })).toBe(true);

    const farCorner = clampClassroomLabelPosition(99999, 99999);
    expect(isClassroomLabelPlacementValid(farCorner)).toBe(true);
    expect(isClassroomLabelPlacementValid({
      x: CLASSROOM_MAP_WIDTH,
      y: 0,
    })).toBe(false);
  });

  it("keeps a resized text box inside the classroom", () => {
    expect(getClassroomLabels({
      version: CLASSROOM_LAYOUT_VERSION,
      desks: [],
      labels: [{ id: "label-1", x: 40, y: 60, text: "", width: 80, height: 40 }],
    })).toEqual([{
      id: "label-1",
      x: 40,
      y: 60,
      text: "",
      width: 80,
      height: 40,
    }]);

    expect(clampClassroomLabelPosition(
      CLASSROOM_MAP_WIDTH,
      CLASSROOM_MAP_HEIGHT,
      CLASSROOM_BOUNDS,
      { width: 80, height: 40 },
    )).toEqual({
      x: CLASSROOM_MAP_WIDTH - 80,
      y: CLASSROOM_MAP_HEIGHT - 40,
    });
    expect(isClassroomLabelPlacementValid({
      x: CLASSROOM_MAP_WIDTH - 40,
      y: 0,
      width: 80,
      height: 40,
    })).toBe(false);
  });
});

describe("snapToClassroomGrid", () => {
  it("uses desk dimensions that align exactly to grid cells", () => {
    [
      CLASSROOM_DESK_WIDTH,
      CLASSROOM_DESK_HEIGHT,
      CLASSROOM_CHAIR_WIDTH,
      CLASSROOM_CHAIR_DEPTH,
      CLASSROOM_CHAIR_OVERLAP,
      CLASSROOM_CHAIR_OFFSET,
      CLASSROOM_DESK_FOOTPRINT_WIDTH,
      CLASSROOM_DESK_FOOTPRINT_HEIGHT,
    ].forEach((dimension) => {
      expect(dimension % CLASSROOM_GRID_SIZE).toBe(0);
    });
  });

  it("derives the total footprint from the real desk and chair dimensions", () => {
    expect(CLASSROOM_DESK_FOOTPRINT_WIDTH).toBe(CLASSROOM_DESK_WIDTH);
    expect(CLASSROOM_DESK_FOOTPRINT_HEIGHT).toBe(
      CLASSROOM_DESK_HEIGHT +
        CLASSROOM_CHAIR_DEPTH -
        CLASSROOM_CHAIR_OVERLAP,
    );
  });

  it("snaps positions to a fine-grained grid", () => {
    expect(snapToClassroomGrid(CLASSROOM_GRID_SIZE + 8)).toBe(CLASSROOM_GRID_SIZE);
    expect(snapToClassroomGrid(CLASSROOM_GRID_SIZE + 12)).toBe(CLASSROOM_GRID_SIZE * 2);
  });
});
