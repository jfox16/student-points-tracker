import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CLASSROOM_LAYOUT_VERSION, ClassroomDesk } from "../../types/classroomLayout.type";
import { Student } from "../../types/student.type";
import { TabViewMode } from "../../types/tabOptions.type";
import { DeskDetailsSidebar } from "./DeskDetailsSidebar";

const updateActiveTab = vi.fn();
const addPointsToStudents = vi.fn();
const onDeskSelectionChange = vi.fn();
const sidebarState = vi.hoisted(() => ({
  desks: [] as ClassroomDesk[],
  students: [] as Student[],
  controlGroups: {} as Record<string, string[]>,
  viewMode: "map" as TabViewMode,
}));

vi.mock("../../context/ModalContext", () => ({
  useModal: () => ({ showModal: vi.fn() }),
}));

vi.mock("../../context/StudentContext", () => ({
  useStudentContext: () => ({
    addPointsToStudent: vi.fn(),
    addPointsToStudents,
    students: sidebarState.students,
    updateStudent: vi.fn(),
  }),
}));

vi.mock("../../context/BankContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../context/BankContext")>();
  return {
    ...actual,
    useBankContext: () => ({
      bankedPoints: {},
      depositPoints: vi.fn(),
      sortOption: actual.SortOption.ALPHABETICAL,
      setSortOption: vi.fn(),
    }),
  };
});

vi.mock("../../context/AppContext", () => ({
  useAppContext: () => ({
    appOptions: { pointSound: "bark" },
    updateAppOptions: vi.fn(),
  }),
}));

vi.mock("../../context/TabContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../context/TabContext")>();
  return {
    ...actual,
    useTabContext: () => ({
      activeTab: {
        id: "tab-1",
        classroomLayout: {
          version: CLASSROOM_LAYOUT_VERSION,
          desks: sidebarState.desks,
          controlGroups: sidebarState.controlGroups,
          labels: [{ id: "label-1", x: 40, y: 40, text: "Front" }],
        },
        students: sidebarState.students,
        tabOptions: { viewMode: sidebarState.viewMode },
      },
      updateActiveTab,
    }),
  };
});

describe("DeskDetailsSidebar rectangle", () => {
  beforeEach(() => {
    sidebarState.desks = [];
    sidebarState.students = [];
    sidebarState.controlGroups = {};
    sidebarState.viewMode = "map";
    updateActiveTab.mockReset();
    addPointsToStudents.mockReset();
    onDeskSelectionChange.mockReset();
  });

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

  it("shows classroom settings and the point sound when nothing is selected", () => {
    render(
      <DeskDetailsSidebar
        selectedLabelId={null}
        studentIds={new Set()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Classroom settings" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Point sound" })).toHaveTextContent("Bark");
    expect(screen.getByText("Points Bank")).toBeInTheDocument();
    expect(screen.getByText(/Space/)).toBeInTheDocument();
    expect(screen.queryByText(/click or drag adds/)).not.toBeInTheDocument();
  });

  it("shows the points bank in list view when nothing is selected", () => {
    sidebarState.viewMode = "list";

    render(
      <DeskDetailsSidebar
        selectedLabelId={null}
        studentIds={new Set()}
      />,
    );

    expect(screen.getByText("Points Bank")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Classroom settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Point sound" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Space/)).not.toBeInTheDocument();
  });

  it("lists teams, selects them, and adds a point", () => {
    sidebarState.students = [
      { id: "student-1", name: "Ada", points: 1 },
      { id: "student-2", name: "Grace", points: 4 },
    ];
    sidebarState.controlGroups = {
      2: ["student-1", "student-2"],
    };

    render(
      <DeskDetailsSidebar
        onDeskSelectionChange={onDeskSelectionChange}
        studentIds={new Set()}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Team" })).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select Group 2" }));
    expect(Array.from(onDeskSelectionChange.mock.calls[0][0] as Set<string>).sort())
      .toEqual(["student-1", "student-2"]);

    fireEvent.click(screen.getByRole("button", { name: "Add one point to Group 2" }));
    expect(addPointsToStudents).toHaveBeenCalledWith(["student-1", "student-2"], 1);

    fireEvent.click(screen.getByRole("button", { name: "Subtract one point from Group 2" }));
    expect(addPointsToStudents).toHaveBeenCalledWith(["student-1", "student-2"], -1);

    fireEvent.change(screen.getByRole("textbox", { name: "Name for group 2" }), {
      target: { value: "Red" },
    });
    expect(updateActiveTab).toHaveBeenCalledWith({
      classroomLayout: expect.objectContaining({
        controlGroupNames: { 2: "Red" },
      }),
    });
  });

  it("adds a point to every selected desk", () => {
    sidebarState.students = [
      { id: "student-1", name: "Ada", points: 1 },
      { id: "student-2", name: "Grace", points: 2 },
    ];

    render(
      <DeskDetailsSidebar
        studentIds={new Set(["student-1", "student-2"])}
      />,
    );

    fireEvent.click(screen.getByRole("button", {
      name: "Add one point to selected desks",
    }));
    fireEvent.click(screen.getByRole("button", {
      name: "Subtract one point from selected desks",
    }));

    expect(addPointsToStudents).toHaveBeenCalledWith(["student-1", "student-2"], 1);
    expect(addPointsToStudents).toHaveBeenCalledWith(["student-1", "student-2"], -1);
  });

  it("rotates every selected desk from the sidebar", () => {
    sidebarState.students = [
      { id: "student-1", name: "Ada", points: 1 },
      { id: "student-2", name: "Grace", points: 2 },
    ];
    sidebarState.desks = [
      { studentId: "student-1", x: 40, y: 40, rotation: 0 },
      { studentId: "student-2", x: 240, y: 40, rotation: 90 },
    ];

    render(
      <DeskDetailsSidebar
        studentIds={new Set(["student-1", "student-2"])}
      />,
    );

    fireEvent.click(screen.getByRole("button", {
      name: "Rotate selected desks 90 degrees clockwise",
    }));

    expect(updateActiveTab).toHaveBeenCalledWith({
      classroomLayout: expect.objectContaining({
        desks: [
          { studentId: "student-1", x: 140, y: 0, rotation: 90 },
          { studentId: "student-2", x: 140, y: 200, rotation: 180 },
        ],
      }),
    });
  });
});
