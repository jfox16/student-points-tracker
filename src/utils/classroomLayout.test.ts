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
  CLASSROOM_MAP_MAX_HEIGHT,
  CLASSROOM_MAP_MAX_WIDTH,
  CLASSROOM_MAP_MIN_WIDTH,
  CLASSROOM_MAP_WIDTH,
  assignClassroomControlGroup,
  addToClassroomControlGroup,
  removeFromClassroomControlGroup,
  toggleClassroomControlGroup,
  clampClassroomMapSize,
  classroomDeskFootprintsOverlap,
  classroomDesksMatch,
  findClassroomDeskPastePositions,
  getClassroomDeskFootprint,
  getClassroomDesksBounds,
  getClassroomMapSize,
  getMinimumClassroomMapSize,
  getClassroomControlGroupNumber,
  getClassroomDeskPositionNearCenter,
  getClosestValidClassroomDeskPosition,
  getClosestValidClassroomDeskPositions,
  getNextAvailableClassroomDeskPosition,
  clampClassroomLabelPosition,
  getClassroomLabelTextSize,
  getClassroomLabels,
  getPlacedClassroomDesks,
  isClassroomDeskPlacementValid,
  isClassroomLabelPlacementValid,
  rotateClassroomDesks,
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
    expect(getClassroomControlGroupNumber("Digit8")).toBe(8);
    expect(getClassroomControlGroupNumber("Digit9")).toBeUndefined();
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

  it("moves assigned students out of their previous group", () => {
    expect(
      assignClassroomControlGroup(
        { 1: ["student-1", "student-2"], 3: ["student-3"] },
        2,
        ["student-2"],
      ),
    ).toEqual({
      1: ["student-1"],
      2: ["student-2"],
      3: ["student-3"],
    });
  });

  it("deletes a previous group once all its students have moved", () => {
    expect(
      addToClassroomControlGroup(
        { 1: ["student-1"], 2: ["student-2"] },
        2,
        ["student-1"],
      ),
    ).toEqual({
      2: ["student-2", "student-1"],
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

  it("removes selected students from a group and deletes the group when it is empty", () => {
    expect(
      removeFromClassroomControlGroup(
        { 1: ["student-1", "student-2"], 2: ["student-2"] },
        1,
        ["student-1"],
      ),
    ).toEqual({
      1: ["student-2"],
      2: ["student-2"],
    });

    expect(
      removeFromClassroomControlGroup(
        { 1: ["student-1"], 2: ["student-2"] },
        1,
        ["student-1", "student-2"],
      ),
    ).toEqual({
      2: ["student-2"],
    });
  });

  it("adds selected students to a group without removing the ones already in it", () => {
    expect(
      addToClassroomControlGroup(
        { 1: ["student-1"], 2: ["student-2", "student-3"] },
        1,
        ["student-2", "student-1"],
      ),
    ).toEqual({
      1: ["student-1", "student-2"],
      2: ["student-3"],
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

describe("rotateClassroomDesks", () => {
  const desks: ClassroomDesk[] = [
    { studentId: "a", x: 40, y: 40, rotation: 0 },
    { studentId: "b", x: 240, y: 40, rotation: 180 },
    { studentId: "c", x: 440, y: 40, rotation: 90 },
  ];

  it("turns the selected desks around the group and leaves the others in place", () => {
    expect(rotateClassroomDesks(desks, new Set(["a", "b"]), "clockwise")).toEqual([
      { studentId: "a", x: 140, y: 0, rotation: 90 },
      { studentId: "b", x: 140, y: 200, rotation: 270 },
      { studentId: "c", x: 440, y: 40, rotation: 90 },
    ]);
    expect(
      rotateClassroomDesks(desks, new Set(["a", "b"]), "counterclockwise"),
    ).toEqual([
      { studentId: "a", x: 140, y: 200, rotation: 270 },
      { studentId: "b", x: 140, y: 0, rotation: 90 },
      { studentId: "c", x: 440, y: 40, rotation: 90 },
    ]);
  });

  it("keeps a single desk in place while turning it", () => {
    expect(rotateClassroomDesks(
      [{ studentId: "a", x: 40, y: 80, rotation: 0 }],
      new Set(["a"]),
      "clockwise",
    )).toEqual([
      { studentId: "a", x: 40, y: 80, rotation: 90 },
    ]);
  });

  it("slides a group back inside the room instead of hanging over the edge", () => {
    expect(rotateClassroomDesks(
      [
        { studentId: "a", x: 0, y: 0, rotation: 0 },
        { studentId: "b", x: CLASSROOM_DESK_FOOTPRINT_WIDTH, y: 0, rotation: 0 },
      ],
      new Set(["a", "b"]),
      "clockwise",
    )).toEqual([
      { studentId: "a", x: CLASSROOM_DESK_FOOTPRINT_WIDTH / 2, y: 0, rotation: 90 },
      {
        studentId: "b",
        x: CLASSROOM_DESK_FOOTPRINT_WIDTH / 2,
        y: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
        rotation: 90,
      },
    ]);
  });

  it("rejects a rotation that would overlap another desk", () => {
    expect(rotateClassroomDesks(
      [
        { studentId: "a", x: 0, y: 0, rotation: 0 },
        { studentId: "b", x: CLASSROOM_DESK_FOOTPRINT_WIDTH, y: 0, rotation: 0 },
        {
          studentId: "c",
          x: CLASSROOM_DESK_FOOTPRINT_WIDTH / 2,
          y: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
          rotation: 0,
        },
      ],
      new Set(["a", "b"]),
      "clockwise",
    )).toBeUndefined();
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

  const deskBlock = (
    columns: number,
    rows: number,
    originX = 0,
    originY = 0,
  ): ClassroomDesk[] => Array.from({ length: columns * rows }, (_, index) => ({
    studentId: `block-${originX}-${originY}-${index}`,
    x: originX + (index % columns) * CLASSROOM_DESK_FOOTPRINT_WIDTH,
    y: originY + Math.floor(index / columns) * CLASSROOM_DESK_FOOTPRINT_HEIGHT,
    rotation: 0 as const,
  }));

  const translationBounds = {
    width: CLASSROOM_DESK_FOOTPRINT_WIDTH * 8,
    height: CLASSROOM_DESK_FOOTPRINT_HEIGHT * 6,
  };

  const closestTranslationBySearch = (
    movingDesks: ClassroomDesk[],
    desks: ClassroomDesk[],
    bounds: { width: number; height: number },
  ) => {
    const movingIds = new Set(movingDesks.map((desk) => desk.studentId));
    const stationaryDesks = desks.filter((desk) => !movingIds.has(desk.studentId));
    const footprints = movingDesks.map(getClassroomDeskFootprint);
    let dxMin = -Infinity;
    let dxMax = Infinity;
    let dyMin = -Infinity;
    let dyMax = Infinity;
    footprints.forEach((footprint) => {
      dxMin = Math.max(dxMin, -footprint.x);
      dyMin = Math.max(dyMin, -footprint.y);
      dxMax = Math.min(dxMax, bounds.width - footprint.width - footprint.x);
      dyMax = Math.min(dyMax, bounds.height - footprint.height - footprint.y);
    });
    if (dxMin > dxMax || dyMin > dyMax) return undefined;

    let best: { dx: number; dy: number; distanceSquared: number } | undefined;
    for (let dx = dxMin; dx <= dxMax; dx += CLASSROOM_GRID_SIZE) {
      for (let dy = dyMin; dy <= dyMax; dy += CLASSROOM_GRID_SIZE) {
        const placed = movingDesks.map((desk) => ({
          ...desk,
          x: desk.x + dx,
          y: desk.y + dy,
        }));
        const occupied = [...stationaryDesks, ...placed];
        const fits = placed.every((desk) =>
          isClassroomDeskPlacementValid(desk, occupied, bounds)
        );
        if (!fits) continue;
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
      }
    }

    return best && movingDesks.map(({ studentId, x, y }) => ({
      studentId,
      x: x + best!.dx,
      y: y + best!.dy,
    }));
  };

  it("slides a desk to the nearest side of a block, in line with the cursor", () => {
    const width = CLASSROOM_DESK_FOOTPRINT_WIDTH;
    const height = CLASSROOM_DESK_FOOTPRINT_HEIGHT;
    const block = deskBlock(4, 4);
    const movingDesk: ClassroomDesk = {
      studentId: "moving",
      x: width,
      y: height * 3 - CLASSROOM_GRID_SIZE,
      rotation: 0,
    };

    expect(getClosestValidClassroomDeskPosition(
      movingDesk,
      block,
      translationBounds,
    )).toEqual({ x: width, y: height * 4 });
    expect(getClosestValidClassroomDeskPositions(
      [movingDesk],
      block,
      translationBounds,
    )).toEqual(closestTranslationBySearch([movingDesk], block, translationBounds));
  });

  it("moves a selection to the closest fit beside a block instead of a corner", () => {
    const width = CLASSROOM_DESK_FOOTPRINT_WIDTH;
    const height = CLASSROOM_DESK_FOOTPRINT_HEIGHT;
    const block = deskBlock(4, 4);
    const movingDesks: ClassroomDesk[] = [
      { studentId: "a", x: width * 2, y: height, rotation: 0 },
      { studentId: "b", x: width * 3, y: height, rotation: 0 },
    ];

    const resolved = getClosestValidClassroomDeskPositions(
      movingDesks,
      block,
      translationBounds,
    );
    expect(resolved).toEqual([
      { studentId: "a", x: width * 4, y: height },
      { studentId: "b", x: width * 5, y: height },
    ]);
    expect(resolved).toEqual(
      closestTranslationBySearch(movingDesks, block, translationBounds),
    );
    resolved?.forEach((desk) => {
      const placed = movingDesks.map((movingDesk) => ({
        ...movingDesk,
        ...resolved!.find((position) => position.studentId === movingDesk.studentId),
      }));
      expect(isClassroomDeskPlacementValid(
        placed.find((candidate) => candidate.studentId === desk.studentId)!,
        [...block, ...placed],
        translationBounds,
      )).toBe(true);
    });
  });

  it("matches an exhaustive search around irregular obstacles", () => {
    const width = CLASSROOM_DESK_FOOTPRINT_WIDTH;
    const height = CLASSROOM_DESK_FOOTPRINT_HEIGHT;
    const wall = [
      ...deskBlock(3, 1, 0, height),
      ...deskBlock(1, 2, width * 2, 0),
    ];
    const movingDesks: ClassroomDesk[] = [
      { studentId: "a", x: width - CLASSROOM_GRID_SIZE, y: height - CLASSROOM_GRID_SIZE, rotation: 0 },
      { studentId: "b", x: width - CLASSROOM_GRID_SIZE, y: height * 2 - CLASSROOM_GRID_SIZE, rotation: 0 },
    ];

    expect(getClosestValidClassroomDeskPositions(
      movingDesks,
      wall,
      translationBounds,
    )).toEqual(closestTranslationBySearch(movingDesks, wall, translationBounds));
  });

  it("pulls an out-of-bounds desk back along the cursor", () => {
    expect(getClosestValidClassroomDeskPosition({
      ...firstDesk,
      x: -CLASSROOM_DESK_FOOTPRINT_WIDTH,
      y: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
    }, [])).toEqual({
      x: 0,
      y: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
    });
  });

  it("reports no placement when the selection cannot fit in the room", () => {
    expect(getClosestValidClassroomDeskPositions([
      firstDesk,
      {
        studentId: "student-2",
        x: CLASSROOM_DESK_FOOTPRINT_WIDTH,
        y: 0,
        rotation: 0,
      },
    ], [], {
      width: CLASSROOM_DESK_FOOTPRINT_WIDTH,
      height: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
    })).toBeUndefined();
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

  it("pastes a group in its original layout when the whole block fits", () => {
    const copies = [
      { rotation: 0 as const, offsetX: 0, offsetY: 0 },
      { rotation: 90 as const, offsetX: 0, offsetY: CLASSROOM_DESK_FOOTPRINT_HEIGHT },
    ];
    const besideAnchor = CLASSROOM_DESK_FOOTPRINT_WIDTH;

    expect(findClassroomDeskPastePositions(copies, [firstDesk], firstDesk)).toEqual([
      { x: besideAnchor, y: 0, rotation: 0 },
      { x: besideAnchor, y: CLASSROOM_DESK_FOOTPRINT_HEIGHT, rotation: 90 },
    ]);

    const groupWidth = CLASSROOM_DESK_FOOTPRINT_WIDTH * 2;
    const groupHeight = CLASSROOM_DESK_FOOTPRINT_HEIGHT;
    const center = {
      x: snapToClassroomGrid((CLASSROOM_MAP_WIDTH - groupWidth) / 2),
      y: snapToClassroomGrid((CLASSROOM_MAP_HEIGHT - groupHeight) / 2),
    };
    expect(findClassroomDeskPastePositions([
      { rotation: 0, offsetX: 0, offsetY: 0 },
      { rotation: 180, offsetX: CLASSROOM_DESK_FOOTPRINT_WIDTH, offsetY: 0 },
    ], [])).toEqual([
      { ...center, rotation: 0 },
      {
        x: center.x + CLASSROOM_DESK_FOOTPRINT_WIDTH,
        y: center.y,
        rotation: 180,
      },
    ]);
  });

  it("places a copied block level with the whole selection", () => {
    const bottomRight: ClassroomDesk = {
      studentId: "student-2",
      x: CLASSROOM_DESK_FOOTPRINT_WIDTH,
      y: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
      rotation: 0,
    };
    const selection = [firstDesk, bottomRight];
    const stride = CLASSROOM_DESK_FOOTPRINT_WIDTH;

    expect(findClassroomDeskPastePositions([
      { rotation: 0, offsetX: 0, offsetY: 0 },
      { rotation: 0, offsetX: stride, offsetY: 0 },
      { rotation: 0, offsetX: 0, offsetY: CLASSROOM_DESK_FOOTPRINT_HEIGHT },
      { rotation: 0, offsetX: stride, offsetY: CLASSROOM_DESK_FOOTPRINT_HEIGHT },
    ], selection, bottomRight, CLASSROOM_BOUNDS, getClassroomDesksBounds(selection))).toEqual([
      { x: stride * 2, y: 0, rotation: 0 },
      { x: stride * 3, y: 0, rotation: 0 },
      { x: stride * 2, y: CLASSROOM_DESK_FOOTPRINT_HEIGHT, rotation: 0 },
      { x: stride * 3, y: CLASSROOM_DESK_FOOTPRINT_HEIGHT, rotation: 0 },
    ]);
  });

  it("slides a copied group to the nearest open rectangle", () => {
    const blocker: ClassroomDesk = {
      studentId: "student-2",
      x: CLASSROOM_DESK_FOOTPRINT_WIDTH,
      y: 0,
      rotation: 0,
    };

    expect(findClassroomDeskPastePositions([
      { rotation: 0, offsetX: 0, offsetY: 0 },
      { rotation: 90, offsetX: CLASSROOM_DESK_FOOTPRINT_WIDTH, offsetY: 0 },
    ], [firstDesk, blocker], firstDesk)).toEqual([
      { x: CLASSROOM_DESK_FOOTPRINT_WIDTH * 2, y: 0, rotation: 0 },
      { x: CLASSROOM_DESK_FOOTPRINT_WIDTH * 3, y: 0, rotation: 90 },
    ]);
  });

  it("places a group one desk at a time when no rectangle fits the layout", () => {
    const bounds = {
      width: CLASSROOM_DESK_FOOTPRINT_WIDTH * 3,
      height: CLASSROOM_DESK_FOOTPRINT_HEIGHT,
    };

    expect(findClassroomDeskPastePositions([
      { rotation: 0, offsetX: 0, offsetY: 0 },
      { rotation: 180, offsetX: 0, offsetY: CLASSROOM_DESK_FOOTPRINT_HEIGHT },
    ], [firstDesk], firstDesk, bounds)).toEqual([
      { x: CLASSROOM_DESK_FOOTPRINT_WIDTH, y: 0, rotation: 0 },
      { x: CLASSROOM_DESK_FOOTPRINT_WIDTH * 2, y: 0, rotation: 180 },
    ]);
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

  it("picks theme text sizes from the rectangle's shorter side", () => {
    expect(getClassroomLabelTextSize({
      width: CLASSROOM_GRID_SIZE * 2,
      height: CLASSROOM_GRID_SIZE * 2,
    })).toBe("sm");
    expect(getClassroomLabelTextSize()).toBe("md");
    expect(getClassroomLabelTextSize({
      width: CLASSROOM_GRID_SIZE * 20,
      height: 160,
    })).toBe("lg");
    expect(getClassroomLabelTextSize({
      width: CLASSROOM_GRID_SIZE * 20,
      height: 240,
    })).toBe("xl");
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

describe("classroom map size", () => {
  it("keeps the default room until a size is saved", () => {
    expect(getClassroomMapSize()).toEqual({
      width: CLASSROOM_MAP_WIDTH,
      height: CLASSROOM_MAP_HEIGHT,
    });
    expect(getClassroomMapSize({
      version: CLASSROOM_LAYOUT_VERSION,
      desks: [],
      width: 640,
      height: 480,
    })).toEqual({ width: 640, height: 480 });
  });

  it("snaps a resize and will not cover desks or rectangles", () => {
    const desk: ClassroomDesk = {
      studentId: "student-1",
      x: 400,
      y: 200,
      rotation: 0,
    };
    const footprint = getClassroomDeskFootprint(desk);
    const minimum = getMinimumClassroomMapSize([desk], [{
      id: "label-1",
      x: 20,
      y: 500,
      width: 80,
      height: 40,
      text: "Text",
    }]);

    expect(minimum).toEqual({
      width: Math.max(CLASSROOM_MAP_MIN_WIDTH, desk.x + footprint.width),
      height: 540,
    });
    expect(clampClassroomMapSize(401, 12, minimum)).toEqual(minimum);
    expect(clampClassroomMapSize(99999, 99999, minimum)).toEqual({
      width: CLASSROOM_MAP_MAX_WIDTH,
      height: CLASSROOM_MAP_MAX_HEIGHT,
    });
  });
});
