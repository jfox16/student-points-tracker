import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CLASSROOM_LAYOUT_VERSION } from "../../types/classroomLayout.type";
import { DeskDetailsSidebar } from "./DeskDetailsSidebar";

const updateActiveTab = vi.fn();

vi.mock("../../context/ModalContext", () => ({
  useModal: () => ({ showModal: vi.fn() }),
}));

vi.mock("../../context/StudentContext", () => ({
  useStudentContext: () => ({
    addPointsToStudent: vi.fn(),
    students: [],
    updateStudent: vi.fn(),
  }),
}));

vi.mock("../../context/TabContext", () => ({
  useTabContext: () => ({
    activeTab: {
      id: "tab-1",
      classroomLayout: {
        version: CLASSROOM_LAYOUT_VERSION,
        desks: [],
        labels: [{ id: "label-1", x: 40, y: 40, text: "Front" }],
      },
      students: [],
      tabOptions: { mapEditMode: true },
    },
    updateActiveTab,
  }),
}));

describe("DeskDetailsSidebar rectangle", () => {
  it("edits the centered text for the selected rectangle", () => {
    updateActiveTab.mockReset();

    render(
      <DeskDetailsSidebar
        selectedLabelId="label-1"
        studentIds={new Set()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Rectangle" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Text" }), {
      target: { value: "Door" },
    });

    expect(updateActiveTab).toHaveBeenCalledWith({
      classroomLayout: expect.objectContaining({
        labels: [expect.objectContaining({ id: "label-1", text: "Door" })],
      }),
    });
  });
});
