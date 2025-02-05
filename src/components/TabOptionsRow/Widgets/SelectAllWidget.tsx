import { useCallback } from "react";
import { useStudentsContext } from "../../../context/StudentsContext"
import { PillButton } from "../../PillButton/PillButton";
import { useModal } from "../../../context/ModalContext";

export const SelectAllWidget = () => {
  const {
    students,
    setStudents
  } = useStudentsContext();

  const selectAll = useCallback(() => {
    setStudents(students.map(student => ({
      ...student,
      selected: true,
    })));
  }, [
    students,
    setStudents,
  ]);

  return (
    <PillButton
      onClick={selectAll}
    >
      Select All
    </PillButton>
  )
}
