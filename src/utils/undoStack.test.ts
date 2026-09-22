import { describe, expect, it } from "vitest";

import { AddPointsCommand } from "../types/undo.type";
import {
  EMPTY_UNDO_STACK,
  MAX_UNDO_HISTORY,
  pushUndoCommand,
  takeRedoCommand,
  takeUndoCommand,
} from "./undoStack";

const command = (delta: number): AddPointsCommand => ({
  type: "add-points",
  tabId: "tab-1",
  studentIds: ["student-1", "student-2"],
  delta,
});

describe("undoStack", () => {
  it("undoes the latest command and lets redo restore it", () => {
    const stacked = pushUndoCommand(
      pushUndoCommand(EMPTY_UNDO_STACK, command(1)),
      command(2),
    );

    const undone = takeUndoCommand(stacked);
    expect(undone.command).toEqual(command(2));
    expect(undone.stack.past).toEqual([command(1)]);

    const redone = takeRedoCommand(undone.stack);
    expect(redone.command).toEqual(command(2));
    expect(redone.stack.past).toEqual([command(1), command(2)]);
    expect(redone.stack.future).toEqual([]);
  });

  it("clears redo history when a new command is pushed", () => {
    const undone = takeUndoCommand(
      pushUndoCommand(EMPTY_UNDO_STACK, command(1)),
    );
    const stacked = pushUndoCommand(undone.stack, command(3));

    expect(stacked.future).toEqual([]);
    expect(takeRedoCommand(stacked).command).toBeUndefined();
  });

  it("keeps group point changes as a single command", () => {
    const stacked = pushUndoCommand(EMPTY_UNDO_STACK, command(1));

    expect(stacked.past).toHaveLength(1);
    expect(stacked.past[0].studentIds).toEqual(["student-1", "student-2"]);
  });

  it("caps history length", () => {
    const stacked = Array.from({ length: MAX_UNDO_HISTORY + 5 }, (_, index) =>
      command(index + 1),
    ).reduce(pushUndoCommand, EMPTY_UNDO_STACK);

    expect(stacked.past).toHaveLength(MAX_UNDO_HISTORY);
    expect(stacked.past[0]).toEqual(command(6));
  });
});
