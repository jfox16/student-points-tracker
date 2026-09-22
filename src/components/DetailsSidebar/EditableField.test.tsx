import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EditableField } from "./EditableField";

describe("EditableField", () => {
  it("labels its input and reports edited values", () => {
    const handleChange = vi.fn();

    render(
      <EditableField
        label="Student name"
        onChange={handleChange}
        value=""
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Student name" }),
      { target: { value: "Ada" } },
    );

    expect(handleChange).toHaveBeenCalledWith("Ada");
  });
});
