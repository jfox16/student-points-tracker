
import ClearIcon from '@mui/icons-material/Clear';
import { useCallback, useMemo } from "react";

import { Tooltip } from '@mui/material';
import { useStudentsContext } from '../../../../context/StudentsContext';
import { cnsMerge } from '../../../../utils/cnsMerge';

export const GroupSelectWidget = () => {

  const { students, setStudents } = useStudentsContext();

  const selectedStudents = useMemo(() => {
    return students.filter(student => student.selected);
  }, [
    students
  ])

  const deselectAll = useCallback(() => {
    setStudents(students.map(student => {
      return student.selected ? { ...student, selected: false } : student;
    }));
  }, [
    students,
    setStudents
  ])

  const incrementSelected = useCallback(() => {
    setStudents(students.map(student => {
      return student.selected ? { ...student, points: student.points + 1 } : student;
    }))
  }, [
    students,
    setStudents,
  ]);

  const decrementSelected = useCallback(() => {
    setStudents(students.map(student => {
      return student.selected ? { ...student, points: student.points - 1 } : student;
    }))
  }, [
    students,
    setStudents,
  ])

  return (
    <div
      className={cnsMerge(
        "GroupSelectWidget",
        "flex bg-blue-600 border-blue-800 text-white rounded-lg overflow-hidden",
        selectedStudents.length <= 0 && 'hidden',
      )}
    >
      <Tooltip title="Deselect" enterDelay={500}>
        <button
          className="px-2 pb-1 border-r border-blue-800 hover:bg-blue-700 active:bg-blue-900 cursor-pointer"
          onClick={deselectAll}
        ><ClearIcon sx={{ fontSize: '1em' }} /></button>
      </Tooltip>

      <div className="px-2 border-r border-blue-900">
        {`${selectedStudents.length} students selected`}
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
