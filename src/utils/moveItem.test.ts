import { describe, expect, it } from "vitest";

import { moveItem, reorderDestination } from "./moveItem";

describe("reorderDestination", () => {
  it("inserts before the hovered gap, accounting for the removed item", () => {
    expect(moveItem(["A", "B", "C"], 0, reorderDestination(0, 2))).toEqual([
      "B",
      "A",
      "C",
    ]);
    expect(moveItem(["A", "B", "C"], 0, reorderDestination(0, 3))).toEqual([
      "B",
      "C",
      "A",
    ]);
    expect(moveItem(["A", "B", "C"], 2, reorderDestination(2, 0))).toEqual([
      "C",
      "A",
      "B",
    ]);
  });
});
