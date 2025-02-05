import { useCallback } from "react";
import { useStudentsContext } from "../../../context/StudentsContext"
import { PillButton } from "../../PillButton/PillButton";
import { useModal } from "../../../context/ModalContext";

export const ResetAllWidget = () => {
  const {
    students,
    setStudents
  } = useStudentsContext();

  const { showModal } = useModal();

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
    <PillButton
      onClick={openResetPointsModal}
    >
      Reset points
    </PillButton>
  )
}
