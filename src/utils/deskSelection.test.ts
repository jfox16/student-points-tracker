import { describe, expect, it } from "vitest";

import { applyDeskSelection, getDeskSelectionMode } from "./deskSelection";

const modifiers = {
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
};

describe("desk selection modifiers", () => {
  it("replaces on a plain click", () => {
    expect(getDeskSelectionMode(modifiers)).toBe("replace");
  });

  it("adds with command or control", () => {
    expect(getDeskSelectionMode({ ...modifiers, metaKey: true })).toBe("add");
    expect(getDeskSelectionMode({ ...modifiers, ctrlKey: true })).toBe("add");
    expect(getDeskSelectionMode({
      ...modifiers,
      metaKey: true,
      shiftKey: true,
    })).toBe("add");
  });

  it("removes with shift", () => {
    expect(getDeskSelectionMode({ ...modifiers, shiftKey: true })).toBe("remove");
  });

  it("ignores modifier keys on right click", () => {
    expect(getDeskSelectionMode({
      ...modifiers,
      button: 2,
      metaKey: true,
    })).toBe("replace");
  });

  it("adds and removes desks without changing the previous selection set", () => {
    const currentIds = new Set(["ada", "grace"]);

    expect(applyDeskSelection(currentIds, new Set(["lin"]), "add")).toEqual(
      new Set(["ada", "grace", "lin"]),
    );
    expect(applyDeskSelection(currentIds, new Set(["grace"]), "remove")).toEqual(
      new Set(["ada"]),
    );
    expect(applyDeskSelection(currentIds, new Set(["lin"]), "replace")).toEqual(
      new Set(["lin"]),
    );
    expect(currentIds).toEqual(new Set(["ada", "grace"]));
  });
});
