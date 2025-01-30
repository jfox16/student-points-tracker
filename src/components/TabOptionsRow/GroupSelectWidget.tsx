
import ClearIcon from '@mui/icons-material/Clear';
import { useCallback, useMemo } from "react";

import { useStudentsContext } from "../../context/StudentsContext"
import { cnsMerge } from "../../utils/cnsMerge";
import { StudentId } from '../../types/student.type';
import { Tooltip } from '@mui/material';

export const GroupSelectWidget = () => {

  const { students, setStudents, selectedStudentIds, setSelectedStudentIds } = useStudentsContext();

  const numSelected = useMemo(() => {
    return selectedStudentIds.size;
  }, [
    selectedStudentIds.size
  ]);

  const deselectAll = useCallback(() => {
    if (selectedStudentIds.size > 0) {
      setSelectedStudentIds(new Set());
    }
  }, [
    selectedStudentIds.size,
    setSelectedStudentIds
  ])

  const incrementSelected = useCallback(() => {
    setStudents(students.map(student => {
      return selectedStudentIds.has(student.id) ? { ...student, points: student.points + 1 } : student;
    }))
  }, [
    selectedStudentIds,
    students,
    setStudents,
  ]);

  const decrementSelected = useCallback(() => {
    setStudents(students.map(student => {
      return selectedStudentIds.has(student.id) ? { ...student, points: student.points - 1 } : student;
    }))
  }, [
    selectedStudentIds,
    students,
    setStudents,
  ])

  return (
    <div
      className={cnsMerge(
        "GroupSelectWidget",
        "flex bg-blue-600 border-blue-800 text-white rounded-lg overflow-hidden",
        numSelected <= 0 && 'hidden',
      )}
    >
      <Tooltip title="Deselect all" enterDelay={500}>
        <button
          className="px-2 pb-1 border-r border-blue-800 hover:bg-blue-700 active:bg-blue-900 cursor-pointer"
          onClick={deselectAll}
        ><ClearIcon sx={{ fontSize: '1em' }} /></button>
      </Tooltip>

      <div className="px-2 border-r border-blue-900">
        {`${numSelected} students selected`}
      </div>

      <Tooltip title="Subtract 1 point" enterDelay={500}>
        <button
          className={"px-3 pb-1 border-r border-blue-800 hover:bg-blue-700 active:bg-blue-900 cursor-pointer"}
          onClick={decrementSelected}
        >-</button>
      </Tooltip>

        <Tooltip title="Add 1 point" enterDelay={500}>
          <button
            className="px-3 pb-1 border-r border-blue-800 hover:bg-blue-700 active:bg-blue-900 cursor-pointer"
            onClick={incrementSelected}
          >+</button>
        </Tooltip>
    </div>
  )
}
