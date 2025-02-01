import { useCallback } from "react";
import { useStudentsContext } from "../../../context/StudentsContext"
import { PillButton } from "../../PillButton/PillButton";
import { useModal } from "../../../context/ModalContext";

export const AllActionsWidget = () => {
  const {
    students,
    setStudents
  } = useStudentsContext();

  const { showModal } = useModal();

  const selectAll = useCallback(() => {
    setStudents(students.map(student => ({
      ...student,
      selected: true,
    })));
  }, [
    students,
    setStudents,
  ]);

  // const deselectAll = useCallback(() => {
  //   setStudents(students.map(student => ({
  //     ...student,
  //     selected: false,
  //   })))
  // }, [
  //   students,
  //   setStudents,
  // ]);

  const resetPoints = useCallback(() => {
    setStudents(students.map(student => ({
      ...student,
      points: 0,
    })));
  }, [
    students,
    setStudents
  ]);

  const openResetPointsModal = useCallback(() => {
    showModal(
      "Reset points of all students in this class?",
      resetPoints,
    );
  }, [
    resetPoints,
    showModal
  ])

  return (
    <div className="flex gap-2">
      <PillButton
        onClick={selectAll}
      >
        Select All
      </PillButton>

      {/* <PillButton
        onClick={deselectAll}
      >
        Deselect All
      </PillButton> */}

      <PillButton
        onClick={openResetPointsModal}
      >
        Reset points
      </PillButton>
    </div>
  )
}
