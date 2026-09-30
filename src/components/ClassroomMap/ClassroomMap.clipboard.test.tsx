import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CLASSROOM_LAYOUT_VERSION, ClassroomDesk } from "../../types/classroomLayout.type";
import {
  getClassroomDeskFootprint,
  getClassroomDeskPositionNearCenter,
} from "../../utils/classroomLayout";
import { clearCopiedClassroomDesks } from "../../utils/deskClipboard";
import { ClassroomMap } from "./ClassroomMap";

const updateActiveTab = vi.fn();
const onDeskSelectionChange = vi.fn();
const showModal = vi.hoisted(() => vi.fn());
const uuidState = vi.hoisted(() => ({ n: 0 }));

vi.mock("../../utils/generateUuid", () => ({
  generateUuid: () => `pasted-${++uuidState.n}`,
}));

vi.mock("../../context/ModalContext", () => ({
  useModal: () => ({ showModal, hideModal: vi.fn() }),
}));

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

const tabState = vi.hoisted(() => ({
  mapEditMode: true,
}));

const desks: ClassroomDesk[] = [
  { studentId: "student-1", x: 40, y: 40, rotation: 90 },
  { studentId: "student-2", x: 400, y: 40, rotation: 180 },
];

vi.mock("../../context/TabContext", () => ({
  useTabContext: () => ({
    activeTab: {
      id: "tab-1",
      name: "Class 1",
      students: [
        { id: "student-1", name: "Ada", points: 3 },
        { id: "student-2", name: "Grace", points: 1 },
      ],
      tabOptions: { viewMode: "map", mapEditMode: tabState.mapEditMode },
      classroomLayout: {
        version: CLASSROOM_LAYOUT_VERSION,
        desks,
        labels: [{ id: "label-1", x: 0, y: 0, text: "Front" }],
      },
    },
    updateActiveTab,
  }),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

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
        setSelectedStudentIds(nextStudentIds);
      }}
      selectedStudentIds={selectedStudentIds}
    />
  );
};

const pressCopy = () => {
  fireEvent.keyDown(document.body, { code: "KeyC", key: "c", metaKey: true });
};

const pressPaste = () => {
  fireEvent.keyDown(document.body, { code: "KeyV", key: "v", metaKey: true });
};

describe("ClassroomMap desk copy and paste", () => {
  beforeEach(() => {
    uuidState.n = 0;
    tabState.mapEditMode = true;
    updateActiveTab.mockReset();
    onDeskSelectionChange.mockReset();
    showModal.mockReset();
    clearCopiedClassroomDesks();
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("pastes a new desk in the next open space after the last selected desk", () => {
    render(<SelectionHarness initialSelection={["student-1", "student-2"]} />);
    expect(screen.getByText(/copy and paste desks/)).toBeInTheDocument();

    pressCopy();
    pressPaste();

    const anchor = desks[1];
    const anchorFootprint = getClassroomDeskFootprint(anchor);
    const firstPastedDesk: ClassroomDesk = {
      studentId: "pasted-1",
      x: anchor.x + anchorFootprint.width,
      y: anchor.y,
      rotation: 90,
    };
    const firstPastedFootprint = getClassroomDeskFootprint(firstPastedDesk);
    expect(updateActiveTab).toHaveBeenCalledWith({
      students: [
        { id: "student-1", name: "Ada", points: 3 },
        { id: "student-2", name: "Grace", points: 1 },
        { id: "pasted-1", name: "Ada", points: 0 },
        { id: "pasted-2", name: "Grace", points: 0 },
      ],
      classroomLayout: expect.objectContaining({
        labels: [{ id: "label-1", x: 0, y: 0, text: "Front" }],
        desks: [
          ...desks,
          firstPastedDesk,
          {
            studentId: "pasted-2",
            x: firstPastedDesk.x + firstPastedFootprint.width,
            y: anchor.y,
            rotation: 180,
          },
        ],
      }),
    });
    expect(
      onDeskSelectionChange.mock.calls.map((call) => Array.from(call[0] as Set<string>)),
    ).toContainEqual(["pasted-1", "pasted-2"]);
  });

  it("pastes near the middle when no desk is selected", () => {
    render(<SelectionHarness initialSelection={["student-1"]} />);

    pressCopy();
    fireEvent.keyDown(document.body, { key: "Escape" });
    pressPaste();

    const center = getClassroomDeskPositionNearCenter(90, desks);
    expect(updateActiveTab).toHaveBeenCalledWith(expect.objectContaining({
      students: expect.arrayContaining([
        { id: "pasted-1", name: "Ada", points: 0 },
      ]),
      classroomLayout: expect.objectContaining({
        desks: [
          ...desks,
          {
            studentId: "pasted-1",
            x: center?.x,
            y: center?.y,
            rotation: 90,
          },
        ],
      }),
    }));
  });

  it("leaves the layout alone outside edit mode and while typing", () => {
    tabState.mapEditMode = false;
    const classMode = render(<SelectionHarness initialSelection={["student-1"]} />);

    pressCopy();
    pressPaste();
    expect(updateActiveTab).not.toHaveBeenCalled();
    expect(screen.queryByText(/copy and paste desks/)).not.toBeInTheDocument();
    classMode.unmount();

    tabState.mapEditMode = true;
    render(<SelectionHarness initialSelection={["student-1"]} />);
    pressCopy();
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { code: "KeyV", key: "v", metaKey: true });
    input.remove();

    expect(updateActiveTab).not.toHaveBeenCalled();
  });

  it("asks before backspace removes the selected desks", () => {
    render(<SelectionHarness initialSelection={["student-1", "student-2"]} />);
    expect(screen.getByText(/Backspace/)).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "Backspace" });

    expect(updateActiveTab).not.toHaveBeenCalled();
    expect(showModal).toHaveBeenCalledWith("Are you sure?", expect.objectContaining({
      acceptText: "Yes",
      cancelText: "No",
      acceptColor: "success",
      cancelColor: "error",
      cancelVariant: "contained",
    }));

    const options = showModal.mock.calls[0][1] as { onAccept: () => void };
    act(() => options.onAccept());

    expect(updateActiveTab).toHaveBeenCalledWith({
      classroomLayout: expect.objectContaining({
        desks: [],
        labels: [expect.objectContaining({ id: "label-1", text: "Front" })],
      }),
    });
    expect(
      onDeskSelectionChange.mock.calls.map((call) => Array.from(call[0] as Set<string>)),
    ).toContainEqual([]);
  });
});
