import { useCallback, useEffect, useMemo, useState } from "react";

import { useSoundContext } from "../../../context/SoundContext";
import {
  studentIdsWithDelayedPointsAnimation,
  studentIdsWithNextPointsAnimation,
  useStudentContext
} from "../../../context/StudentContext";
import usePrevious from "../../../hooks/usePrevious";
import { Student } from "../../../types/student.type";
import { getGradientColor } from '../../../utils/getGradientColor';
import { cnsMerge } from '../../../utils/cnsMerge';
import { useDebounce } from "../../../utils/useDebounce";

import { NumberInput } from '../../NumberInput/NumberInput';

import './PointsCounter.css';

interface PointsCounterProps {
  className?: string;
  student: Student;
  index: number;
}

export const PointsCounter = (props: PointsCounterProps) => {
  const { className, student, index } = props;

  const { updateStudent, addPointsToStudent } = useStudentContext();
  const { playPointSound } = useSoundContext();
  const [recentChange, setRecentChange] = useState<number | undefined>(undefined);
  const prevPoints = usePrevious(student.points);

  const [animationTrigger, setAnimationTrigger] = useState(student.points);

  useEffect(() => {
    if (typeof prevPoints !== "number") return;

    const diff = student.points - prevPoints;
    if (diff === 0) return;

    setRecentChange((recentChange ?? 0) + diff);
    debouncedResetRecentChange();

    if (studentIdsWithDelayedPointsAnimation.has(student.id)) {
      studentIdsWithDelayedPointsAnimation.delete(student.id);
      const delay = 8 * index
      setTimeout(() => {
        setAnimationTrigger(student.points);
        playPointSound(1);
      }, delay);
    } else if (studentIdsWithNextPointsAnimation.has(student.id)) {
      studentIdsWithNextPointsAnimation.delete(student.id)
      setAnimationTrigger(student.points);
      playPointSound(5);
    }
  }, [prevPoints, student.points]);

  const debouncedResetRecentChange = useDebounce(() => {
    setRecentChange(undefined);
  }, 2000);

  const handleInputChange = useCallback((points: number) => {
    updateStudent(student.id, { points });
  }, [
    student,
    updateStudent,
  ])

  const [clickEnabled, setClickEnabled] = useState(true);
  const enableClickAfterDelay = useDebounce(() => {
    setClickEnabled(true);
  }, 100);

  const handleIncrementClick = useCallback(() => {
    // Avoid accidental double click bug
    if (clickEnabled) {
      addPointsToStudent(student.id, 1);
      setClickEnabled(false);
      enableClickAfterDelay();
    }
  }, [
    clickEnabled,
    setClickEnabled,
    addPointsToStudent,
    enableClickAfterDelay,
  ]);

  const handleDecrementClick = useCallback(() => {
    // Avoid accidental double click bug
    if (clickEnabled) {
      addPointsToStudent(student.id, -1);
      setClickEnabled(false);
      enableClickAfterDelay();
    }
  }, [
    clickEnabled,
    setClickEnabled,
    addPointsToStudent,
    enableClickAfterDelay,
  ]);

  const dynamicTextColor = useMemo(() => {
    return getDynamicColor(student.points);
  }, [student.points]);

  const recentChangeString = useMemo(() => {
    if (!recentChange) return "";
    const sign = recentChange < 0 ? "" : "+";
    return `${sign}${recentChange}`;
  }, [recentChange]);

  return (
    <div className={cnsMerge("PointsCounter px-[4%]", className)}>
      <div className="relative flex-1 h-full">
        {/* Left clickable area for decrement */}
        <div
          className="absolute inset-0 w-[40%] cursor-pointer hover:bg-gray-100/50"
          onClick={handleDecrementClick}
          style={{ zIndex: 1 }}
        />
        
        {/* Right clickable area for increment */}
        <div
          className="absolute inset-0 w-[40%] cursor-pointer hover:bg-gray-100/50"
          onClick={handleIncrementClick}
          style={{ left: '60%', zIndex: 1 }}
        />

        {/* Main content */}
        <div className="relative flex-1 bounce h-full" key={animationTrigger}>
          <div
            className={cnsMerge(
              "absolute inset-0 top-[-0.5em]",
              "flex justify-center",
              "pointer-events-none",
              "font-xs text-gray-400"
            )}
          >
            {recentChangeString}
          </div>
          <NumberInput
            className={cnsMerge("points-input h-full w-full")}
            value={student.points}
            onChange={handleInputChange}
            inputProps={{
              style: {
                color: dynamicTextColor,
                fontSize: "1.5em",
              },
            }}
          />
        </div>
      </div>

      <div
        className={cnsMerge("plus-minus flex-1 text-gray-400 hover:text-gray-600")}
        onClick={handleIncrementClick}
      >
        <span>+</span>
      </div>
    </div>
  );
};

const getDynamicColor = (points: number) => {
  return getGradientColor(points, 0, 100, [
    [0, 0, 0], // Black
    [0, 160, 0], // Green
    [0, 120, 220], // Blue
    [180, 0, 220], // Purple
    [200, 160, 0], // Gold
  ]);
};
