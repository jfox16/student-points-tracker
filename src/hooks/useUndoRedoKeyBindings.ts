import { useEffect } from "react";

interface UseUndoRedoKeyBindingsProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    || target.isContentEditable;
};

export const useUndoRedoKeyBindings = ({
  undo,
  redo,
  canUndo,
  canRedo,
}: UseUndoRedoKeyBindingsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || !(event.metaKey || event.ctrlKey)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          if (canRedo) redo();
          return;
        }
        if (canUndo) undo();
        return;
      }

      if (key === "y" && !event.metaKey && event.ctrlKey && canRedo) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canRedo, canUndo, redo, undo]);
};
