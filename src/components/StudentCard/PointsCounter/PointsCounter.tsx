import { useCallback } from "react";

import { useStudentsContext } from "../../../context/StudentsContext";
import { Student } from "../../../types/studentTypes";
import { HoverInput } from "../../HoverInput/HoverInput";

import './PointsCounter.css';

interface PointsCounterProps {
  student: Student;
}

export const PointsCounter = (props: PointsCounterProps) => {
  const { student } = props;

  const { updateStudent } = useStudentsContext();

  const updatePoints = useCallback((points: number) => {
    updateStudent(student.id, { points });
  }, [
    student.id,
    updateStudent
  ]);

  const handleInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(e.target.value);
    if (typeof number === 'number' && number % 1 === 0 && number >= 0) {
      updatePoints(number);
    }
  }, [
    updatePoints,
  ])

  const increment = useCallback(() => {
    updatePoints(student.points + 1);
  }, [
    student.points,
    updatePoints
  ]);

  const decrement = useCallback(() => {
    updatePoints(student.points - 1);
  }, [
    student.points,
    updatePoints
  ]);

  return (
    <div className="PointsCounter">
      <div className="plus-minus" onClick={decrement}><span>-</span></div>
      <HoverInput
        className="points-input"
        value={student.points}
        onChange={handleInputOnChange}
      />
      <div className="plus-minus" onClick={increment}><span>+</span></div>
    </div>
  );
}
