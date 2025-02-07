import { useCallback, useMemo } from "react";

import { useStudentContext } from "../../../context/StudentContext"

import { PillButton } from "../../PillButton/PillButton";
import { Tooltip } from "@mui/material";

export const SelectAllWidget = () => {
  const {
    students,
    updateAllStudents,
    numSelectedStudents,
  } = useStudentContext();

  const selectAll = useCallback(() => {
    updateAllStudents({ selected: true });
  }, [
    updateAllStudents,
  ]);

  const deselectAll = useCallback(() => {
    updateAllStudents({ selected: false });
  }, [
    updateAllStudents,
  ]);

  const allSelected = numSelectedStudents === students.length;

  const [onClick, label, tooltip] = useMemo(() => {
    const onClick = allSelected ? deselectAll : selectAll;
    const label = allSelected ? 'Deselect All' : 'Select All';
    const tooltip = allSelected ? 'Deselect all students' : 'Select all students';

    return [
      onClick,
      label,
      tooltip,
    ]
  }, [
    allSelected,
    selectAll,
    deselectAll,
  ])

  return (
    <Tooltip
      title={tooltip}
    >
      <PillButton
        onClick={onClick}
      >
        {label}
      </PillButton>
    </Tooltip>
  )
}
