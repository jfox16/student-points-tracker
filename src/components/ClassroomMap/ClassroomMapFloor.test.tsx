import { render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { ClassroomMapFloor } from "./ClassroomMapFloor";

const pointer = (
  target: EventTarget,
  type: string,
  clientX: number,
  clientY: number,
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: clientX },
    clientY: { value: clientY },
  });
  act(() => {
    target.dispatchEvent(event);
  });
};

describe("ClassroomMapFloor", () => {
  it("hides the resize handles outside edit mode", () => {
    render(
      <ClassroomMapFloor
        editable={false}
        minimumSize={{ width: 320, height: 240 }}
        onResize={vi.fn()}
        size={{ width: 400, height: 300 }}
        zoom={1}
      />,
    );

    expect(screen.queryByRole("button", { name: "Resize classroom" })).not.toBeInTheDocument();
    expect(document.querySelector(".ClassroomMap__floor--edit")).not.toBeInTheDocument();
  });

  it("hides gridlines when zoomed out far enough to artifact", () => {
    const { container } = render(
      <ClassroomMapFloor
        editable
        minimumSize={{ width: 320, height: 240 }}
        onResize={vi.fn()}
        size={{ width: 400, height: 300 }}
        zoom={0.3}
      />,
    );

    expect(container.querySelector(".ClassroomMap__floor--edit")).not.toBeInTheDocument();
  });

  it("shows gridlines at a closer zoom", () => {
    const { container } = render(
      <ClassroomMapFloor
        editable
        minimumSize={{ width: 320, height: 240 }}
        onResize={vi.fn()}
        size={{ width: 400, height: 300 }}
        zoom={1}
      />,
    );

    expect(container.querySelector(".ClassroomMap__floor--edit")).toBeInTheDocument();
  });

  it("drags an edge to the next grid size without covering the room's contents", () => {
    const onResize = vi.fn();
    render(
      <ClassroomMapFloor
        editable
        minimumSize={{ width: 400, height: 300 }}
        onResize={onResize}
        size={{ width: 400, height: 300 }}
        zoom={2}
      />,
    );

    const corner = screen.getByRole("button", { name: "Resize classroom" });
    pointer(corner, "pointerdown", 100, 80);
    pointer(window, "pointermove", 180, 160);
    pointer(window, "pointerup", 180, 160);

    expect(onResize).toHaveBeenCalledWith({ width: 440, height: 340 });
  });

  it("keeps the room large enough for what is already inside it", () => {
    const onResize = vi.fn();
    render(
      <ClassroomMapFloor
        editable
        minimumSize={{ width: 400, height: 300 }}
        onResize={onResize}
        size={{ width: 400, height: 300 }}
        zoom={1}
      />,
    );

    const corner = screen.getByRole("button", { name: "Resize classroom" });
    pointer(corner, "pointerdown", 100, 80);
    pointer(window, "pointermove", 20, 10);
    pointer(window, "pointerup", 20, 10);

    expect(onResize).not.toHaveBeenCalled();
  });
});