import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CLASSROOM_LAYOUT_VERSION } from "../../types/classroomLayout.type";
import { ClassroomMap } from "./ClassroomMap";

const onDeskSelectionChange = vi.fn();

vi.mock("../../context/AppContext", () => ({
  useAppContext: () => ({
    appOptions: { enableKeybinds: true },
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
      addPointsToStudent: vi.fn(),
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
      students: [
        { id: "student-1", name: "Ada", points: 3 },
        { id: "student-2", name: "Grace", points: 1 },
      ],
      tabOptions: { viewMode: "map", mapEditMode: false },
      classroomLayout: {
        version: CLASSROOM_LAYOUT_VERSION,
        desks: [
          { studentId: "student-1", x: 40, y: 40, rotation: 90 },
          { studentId: "student-2", x: 200, y: 40, rotation: 90 },
        ],
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

const selectedIdsFromLastCall = () => {
  const selection = onDeskSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
  return Array.from(selection).sort();
};

const SelectionHarness = ({
  initialSelection,
}: {
  initialSelection: string[];
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState(
    () => new Set(initialSelection),
  );

  return (
    <ClassroomMap
      onDeskSelectionChange={(nextStudentIds) => {
        onDeskSelectionChange(nextStudentIds);
        setSelectedStudentIds((currentStudentIds) => {
          const selectionIsUnchanged =
            currentStudentIds.size === nextStudentIds.size &&
            Array.from(currentStudentIds).every((studentId) =>
              nextStudentIds.has(studentId)
            );
          return selectionIsUnchanged ? currentStudentIds : nextStudentIds;
        });
      }}
      selectedStudentIds={selectedStudentIds}
    />
  );
};

describe("ClassroomMap army selection", () => {
  beforeEach(() => {
    onDeskSelectionChange.mockReset();
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("adds a desk with command-click and removes one with shift-click", () => {
    render(<SelectionHarness initialSelection={["student-1"]} />);

    fireEvent.mouseDown(screen.getByText("Grace"), { button: 0, metaKey: true });

    expect(selectedIdsFromLastCall()).toEqual(["student-1", "student-2"]);

    fireEvent.mouseDown(screen.getByText("Ada"), { button: 0, shiftKey: true });

    expect(selectedIdsFromLastCall()).toEqual(["student-2"]);
  });

  it("does not change the selection when shift-clicking a desk's point button", () => {
    render(<SelectionHarness initialSelection={["student-1"]} />);

    fireEvent.mouseDown(screen.getByLabelText("Add one point to Ada"), {
      button: 0,
      shiftKey: true,
    });

    expect(onDeskSelectionChange).not.toHaveBeenCalled();
  });

  it("selects every desk on double-click and with command-a", () => {
    render(<SelectionHarness initialSelection={[]} />);

    fireEvent.doubleClick(screen.getByText("Ada"));
    expect(selectedIdsFromLastCall()).toEqual(["student-1", "student-2"]);

    onDeskSelectionChange.mockReset();
    fireEvent.keyDown(document.body, { code: "KeyA", key: "a", metaKey: true });
    expect(selectedIdsFromLastCall()).toEqual(["student-1", "student-2"]);
  });

  it("shows selection hotkeys beside the map hotkeys only while desks are selected", () => {
    const { rerender } = render(
      <ClassroomMap
        onDeskSelectionChange={onDeskSelectionChange}
        selectedStudentIds={new Set()}
      />,
    );

    expect(screen.queryByText(/click or drag adds/)).not.toBeInTheDocument();
    expect(screen.getByText(/\+1 point/)).toBeInTheDocument();

    rerender(
      <ClassroomMap
        onDeskSelectionChange={onDeskSelectionChange}
        selectedStudentIds={new Set(["student-1"])}
      />,
    );

    expect(screen.getByText(/click or drag adds/)).toBeInTheDocument();
    expect(screen.getByText(/\+1 point/)).toBeInTheDocument();
  });

  it("clears the selection with escape", () => {
    render(<SelectionHarness initialSelection={["student-1", "student-2"]} />);

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(selectedIdsFromLastCall()).toEqual([]);
  });
});
