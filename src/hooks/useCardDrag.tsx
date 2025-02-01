import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

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
}

export function useCardDrag(props: UseCardDragProps) {
  const {
    item,
    dragHoverIndex,
    setDragHoverIndex,
    moveCard,
    type,
    index,
  } = props;
  const dragObjectRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const handleHover = (draggedItem: { index: number }, monitor: any) => {
    if (!monitor.isOver({ shallow: true }) || draggedItem.index === index) return;

    const newDragHoverIndex = getDropIndex(monitor.getClientOffset()?.x, dragObjectRef.current, index);
    if (dragHoverIndex) {
      setDragHoverIndex?.(newDragHoverIndex);
    }
  };

  // 🔹 Handles drop logic (moves item to `toIndex`)
  const handleDrop = (draggedItem: { index: number }, monitor: any) => {
    if (!monitor.isOver({ shallow: true }) || draggedItem.index === index) return;

    if (typeof dragHoverIndex === 'number') {
      moveCard(draggedItem.index, dragHoverIndex);
      draggedItem.index = dragHoverIndex;
    }
    setDragHoverIndex?.(-1); // Reset `toIndex` after drop
  };

  // 🔹 Drag behavior
  const [{ isDragging }, drag, preview] = useDrag({
    type: DRAG_TYPES[type],
    item: { item, index },
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
const getDropIndex = (clientX: number | undefined, element: HTMLElement | null, currentIndex: number) => {
  if (!clientX || !element) return currentIndex;
  const { left, right } = element.getBoundingClientRect();
  return clientX < (left + right) / 2 ? currentIndex : currentIndex + 1;
};
