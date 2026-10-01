import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import { reorderDestination } from "../utils/moveItem";

/** Predefined drag types */
export const DRAG_TYPES = {
  STUDENT: "STUDENT",
  TAB: "TAB",
} as const;

type DragType = keyof typeof DRAG_TYPES;

interface UseCardDragProps {
  item: { id: string };
  dragHoverIndex?: number;
  setDragHoverIndex?: (dragHoverIndex: number) => void; // index < 0 means no hovered item
  moveCard: (fromIndex: number, toIndex: number) => void;
  type: DragType;
  index: number;
  axis?: "horizontal" | "vertical";
  onDragEnd?: () => void;
}

export function useCardDrag(props: UseCardDragProps) {
  const {
    item,
    dragHoverIndex,
    setDragHoverIndex,
    moveCard,
    type,
    index,
    axis = "horizontal",
    onDragEnd,
  } = props;
  const dragObjectRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const handleHover = (draggedItem: { index: number }, monitor: any) => {
    if (!monitor.isOver({ shallow: true }) || draggedItem.index === index) return;

    const offset = monitor.getClientOffset();
    const client = axis === "vertical" ? offset?.y : offset?.x;
    const newDragHoverIndex = getDropIndex(
      client,
      dragObjectRef.current,
      index,
      axis,
    );
    setDragHoverIndex?.(newDragHoverIndex);
  };

  // 🔹 Handles drop logic (moves item to `toIndex`)
  const handleDrop = (draggedItem: { index: number }, monitor: any) => {
    if (!monitor.isOver({ shallow: true }) || draggedItem.index === index) {
      setDragHoverIndex?.(-1);
      return;
    }

    if (typeof dragHoverIndex === "number" && dragHoverIndex >= 0) {
      const toIndex = axis === "vertical"
        ? reorderDestination(draggedItem.index, dragHoverIndex)
        : dragHoverIndex;
      moveCard(draggedItem.index, toIndex);
      draggedItem.index = toIndex;
    }
    setDragHoverIndex?.(-1);
  };

  // 🔹 Drag behavior
  const [{ isDragging }, drag, preview] = useDrag({
    type: DRAG_TYPES[type],
    item: { item, index },
    end: () => {
      setDragHoverIndex?.(-1);
      onDragEnd?.();
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  // 🔹 Drop behavior
  const [, drop] = useDrop({
    accept: DRAG_TYPES[type],
    hover: handleHover,
    drop: handleDrop,
  });

  drop(dragObjectRef);
  drag(dragHandleRef);
  preview(dragObjectRef);

  return { dragObjectRef, dragHandleRef, isDragging };
}

// 🔹 Determines drop index based on cursor position
const getDropIndex = (
  client: number | undefined,
  element: HTMLElement | null,
  currentIndex: number,
  axis: "horizontal" | "vertical",
) => {
  if (client == null || !element) return currentIndex;
  const rect = element.getBoundingClientRect();
  const start = axis === "vertical" ? rect.top : rect.left;
  const end = axis === "vertical" ? rect.bottom : rect.right;
  return client < (start + end) / 2 ? currentIndex : currentIndex + 1;
};
