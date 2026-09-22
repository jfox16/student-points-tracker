import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CLASSROOM_LAYOUT_VERSION } from "../../types/classroomLayout.type";
import { ClassroomMap } from "./ClassroomMap";

const addPointsToStudent = vi.fn();

vi.mock("../../context/AppContext", () => ({
  useAppContext: () => ({
    appOptions: { enableKeybinds: false },
  }),
}));

vi.mock("../../context/SoundContext", () => ({
  useSoundContext: () => ({
    playPointSound: vi.fn(),
    playSound: vi.fn(),
  }),
}));

vi.mock("../../context/StudentContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../context/StudentContext")>();
  return {
    ...actual,
    useStudentContext: () => ({
      addPointsToStudent,
      addPointsToStudents: vi.fn(),
      updateStudent: vi.fn(),
    }),
  };
});

vi.mock("../../context/TabContext", () => ({
  useTabContext: () => ({
    activeTab: {
      id: "tab-1",
      name: "Class 1",
      students: [{ id: "student-1", name: "Ada", points: 3 }],
      tabOptions: { viewMode: "map", mapEditMode: false },
      classroomLayout: {
        version: CLASSROOM_LAYOUT_VERSION,
        desks: [{ studentId: "student-1", x: 40, y: 40, rotation: 90 }],
      },
    },
    updateActiveTab: vi.fn(),
  }),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("ClassroomMap desk add-point button", () => {
  beforeEach(() => {
    addPointsToStudent.mockReset();
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("adds one point to that desk's student", () => {
    render(<ClassroomMap selectedStudentIds={new Set()} />);

    fireEvent.click(screen.getByLabelText("Add one point to Ada"));

    expect(addPointsToStudent).toHaveBeenCalledWith("student-1", 1);
  });

  it("uses a grab cursor class while space is held", () => {
    const { container } = render(<ClassroomMap selectedStudentIds={new Set()} />);
    const map = container.querySelector(".ClassroomMap");

    expect(map).not.toHaveClass("ClassroomMap--space-pan");

    fireEvent.keyDown(window, { code: "Space" });
    expect(map).toHaveClass("ClassroomMap--space-pan");

    fireEvent.keyUp(window, { code: "Space" });
    expect(map).not.toHaveClass("ClassroomMap--space-pan");
  });
});
