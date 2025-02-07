import { useCallback } from "react";
import { useStudentContext } from "../../../context/StudentContext"
import { PillButton } from "../../PillButton/PillButton";
import { useModal } from "../../../context/ModalContext";

export const ResetAllWidget = () => {
  const {
    students,
    updateAllStudents,
  } = useStudentContext();

  const { showModal } = useModal();

  const resetPoints = useCallback(() => {
    updateAllStudents({ points: 0 });
  }, [
    students,
    updateAllStudents
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
