import { useCallback, useEffect, useMemo, useState } from "react";


import { useSoundContext } from "../../../context/SoundContext";
import {
  studentIdsWithDelayedPointsAnimation,
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
}

export const PointsCounter = (props: PointsCounterProps) => {
  const { className, student } = props;

  const { playSound } = useSoundContext();
  const { updateStudent } = useStudentContext();
  const [recentChange, setRecentChange] = useState<number | undefined>(undefined);
  const prevPoints = usePrevious(student.points);

  // ✅ Replaces `delayedPoints` with `animationTrigger`
  const [animationTrigger, setAnimationTrigger] = useState(student.points);
  const [isFirstAnimation, setIsFirstAnimation] = useState(true);

  useEffect(() => {
    if (typeof prevPoints !== "number") return;

    const diff = student.points - prevPoints;
    if (diff === 0) return;

    setRecentChange((recentChange ?? 0) + diff);
    debouncedResetRecentChange();

    if (studentIdsWithDelayedPointsAnimation.has(student.id)) {
      studentIdsWithDelayedPointsAnimation.delete(student.id);
      const randomDelay = Math.random() * 160;
      setTimeout(() => {
        setAnimationTrigger(student.points);
      }, randomDelay);
    } else {
      setAnimationTrigger(student.points);
    }
  }, [prevPoints, student.points]);

  const debouncedResetRecentChange = useDebounce(() => {
    setRecentChange(undefined);
  }, 2000);

  useEffect(() => {
    if (isFirstAnimation) {
      setIsFirstAnimation(false);
      return;
    }
    playSound("point", student.points * 0.01);
  }, [animationTrigger]);

  const updatePoints = useCallback(
    (newPoints: number) => {
      updateStudent(student.id, { points: newPoints });
    },
    [student.id, updateStudent]
  );

  const increment = useCallback(() => {
    updatePoints(student.points + 1);
  }, [student.points, updatePoints]);

  const [clickEnabled, setClickEnabled] = useState(true);
  const enableClickAfterDelay = useDebounce(() => {
    setClickEnabled(true);
  }, 100);

  const handleIncrementClick = useCallback(() => {
    // Avoid accidental double click bug
    if (clickEnabled) {
      increment();
      setClickEnabled(false);
      enableClickAfterDelay();
    }
  }, [clickEnabled, setClickEnabled, increment, enableClickAfterDelay]);

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
      <div className={cnsMerge("relative flex-1 bounce h-full")} key={animationTrigger}>
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
          onChange={updatePoints}
          inputProps={{
            style: {
              color: dynamicTextColor,
              fontSize: "1.2em",
            },
          }}
        />
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
