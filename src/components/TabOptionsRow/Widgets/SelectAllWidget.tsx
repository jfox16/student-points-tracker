import { useCallback, useMemo } from "react";

import { useStudentsContext } from "../../../context/StudentsContext"

import { PillButton } from "../../PillButton/PillButton";
import { Tooltip } from "@mui/material";

export const SelectAllWidget = () => {
  const {
    students,
    setStudents,
  } = useStudentsContext();

  const allSelected = useMemo(() => {
    return students.every(student => student.selected);
  }, [
    students,
  ])

  const setSelectedAll = useCallback((selected: boolean) => {
    setStudents(
      students.map(student => ({ ...student, selected }))
    );
  }, [
    students,
    setStudents,
  ]);

  const selectAll = useCallback(() => {
    setSelectedAll(true);
  }, [
    setSelectedAll,
  ]);

  const deselectAll = useCallback(() => {
    setSelectedAll(false);
  }, [
    setSelectedAll,
  ]);

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
