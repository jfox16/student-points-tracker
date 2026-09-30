import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PointsDisplay } from "../StudentCard/PointsCounter/PointsDisplay";
import { PointAdjuster } from "./PointAdjuster";

const popClass = "animate-[pop_0.08s_ease-out]";
const popDownClass = "animate-[pop-down_0.08s_ease-out]";

describe("point change animation", () => {
  it("does not pop when the value first appears", () => {
    const { container } = render(
      <PointsDisplay animationTrigger={4} points={4} readOnly />,
    );

    expect(container.querySelector(`[class*="${popClass}"]`)).toBeNull();
    expect(container.querySelector(`[class*="${popDownClass}"]`)).toBeNull();
  });

  it("pops only after the value increases or decreases", () => {
    const { container, rerender } = render(
      <PointsDisplay animationDirection="up" animationTrigger={4} points={4} readOnly />,
    );

    rerender(
      <PointsDisplay animationDirection="up" animationTrigger={5} points={5} readOnly />,
    );
    expect(container.querySelector(`[class*="${popClass}"]`)).toBeInTheDocument();

    rerender(
      <PointsDisplay animationDirection="down" animationTrigger={4} points={4} readOnly />,
    );
    expect(container.querySelector(`[class*="${popDownClass}"]`)).toBeInTheDocument();
  });

  it("pops a manual adjuster on button clicks, not on mount", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <PointAdjuster
        decrementLabel="Subtract one point"
        incrementLabel="Add one point"
        onDecrement={vi.fn()}
        onIncrement={vi.fn()}
        points={4}
        readOnly
      />,
    );

    expect(container.querySelector(`[class*="${popClass}"]`)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Add one point" }));
    expect(container.querySelector(`[class*="${popClass}"]`)).toBeInTheDocument();

    rerender(
      <PointAdjuster
        decrementLabel="Subtract one point"
        incrementLabel="Add one point"
        onDecrement={vi.fn()}
        onIncrement={vi.fn()}
        points={5}
        readOnly
      />,
    );

    await user.click(screen.getByRole("button", { name: "Subtract one point" }));
    expect(container.querySelector(`[class*="${popDownClass}"]`)).toBeInTheDocument();
  });
});
