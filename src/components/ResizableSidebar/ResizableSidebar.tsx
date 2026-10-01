import {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import "./ResizableSidebar.css";

const clampWidth = (value: number, minWidth: number, maxWidth: number) =>
  Math.min(maxWidth, Math.max(minWidth, value));

const readWidth = (
  storageKey: string,
  fallback: number,
  minWidth: number,
  maxWidth: number,
) => {
  const storedValue = localStorage.getItem(storageKey);
  const stored = Number(storedValue);
  if (storedValue == null || storedValue === "" || !Number.isFinite(stored)) {
    return fallback;
  }
  return clampWidth(stored, minWidth, maxWidth);
};

interface ResizableSidebarProps {
  children: ReactNode;
  className?: string;
  defaultWidth: number;
  handleEdge: "left" | "right";
  label: string;
  maxWidth: number;
  minWidth: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  storageKey: string;
}

export const ResizableSidebar = ({
  children,
  className,
  defaultWidth,
  handleEdge,
  label,
  maxWidth,
  minWidth,
  onMouseEnter,
  onMouseLeave,
  storageKey,
}: ResizableSidebarProps) => {
  const [width, setWidth] = useState(() =>
    readWidth(storageKey, defaultWidth, minWidth, maxWidth),
  );
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => () => {
    if (dragRef.current) document.body.style.cursor = "";
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startWidth: width };
    document.body.style.cursor = "ew-resize";
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta = handleEdge === "left"
      ? dragRef.current.startX - event.clientX
      : event.clientX - dragRef.current.startX;
    const nextWidth = clampWidth(
      dragRef.current.startWidth + delta,
      minWidth,
      maxWidth,
    );
    widthRef.current = nextWidth;
    setWidth(nextWidth);
  };

  const finishResize = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    document.body.style.cursor = "";
    localStorage.setItem(storageKey, String(widthRef.current));
  };

  return (
    <aside
      className={["ResizableSidebar", className].filter(Boolean).join(" ")}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ width }}
    >
      <div
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemax={maxWidth}
        aria-valuemin={minWidth}
        aria-valuenow={width}
        className={`ResizableSidebar__handle ResizableSidebar__handle--${handleEdge}`}
        onPointerCancel={finishResize}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishResize}
        role="separator"
        style={{ cursor: "ew-resize" }}
      />
      {children}
    </aside>
  );
};
