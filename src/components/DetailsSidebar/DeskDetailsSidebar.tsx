import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import { useCallback } from "react";

import { useModal } from "../../context/ModalContext";
import { useStudentContext } from "../../context/StudentContext";
import { useTabContext } from "../../context/TabContext";
import {
  CLASSROOM_LAYOUT_VERSION,
  ClassroomControlGroups,
} from "../../types/classroomLayout.type";
import { StudentId } from "../../types/student.type";
import {
  getClassroomLabels,
  getPlacedClassroomDesks,
  isClassroomDeskPlacementValid,
  rotateDeskCounterClockwise,
  rotateDeskClockwise,
} from "../../utils/classroomLayout";
import { EditableField } from "./EditableField";

import "./DetailsSidebar.css";

interface DeskDetailsSidebarProps {
  onDeskDeleted?: () => void;
  selectedLabelId?: string | null;
  studentIds: ReadonlySet<StudentId>;
}

export const DeskDetailsSidebar = ({
  onDeskDeleted,
  selectedLabelId = null,
  studentIds,
}: DeskDetailsSidebarProps) => {
  const { showModal } = useModal();
  const { activeTab, updateActiveTab } = useTabContext();
  const {
    addPointsToStudent,
    students,
    updateStudent,
  } = useStudentContext();
  const studentId = studentIds.size === 1
    ? studentIds.values().next().value
    : undefined;
  const student = students.find((candidate) => candidate.id === studentId);
  const selectedStudents = students.filter((candidate) =>
    studentIds.has(candidate.id)
  );
  const labels = getClassroomLabels(activeTab.classroomLayout);
  const rectangle = labels.find((label) => label.id === selectedLabelId);
  const desks = getPlacedClassroomDesks(
    activeTab.students,
    activeTab.classroomLayout,
  );
  const desk = desks.find((candidate) => candidate.studentId === studentId);
  const mapEditMode = activeTab.tabOptions?.mapEditMode ?? false;
  const nextClockwiseRotation = desk
    ? rotateDeskClockwise(desk.rotation)
    : undefined;
  const nextCounterClockwiseRotation = desk
    ? rotateDeskCounterClockwise(desk.rotation)
    : undefined;
  const canRotateDeskClockwise = Boolean(
    desk &&
    nextClockwiseRotation !== undefined &&
    isClassroomDeskPlacementValid(
      { ...desk, rotation: nextClockwiseRotation },
      desks,
    ),
  );
  const canRotateDeskCounterClockwise = Boolean(
    desk &&
    nextCounterClockwiseRotation !== undefined &&
    isClassroomDeskPlacementValid(
      { ...desk, rotation: nextCounterClockwiseRotation },
      desks,
    ),
  );

  const handlePointsChange = useCallback(
    (value: string) => {
      if (!student) return;

      const points = Number(value);
      if (Number.isInteger(points)) updateStudent(student.id, { points });
    },
    [student, updateStudent],
  );

  const handleRotate = useCallback((direction: "clockwise" | "counterclockwise") => {
    const canRotate = direction === "clockwise"
      ? canRotateDeskClockwise
      : canRotateDeskCounterClockwise;
    if (!desk || !mapEditMode || !canRotate) return;

    const rotate = direction === "clockwise"
      ? rotateDeskClockwise
      : rotateDeskCounterClockwise;

    updateActiveTab({
      classroomLayout: {
        ...activeTab.classroomLayout,
        version: CLASSROOM_LAYOUT_VERSION,
        desks: desks.map((candidate) =>
          candidate.studentId === desk.studentId
            ? {
                ...candidate,
                rotation: rotate(candidate.rotation),
              }
            : candidate
        ),
      },
    });
  }, [
    activeTab.classroomLayout,
    canRotateDeskClockwise,
    canRotateDeskCounterClockwise,
    desk,
    desks,
    mapEditMode,
    updateActiveTab,
  ]);

  const handleDeleteDesk = useCallback(() => {
    if (!desk || !mapEditMode) return;

    const studentName = student?.name || "this student";
    showModal(
      `Delete the desk for ${studentName}? The student will remain in the list.`,
      {
        acceptText: "Delete desk",
        cancelText: "Cancel",
        onAccept: () => {
          const controlGroups = Object.fromEntries(
            Object.entries(activeTab.classroomLayout?.controlGroups ?? {})
              .map(([groupNumber, studentIds]) => [
                groupNumber,
                studentIds.filter((id) => id !== desk.studentId),
              ]),
          ) as ClassroomControlGroups;

          updateActiveTab({
            classroomLayout: {
              ...activeTab.classroomLayout,
              version: CLASSROOM_LAYOUT_VERSION,
              desks: desks.filter(
                (candidate) => candidate.studentId !== desk.studentId,
              ),
              controlGroups,
            },
          });
          onDeskDeleted?.();
        },
      },
    );
  }, [
    activeTab.classroomLayout,
    desk,
    desks,
    mapEditMode,
    onDeskDeleted,
    showModal,
    student?.name,
    updateActiveTab,
  ]);

  if (selectedStudents.length > 1) {
    const totalPoints = selectedStudents.reduce(
      (sum, selectedStudent) => sum + selectedStudent.points,
      0,
    );

    return (
      <aside className="DetailsSidebar">
        <h2 className="DetailsSidebar__title">
          {selectedStudents.length} desks selected
        </h2>
        <div className="DetailsSidebar__content">
          <div className="DetailsSidebar__selectionSummary">
            <span>Total points</span>
            <strong>{totalPoints}</strong>
          </div>
          <ul className="DetailsSidebar__studentSummary">
            {selectedStudents.map((selectedStudent) => (
              <li key={selectedStudent.id}>
                <span>{selectedStudent.name || "Unnamed student"}</span>
                <span>{selectedStudent.points} pts</span>
              </li>
            ))}
          </ul>
          <span className="DetailsSidebar__hint">
            Drag any selected desk to move the group.
          </span>
        </div>
      </aside>
    );
  }

  if (!student && rectangle) {
    return (
      <aside className="DetailsSidebar">
        <h2 className="DetailsSidebar__title">Rectangle</h2>
        <div className="DetailsSidebar__content">
          <EditableField
            label="Text"
            onChange={(text) => {
              updateActiveTab({
                classroomLayout: {
                  ...activeTab.classroomLayout,
                  version: CLASSROOM_LAYOUT_VERSION,
                  desks: activeTab.classroomLayout?.desks ?? [],
                  labels: labels.map((label) =>
                    label.id === rectangle.id ? { ...label, text } : label,
                  ),
                },
              });
            }}
            value={rectangle.text}
          />
        </div>
      </aside>
    );
  }

  if (!student) {
    return (
      <aside className="DetailsSidebar">
        <h2 className="DetailsSidebar__title">Desk details</h2>
        <p className="DetailsSidebar__empty">
          Select a desk to edit its student.
        </p>
      </aside>
    );
  }

  return (
    <aside className="DetailsSidebar">
      <h2 className="DetailsSidebar__title">Desk details</h2>
      <div className="DetailsSidebar__content">
        <EditableField
          label="Student name"
          onChange={(name) => updateStudent(student.id, { name })}
          value={student.name}
        />

        <div className="DetailsSidebar__fieldGroup">
          <EditableField
            label="Points"
            onChange={handlePointsChange}
            step={1}
            type="number"
            value={student.points}
          />
          <div className="DetailsSidebar__pointActions">
            <button
              aria-label={`Subtract one point from ${student.name || "student"}`}
              onClick={() => addPointsToStudent(student.id, -1)}
              type="button"
            >
              −1
            </button>
            <button
              aria-label={`Add one point to ${student.name || "student"}`}
              onClick={() => addPointsToStudent(student.id, 1)}
              type="button"
            >
              +1
            </button>
          </div>
        </div>

        {desk && (
          <>
            <div className="DetailsSidebar__fieldGroup">
              <span className="EditableField__label">Desk rotation</span>
              <div className="DetailsSidebar__rotationActions">
                <button
                  aria-label="Rotate desk 90 degrees counterclockwise"
                  className="DetailsSidebar__button"
                  disabled={!mapEditMode || !canRotateDeskCounterClockwise}
                  onClick={() => handleRotate("counterclockwise")}
                  type="button"
                >
                  <RotateLeftIcon aria-hidden="true" fontSize="small" />
                </button>
                <button
                  aria-label="Rotate desk 90 degrees clockwise"
                  className="DetailsSidebar__button"
                  disabled={!mapEditMode || !canRotateDeskClockwise}
                  onClick={() => handleRotate("clockwise")}
                  type="button"
                >
                  <RotateRightIcon aria-hidden="true" fontSize="small" />
                </button>
              </div>
              {!mapEditMode && (
                <span className="DetailsSidebar__hint">
                  Switch to Edit mode to change this desk.
                </span>
              )}
              {mapEditMode &&
                !canRotateDeskClockwise &&
                !canRotateDeskCounterClockwise && (
                <span className="DetailsSidebar__hint">
                  Move this desk away from the other desk before rotating it.
                </span>
              )}
            </div>

            <button
              className="DetailsSidebar__button DetailsSidebar__button--danger"
              disabled={!mapEditMode}
              onClick={handleDeleteDesk}
              type="button"
            >
              Delete desk
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
