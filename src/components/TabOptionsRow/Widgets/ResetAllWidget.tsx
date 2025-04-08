import { useCallback } from "react";
import { Tooltip } from '@mui/material';
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
      { onAccept: resetPoints }
    );
  }, [
    resetPoints,
    showModal
  ])

  return (
    <Tooltip title="Reset all student points to 0" enterDelay={1000}>
      <div>
        <PillButton
          onClick={openResetPointsModal}
        >
          Reset points
        </PillButton>
      </div>
    </Tooltip>
  )
}
