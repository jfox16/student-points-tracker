import cns from 'classnames';
import { useCallback, useMemo } from "react";

import { useStudentsContext } from "../../../context/StudentsContext";
import { Student } from "../../../types/student.type";

import './PointsCounter.css';
import { NumberInput } from '../../NumberInput/NumberInput';
import { getGradientColor } from '../../../utils/getGradientColor';

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

  const dynamicTextColor = useMemo(() => {
    return getDynamicColor(student.points);
  }, [
    student.points,
  ])

  return (
    <div className="PointsCounter">
      {/* <div className="plus-minus" onClick={decrement}><span>-</span></div> */}
      <NumberInput
        className={cns("points-input", "w-full")} 
        value={student.points}
        onChange={updatePoints}
        inputProps={{
          style: { color: dynamicTextColor }
        }}
      />
      <div className="plus-minus" onClick={increment}><span>+</span></div>
    </div>
  );
}


const getDynamicColor = (points: number) => {
  return getGradientColor(
    points,
    0,
    100,
    [
      [0, 0, 0],      // Black
      [0, 160, 0],    // Green
      [0, 120, 220],  // Blue
      [180, 0, 220],  // Purple
      [200, 160, 0],  // Gold
    ]
  );
}
