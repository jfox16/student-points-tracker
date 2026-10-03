import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { clampClassroomMapSize } from "../../utils/classroomLayout";
import type { ClassroomBounds } from "../../utils/classroomLayout";

type ResizeEdge = "right" | "bottom" | "corner";

interface ClassroomMapFloorProps {
  editable: boolean;
  minimumSize: ClassroomBounds;
  onResize: (size: ClassroomBounds) => void;
  size: ClassroomBounds;
  zoom: number;
}

const GRID_VISIBLE_MIN_ZOOM = 0.4;

const resizeLabel: Record<ResizeEdge, string> = {
  right: "Resize classroom width",
  bottom: "Resize classroom height",
  corner: "Resize classroom",
};

export const ClassroomMapFloor = ({
  editable,
  minimumSize,
  onResize,
  size,
  zoom,
}: ClassroomMapFloorProps) => {
  const [draftSize, setDraftSize] = useState<ClassroomBounds | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const minimumSizeRef = useRef(minimumSize);
  const onResizeRef = useRef(onResize);
  const zoomRef = useRef(zoom);
  minimumSizeRef.current = minimumSize;
  onResizeRef.current = onResize;
  zoomRef.current = zoom;
  const displayedSize = draftSize ?? size;
  const showGrid = editable && zoom >= GRID_VISIBLE_MIN_ZOOM;

  useEffect(() => {
    if (
      draftSize &&
      draftSize.width === size.width &&
      draftSize.height === size.height
    ) {
      setDraftSize(null);
    }
  }, [draftSize, size.height, size.width]);

  useEffect(() => () => dragCleanupRef.current?.(), []);

  const startResize = (
    edge: ResizeEdge,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startSize = displayedSize;
    const dragZoom = zoomRef.current || 1;

    const sizeAt = (clientX: number, clientY: number) => clampClassroomMapSize(
      edge === "bottom" ? startSize.width : startSize.width + (clientX - startClientX) / dragZoom,
      edge === "right" ? startSize.height : startSize.height + (clientY - startClientY) / dragZoom,
      minimumSizeRef.current,
    );

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setDraftSize(sizeAt(moveEvent.clientX, moveEvent.clientY));
    };
    const stopDrag = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      dragCleanupRef.current = null;
    };
    const handlePointerUp = (upEvent: PointerEvent) => {
      stopDrag();
      const nextSize = sizeAt(upEvent.clientX, upEvent.clientY);
      if (nextSize.width === size.width && nextSize.height === size.height) {
        setDraftSize(null);
        return;
      }
      setDraftSize(nextSize);
      onResizeRef.current(nextSize);
    };

    dragCleanupRef.current?.();
    dragCleanupRef.current = stopDrag;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      className={
        showGrid
          ? "ClassroomMap__floor ClassroomMap__floor--edit"
          : "ClassroomMap__floor"
      }
      style={{
        width: displayedSize.width,
        height: displayedSize.height,
        "--classroom-resize-handle": `${12 / (zoom || 1)}px`,
        "--classroom-resize-corner": `${16 / (zoom || 1)}px`,
      } as CSSProperties}
      aria-hidden={editable ? undefined : true}
    >
      {editable && (["right", "bottom", "corner"] as const).map((edge) => (
        <button
          key={edge}
          aria-label={resizeLabel[edge]}
          className={`ClassroomMap__resize ClassroomMap__resize--${edge} nopan nodrag`}
          onPointerDown={(event) => startResize(edge, event)}
          type="button"
        />
      ))}
    </div>
  );
};
