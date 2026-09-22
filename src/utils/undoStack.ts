import { UndoCommand, UndoStack } from "../types/undo.type";

export const EMPTY_UNDO_STACK: UndoStack = {
  past: [],
  future: [],
};

export const MAX_UNDO_HISTORY = 100;

export const pushUndoCommand = (
  stack: UndoStack,
  command: UndoCommand,
): UndoStack => ({
  past: [...stack.past, command].slice(-MAX_UNDO_HISTORY),
  future: [],
});

export const takeUndoCommand = (
  stack: UndoStack,
): { stack: UndoStack; command?: UndoCommand } => {
  if (stack.past.length === 0) return { stack };

  const command = stack.past[stack.past.length - 1];
  return {
    command,
    stack: {
      past: stack.past.slice(0, -1),
      future: [...stack.future, command],
    },
  };
};

export const takeRedoCommand = (
  stack: UndoStack,
): { stack: UndoStack; command?: UndoCommand } => {
  if (stack.future.length === 0) return { stack };

  const command = stack.future[stack.future.length - 1];
  return {
    command,
    stack: {
      past: [...stack.past, command],
      future: stack.future.slice(0, -1),
    },
  };
};
