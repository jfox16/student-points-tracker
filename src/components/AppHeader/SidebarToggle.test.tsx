import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResizableSidebar } from "../ResizableSidebar/ResizableSidebar";
import { SidebarToggle } from "./SidebarToggle";

describe("SidebarToggle", () => {
  it("points the chevron toward the sidebar while it is open", () => {
    const { rerender } = render(
      <SidebarToggle
        edge="start"
        icon={<span>Classes</span>}
        label="classes"
        open
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Hide classes" })).toBeInTheDocument();
    expect(document.querySelector("[data-testid='ChevronLeftIcon']")).toBeInTheDocument();

    rerender(
      <SidebarToggle
        edge="end"
        icon={<span>Bank</span>}
        label="points bank"
        open
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Hide points bank" })).toBeInTheDocument();
    expect(document.querySelector("[data-testid='ChevronRightIcon']")).toBeInTheDocument();
  });

  it("points the chevron away from the sidebar while it is hidden", () => {
    render(
      <>
        <SidebarToggle
          edge="start"
          icon={<span>Classes</span>}
          label="classes"
          open={false}
          onClick={vi.fn()}
        />
        <SidebarToggle
          edge="end"
          icon={<span>Bank</span>}
          label="points bank"
          open={false}
          onClick={vi.fn()}
        />
      </>,
    );

    expect(screen.getByRole("button", { name: "Show classes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show points bank" })).toBeInTheDocument();
    expect(document.querySelectorAll("[data-testid='ChevronRightIcon']")).toHaveLength(1);
    expect(document.querySelectorAll("[data-testid='ChevronLeftIcon']")).toHaveLength(1);
  });
});

describe("ResizableSidebar", () => {
  it("uses a horizontal resize cursor on the drag edge", () => {
    render(
      <ResizableSidebar
        defaultWidth={200}
        handleEdge="right"
        label="Resize classes"
        maxWidth={360}
        minWidth={140}
        storageKey="classes_sidebar_width_test"
      >
        <div>Classes</div>
      </ResizableSidebar>,
    );

    const handle = screen.getByRole("separator", { name: "Resize classes" });
    expect(handle).toHaveStyle({ cursor: "ew-resize" });
    expect(handle.closest("aside")).toHaveStyle({ width: "200px" });
  });
});
