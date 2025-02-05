import { useCallback, useEffect, useMemo, useState } from "react";
import { useStudentsContext } from "../../../context/StudentsContext";
import { Student } from "../../../types/student.type";

import './PointsCounter.css';
import { NumberInput } from '../../NumberInput/NumberInput';
import { getGradientColor } from '../../../utils/getGradientColor';
import { cnsMerge } from '../../../utils/cnsMerge';
import usePrevious from "../../../hooks/usePrevious";
import { useDebounce } from "../../../utils/useDebounce";

interface PointsCounterProps {
  className?: string;
  student: Student;
}

export const PointsCounter = (props: PointsCounterProps) => {
  const {
    className,
    student: { id, points }
  } = props;

  const { updateStudent } = useStudentsContext();
  const [ recentChange, setRecentChange ] = useState<number|undefined>(undefined);
  const prevPoints = usePrevious(points);

  useEffect(() => {
    if (typeof prevPoints !== 'number') {
      return;
    }
    const diff = points - prevPoints;
    setRecentChange((recentChange ?? 0) + diff);
    resetRecentChangeAfterDelay();
  }, [
    prevPoints,
    points
  ])

  const resetRecentChangeAfterDelay = useDebounce(() => {
    setRecentChange(undefined);
  }, 2000);

  const updatePoints = useCallback((newPoints: number) => {
    updateStudent(id, { points: newPoints });
  }, [
    id,
    updateStudent
  ]);

  const increment = useCallback(() => {
    console.log('increment', { points });
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

  const recentChangeString = useMemo(() => {
    if (!recentChange) return '';
    const sign = recentChange < 0 ? '' : '+';
    return `${sign}${recentChange}`;
  }, [
    recentChange,
  ]);

  return (
    <div className={cnsMerge('PointsCounter px-[4%]', className)}>

      {/* <div className="plus-minus flex-1"  onClick={decrement}><span>-</span></div> */}

      <div
        className={cnsMerge('relative flex-1 bounce h-full')}
        key={points}
      >
        <div
          className={cnsMerge(
            'absolute inset-0 top-[-8px]',
            'flex justify-center',
            'pointer-events-none',
            'font-xs text-gray-400'
          )}
        >
          {recentChangeString}
        </div>
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

      <div className={cnsMerge('plus-minus flex-1 text-gray-400 hover:text-gray-600')} onClick={increment}><span>+</span></div>

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
