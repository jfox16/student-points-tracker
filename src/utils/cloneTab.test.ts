import { describe, expect, it } from "vitest";

import { CLASSROOM_LAYOUT_VERSION } from "../types/classroomLayout.type";
import { Tab } from "../types/tab.type";
import { cloneTab, copiedTabName } from "./cloneTab";

const source: Tab = {
  id: "class-1",
  name: "Period 1",
  students: [
    { id: "student-1", name: "Ada", points: 4, selected: true },
    { id: "student-2", name: "Grace", points: 1 },
  ],
  tabOptions: { columns: 6, viewMode: "map" },
  classroomLayout: {
    version: CLASSROOM_LAYOUT_VERSION,
    desks: [
      { studentId: "student-1", x: 10, y: 20, rotation: 90 },
      { studentId: "student-2", x: 40, y: 20, rotation: 0 },
    ],
    labels: [{ id: "label-1", x: 0, y: 0, text: "Front", width: 80, height: 40 }],
    controlGroups: { 1: ["student-1", "student-2"] },
  },
};

describe("copiedTabName", () => {
  it("numbers repeated copies", () => {
    expect(copiedTabName("Period 1")).toBe("Period 1 copy");
    expect(copiedTabName("Period 1 copy")).toBe("Period 1 copy 2");
    expect(copiedTabName("Period 1 copy 2")).toBe("Period 1 copy 3");
    expect(copiedTabName("")).toBe("");
  });
});

describe("cloneTab", () => {
  it("copies students and the classroom layout under new ids", () => {
    const ids = ["s-copy-1", "s-copy-2", "class-copy", "label-copy"];
    const copy = cloneTab(source, () => ids.shift() ?? "extra");

    expect(copy.id).toBe("class-copy");
    expect(copy.name).toBe("Period 1 copy");
    expect(copy.students).toEqual([
      { id: "s-copy-1", name: "Ada", points: 4, selected: false },
      { id: "s-copy-2", name: "Grace", points: 1, selected: false },
    ]);
    expect(copy.classroomLayout).toEqual({
      version: CLASSROOM_LAYOUT_VERSION,
      desks: [
        { studentId: "s-copy-1", x: 10, y: 20, rotation: 90 },
        { studentId: "s-copy-2", x: 40, y: 20, rotation: 0 },
      ],
      labels: [{ id: "label-copy", x: 0, y: 0, text: "Front", width: 80, height: 40 }],
      controlGroups: { 1: ["s-copy-1", "s-copy-2"] },
    });
    expect(copy.tabOptions).toEqual(source.tabOptions);
    expect(copy.tabOptions).not.toBe(source.tabOptions);
  });
});
