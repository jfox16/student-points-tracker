import cns from 'classnames';
import { useCallback, useMemo } from "react";

import { useStudentsContext } from "../../../context/StudentsContext";
import { Student } from "../../../types/student.type";

import './PointsCounter.css';
import { NumberInput } from '../../NumberInput/NumberInput';

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
      <div className="plus-minus" onClick={decrement}><span>-</span></div>
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

/**
 * Returns a color for student points. From 0-20 it changes colors. black -> green -> blue -> purple -> gold
 * @param value Student points from 0-20
 * @returns 
 */
function getDynamicColor(value: number) {
  if (value < 0) {
    return `rgb(200, 0, 0)`;
  }

  const transition = value / 20;

  let red = 0;
  let green = 0;
  let blue = 0;

  // Black -> Green
  if (transition <= 0.25) {
    const factor = transition * 4;
    green = factor * 160;
  }
  else if (transition <= 0.50) {
    const factor = (transition - 0.25) * 4;
    green = 160 - factor * 40;
    blue = factor * 220;
  }
  else if (transition <= 0.75) {
    const factor = (transition - 0.50) * 4;
    red = factor * 180;
    green = 120 - factor * 120;
    blue = 220;
  }
  else if (transition <= 1.00) {
    const factor = (transition - 0.75) * 4;
    red = 180 + (factor * 20);
    green = factor * 160;
    blue = 200 - (factor * 200);
  }
  else {
    red = 200;
    green = 160;
    blue = 0;
  }
  
  const color = `rgb(${red}, ${green}, ${blue})`;
  return color;
}
