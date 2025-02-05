import { useCallback, useMemo } from "react";
import { useStudentsContext } from "../../../context/StudentsContext";
import { Student } from "../../../types/student.type";

import './PointsCounter.css';
import { NumberInput } from '../../NumberInput/NumberInput';
import { getGradientColor } from '../../../utils/getGradientColor';
import { cnsMerge } from '../../../utils/cnsMerge';

interface PointsCounterProps {
  student: Student;
}

export const PointsCounter = (props: PointsCounterProps) => {
  const { student: { id, points } } = props;

  const { updateStudent } = useStudentsContext();

  const updatePoints = useCallback((points: number) => {
    updateStudent(id, { points });
  }, [
    id,
    updateStudent
  ]);

  const increment = useCallback(() => {
    updatePoints(points + 1);
  }, [
    points,
    updatePoints
  ]);

  // const decrement = useCallback(() => {
  //   updatePoints(points - 1);
  // }, [
  //   points,
  //   updatePoints
  // ]);

  const dynamicTextColor = useMemo(() => {
    return getDynamicColor(points);
  }, [
    points,
  ]);

  return (
    <div className={cnsMerge('PointsCounter px-[8%]')}>

      {/* <div className="plus-minus flex-1"  onClick={decrement}><span>-</span></div> */}

      <div
        className={cnsMerge('flex-1 bounce')}
        key={points}
      >
        <NumberInput
          className={cnsMerge("points-input h-full w-full")} 
          value={points}
          onChange={updatePoints}
          inputProps={{
            style: {
              color: dynamicTextColor,
              fontSize: '1.2em',
            }
          }}
        />
      </div>

      <div className={cnsMerge('plus-minus flex-1')} onClick={increment}><span>+</span></div>

    </div>
  );
}


const getDynamicColor = (points: number) => {
  return getGradientColor(
    points,
    0,
    50,
    [
      [0, 0, 0],      // Black
      [0, 160, 0],    // Green
      [0, 120, 220],  // Blue
      [180, 0, 220],  // Purple
      [200, 160, 0],  // Gold
    ]
  );
}
