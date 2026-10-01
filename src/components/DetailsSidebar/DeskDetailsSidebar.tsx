import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import {
  ReactNode,
  useCallback,
  useMemo,
} from "react";

import { useModal } from "../../context/ModalContext";
import { useSidebarLayout } from "../../context/SidebarLayoutContext";
import { useStudentContext } from "../../context/StudentContext";
import { useTabContext } from "../../context/TabContext";
import { useStudentNameDraft } from "../../hooks/useStudentNameDraft";
import {
  CLASSROOM_CONTROL_GROUP_NUMBERS,
  CLASSROOM_LAYOUT_VERSION,
  ClassroomControlGroupNumber,
  ClassroomControlGroups,
} from "../../types/classroomLayout.type";
import { Student, StudentId } from "../../types/student.type";
import {
  getClassroomLabels,
  getClassroomMapSize,
  getPlacedClassroomDesks,
  rotateClassroomDesks,
} from "../../utils/classroomLayout";
import { PointsBank } from "../BankSidebar/PointsBank";
import { ResizableSidebar } from "../ResizableSidebar/ResizableSidebar";
import { PointAdjuster } from "../PointAdjuster/PointAdjuster";
import { PointSoundWidget } from "../TabOptionsRow/Widgets/PointSoundWidget";
import { EditableField } from "./EditableField";
import { MapShortcuts } from "./MapShortcuts";

import "./DetailsSidebar.css";

interface DeskDetailsSidebarProps {
  onDeskDeleted?: () => void;
  onDeskSelectionChange?: (studentIds: ReadonlySet<StudentId>) => void;
  selectedLabelId?: string | null;
  studentIds: ReadonlySet<StudentId>;
}

const DetailsSidebarFrame = ({ children }: { children: ReactNode }) => {
  const { rightOpen } = useSidebarLayout();
  if (!rightOpen) return null;

  return (
    <ResizableSidebar
      className="DetailsSidebar"
      defaultWidth={280}
      handleEdge="left"
      label="Resize sidebar"
      maxWidth={560}
      minWidth={240}
      storageKey="details_sidebar_width"
    >
      {children}
    </ResizableSidebar>
  );
};

const teamLabel = (groupNumber: ClassroomControlGroupNumber, name: string) =>
  name.trim() || `Group ${groupNumber}`;

const StudentNameField = ({ student }: { student: Student }) => {
  const { draftName, onNameChange, onNameBlur } = useStudentNameDraft(student);

  return (
    <EditableField
      label="Student name"
      onBlur={onNameBlur}
      onChange={onNameChange}
      value={draftName}
    />
  );
};

export const DeskDetailsSidebar = ({
  onDeskDeleted,
  onDeskSelectionChange,
  selectedLabelId = null,
  studentIds,
}: DeskDetailsSidebarProps) => {
  const { showModal } = useModal();
  const { activeTab, updateActiveTab } = useTabContext();
  const {
    addPointsToStudent,
    addPointsToStudents,
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
  const selectedDeskIds = useMemo(() => {
    const ids = new Set<StudentId>();
    desks.forEach((candidate) => {
      if (studentIds.has(candidate.studentId)) ids.add(candidate.studentId);
    });
    return ids;
  }, [desks, studentIds]);
  const mapSize = getClassroomMapSize(activeTab.classroomLayout);
  const clockwiseDesks = rotateClassroomDesks(
    desks,
    selectedDeskIds,
    "clockwise",
    mapSize,
  );
  const counterClockwiseDesks = rotateClassroomDesks(
    desks,
    selectedDeskIds,
    "counterclockwise",
    mapSize,
  );
  const canRotateDeskClockwise = Boolean(clockwiseDesks);
  const canRotateDeskCounterClockwise = Boolean(counterClockwiseDesks);
  const teams = useMemo(() => {
    const controlGroups = activeTab.classroomLayout?.controlGroups ?? {};
    const controlGroupNames = activeTab.classroomLayout?.controlGroupNames ?? {};
    const studentsById = new Map(students.map((candidate) => [candidate.id, candidate]));

    return CLASSROOM_CONTROL_GROUP_NUMBERS.flatMap((groupNumber) => {
      const memberIds = (controlGroups[groupNumber] ?? []).filter((id) =>
        studentsById.has(id)
      );
      if (memberIds.length === 0) return [];

      return [{
        groupNumber,
        memberIds,
        name: controlGroupNames[groupNumber] ?? "",
        points: memberIds.reduce(
          (sum, id) => sum + (studentsById.get(id)?.points ?? 0),
          0,
        ),
      }];
    });
  }, [
    activeTab.classroomLayout?.controlGroupNames,
    activeTab.classroomLayout?.controlGroups,
    students,
  ]);

  const isMapMode = (activeTab.tabOptions?.viewMode ?? "list") === "map";

  const handleTeamNameChange = useCallback((
    groupNumber: ClassroomControlGroupNumber,
    name: string,
  ) => {
    updateActiveTab({
      classroomLayout: {
        ...activeTab.classroomLayout,
        version: CLASSROOM_LAYOUT_VERSION,
        desks: activeTab.classroomLayout?.desks ?? [],
        controlGroupNames: {
          ...activeTab.classroomLayout?.controlGroupNames,
          [groupNumber]: name,
        },
      },
    });
  }, [activeTab.classroomLayout, updateActiveTab]);

  const handleRotate = useCallback((direction: "clockwise" | "counterclockwise") => {
    const nextDesks = direction === "clockwise"
      ? clockwiseDesks
      : counterClockwiseDesks;
    if (!nextDesks) return;

    updateActiveTab({
      classroomLayout: {
        ...activeTab.classroomLayout,
        version: CLASSROOM_LAYOUT_VERSION,
        desks: nextDesks,
      },
    });
  }, [
    activeTab.classroomLayout,
    clockwiseDesks,
    counterClockwiseDesks,
    updateActiveTab,
  ]);

  const handleDeleteDesk = useCallback(() => {
    if (!desk) return;

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
      <DetailsSidebarFrame>
        <h2 className="DetailsSidebar__title">
          {selectedStudents.length} desks selected
        </h2>
        <div className="DetailsSidebar__content">
          <div className="DetailsSidebar__selectionSummary">
            <span>Total points</span>
            <PointAdjuster
              decrementLabel="Subtract one point from selected desks"
              incrementLabel="Add one point to selected desks"
              onDecrement={() => addPointsToStudents(
                selectedStudents.map((selectedStudent) => selectedStudent.id),
                -1,
              )}
              onIncrement={() => addPointsToStudents(
                selectedStudents.map((selectedStudent) => selectedStudent.id),
                1,
              )}
              points={totalPoints}
              readOnly
              variant="square"
            />
          </div>
          <ul className="DetailsSidebar__studentSummary">
            {selectedStudents.map((selectedStudent) => (
              <li key={selectedStudent.id}>
                <span>{selectedStudent.name}</span>
                <PointAdjuster
                  decrementLabel={`Subtract one point from ${selectedStudent.name}`}
                  incrementLabel={`Add one point to ${selectedStudent.name}`}
                  onDecrement={() => addPointsToStudent(selectedStudent.id, -1)}
                  onIncrement={() => addPointsToStudent(selectedStudent.id, 1)}
                  onPointsChange={(points) => updateStudent(selectedStudent.id, { points })}
                  points={selectedStudent.points}
                  variant="square"
                />
              </li>
            ))}
          </ul>
          <span className="DetailsSidebar__hint">
            Drag any selected desk to move the group.
          </span>
          {selectedDeskIds.size > 0 && (
            <div className="DetailsSidebar__fieldGroup">
              <span className="EditableField__label">Group rotation</span>
              <div className="DetailsSidebar__rotationActions">
                <button
                  aria-label="Rotate selected desks 90 degrees counterclockwise"
                  className="DetailsSidebar__button"
                  disabled={!canRotateDeskCounterClockwise}
                  onClick={() => handleRotate("counterclockwise")}
                  type="button"
                >
                  <RotateLeftIcon aria-hidden="true" fontSize="small" />
                </button>
                <button
                  aria-label="Rotate selected desks 90 degrees clockwise"
                  className="DetailsSidebar__button"
                  disabled={!canRotateDeskClockwise}
                  onClick={() => handleRotate("clockwise")}
                  type="button"
                >
                  <RotateRightIcon aria-hidden="true" fontSize="small" />
                </button>
              </div>
              { !canRotateDeskClockwise &&
                !canRotateDeskCounterClockwise && (
                <span className="DetailsSidebar__hint">
                  There isn't room to turn these desks.
                </span>
              )}
            </div>
          )}
        </div>
        <MapShortcuts
          showSelectionHelp
        />
      </DetailsSidebarFrame>
    );
  }

  if (!student && rectangle) {
    return (
      <DetailsSidebarFrame>
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
        <MapShortcuts showSelectionHelp={false} />
      </DetailsSidebarFrame>
    );
  }

  if (!student) {
    if (!isMapMode) {
      return (
        <DetailsSidebarFrame>
          <div className="DetailsSidebar__content">
            <PointsBank />
          </div>
        </DetailsSidebarFrame>
      );
    }

    return (
      <DetailsSidebarFrame>
        <h2 className="DetailsSidebar__title">Classroom settings</h2>
        <div className="DetailsSidebar__content">
          <div className="DetailsSidebar__fieldGroup">
            <span className="EditableField__label">Point sound</span>
            <PointSoundWidget fullWidth />
          </div>
          {teams.length > 0 ? (
            <div className="DetailsSidebar__fieldGroup">
              <span className="EditableField__label">Teams</span>
              <table className="DetailsSidebar__teams">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.groupNumber}>
                      <td>
                        <div className="DetailsSidebar__teamIdentity">
                          <button
                            aria-label={`Select ${teamLabel(team.groupNumber, team.name)}`}
                            className="DetailsSidebar__teamSelect"
                            onClick={() => onDeskSelectionChange?.(new Set(team.memberIds))}
                            title={`${team.memberIds.length} desks`}
                            type="button"
                          >
                            <span
                              className={`DetailsSidebar__teamBadge DetailsSidebar__teamBadge--${team.groupNumber}`}
                            >
                              {team.groupNumber}
                            </span>
                          </button>
                          <input
                            aria-label={`Name for group ${team.groupNumber}`}
                            className="DetailsSidebar__teamName"
                            onKeyDown={(event) => event.stopPropagation()}
                            onChange={(event) => handleTeamNameChange(
                              team.groupNumber,
                              event.target.value,
                            )}
                            value={team.name}
                          />
                        </div>
                      </td>
                      <td>
                        <PointAdjuster
                          decrementLabel={`Subtract one point from ${teamLabel(team.groupNumber, team.name)}`}
                          incrementLabel={`Add one point to ${teamLabel(team.groupNumber, team.name)}`}
                          onDecrement={() => addPointsToStudents(team.memberIds, -1)}
                          onIncrement={() => addPointsToStudents(team.memberIds, 1)}
                          points={team.points}
                          readOnly
                          variant="square"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <span className="DetailsSidebar__hint">
              Assign desks to groups 1–8 to list teams here.
            </span>
          )}
          <div className="DetailsSidebar__fieldGroup">
            <PointsBank compact />
          </div>
          <span className="DetailsSidebar__hint">
            Select a desk to edit its student.
          </span>
        </div>
        <MapShortcuts showSelectionHelp={false} />
      </DetailsSidebarFrame>
    );
  }

  return (
    <DetailsSidebarFrame>
      <h2 className="DetailsSidebar__title">Desk details</h2>
      <div className="DetailsSidebar__content">
        <StudentNameField student={student} />

        <div className="DetailsSidebar__fieldGroup">
          <span className="EditableField__label">Points</span>
          <PointAdjuster
            decrementLabel={`Subtract one point from ${student.name || "student"}`}
            incrementLabel={`Add one point to ${student.name || "student"}`}
            onDecrement={() => addPointsToStudent(student.id, -1)}
            onIncrement={() => addPointsToStudent(student.id, 1)}
            onPointsChange={(points) => updateStudent(student.id, { points })}
            points={student.points}
            variant="square"
          />
        </div>

        {desk && (
          <>
            <div className="DetailsSidebar__fieldGroup">
              <span className="EditableField__label">Desk rotation</span>
              <div className="DetailsSidebar__rotationActions">
                <button
                  aria-label="Rotate desk 90 degrees counterclockwise"
                  className="DetailsSidebar__button"
                  disabled={!canRotateDeskCounterClockwise}
                  onClick={() => handleRotate("counterclockwise")}
                  type="button"
                >
                  <RotateLeftIcon aria-hidden="true" fontSize="small" />
                </button>
                <button
                  aria-label="Rotate desk 90 degrees clockwise"
                  className="DetailsSidebar__button"
                  disabled={!canRotateDeskClockwise}
                  onClick={() => handleRotate("clockwise")}
                  type="button"
                >
                  <RotateRightIcon aria-hidden="true" fontSize="small" />
                </button>
              </div>
              {!canRotateDeskClockwise &&
                !canRotateDeskCounterClockwise && (
                <span className="DetailsSidebar__hint">
                  Move this desk away from the other desk before rotating it.
                </span>
              )}
            </div>

            <button
              className="DetailsSidebar__button DetailsSidebar__button--danger"
              onClick={handleDeleteDesk}
              type="button"
            >
              Delete desk
            </button>
          </>
        )}
      </div>
      <MapShortcuts showSelectionHelp />
    </DetailsSidebarFrame>
  );
};
