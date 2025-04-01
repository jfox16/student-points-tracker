import { useCallback, useEffect, useState } from "react";

import { useSoundContext } from "../../../context/SoundContext";
import {
  studentIdsWithDelayedPointsAnimation,
  studentIdsWithNextPointsAnimation,
  useStudentContext
} from "../../../context/StudentContext";
import usePrevious from "../../../hooks/usePrevious";
import { Student } from "../../../types/student.type";
import { cnsMerge } from '../../../utils/cnsMerge';
import { useDebounce } from "../../../utils/useDebounce";

import { PointsButton } from "./PointsButton";
import { PointsDisplay } from "./PointsDisplay";

interface PointsCounterProps {
  className?: string;
  student: Student;
  index: number;
}

export const PointsCounter = ({ 
  className, 
  student, 
  index 
}: PointsCounterProps) => {
  const { updateStudent, addPointsToStudent } = useStudentContext();
  const { playPointSound } = useSoundContext();
  const [recentChange, setRecentChange] = useState<number | undefined>(undefined);
  const prevPoints = usePrevious(student.points);
  const [animationTrigger, setAnimationTrigger] = useState(student.points);
  const [clickEnabled, setClickEnabled] = useState(true);

  const debouncedResetRecentChange = useDebounce(() => {
    setRecentChange(undefined);
  }, 2000);

  const enableClickAfterDelay = useDebounce(() => {
    setClickEnabled(true);
  }, 100);

  const debouncedAddPoints = useDebounce((points: number) => {
    addPointsToStudent(student.id, points);
    setRecentChange(undefined);
  }, 100);

  useEffect(() => {
    if (typeof prevPoints !== "number") return;

    const diff = student.points - prevPoints;
    if (diff === 0) return;

    setRecentChange((recentChange ?? 0) + diff);
    debouncedResetRecentChange();

    if (studentIdsWithDelayedPointsAnimation.has(student.id)) {
      studentIdsWithDelayedPointsAnimation.delete(student.id);
      const delay = 8 * index;
      setTimeout(() => {
        setAnimationTrigger(student.points);
        playPointSound(1);
      }, delay);
    } else if (studentIdsWithNextPointsAnimation.has(student.id)) {
      studentIdsWithNextPointsAnimation.delete(student.id);
      setAnimationTrigger(student.points);
      playPointSound(5);
    }
  }, [prevPoints, student.points]);

  const handleInputChange = useCallback((points: number) => {
    updateStudent(student.id, { points });
  }, [student, updateStudent]);

  const handleIncrementClick = useCallback(() => {
    if (clickEnabled) {
      setAnimationTrigger(prev => prev + 1);
      setRecentChange(1);
      debouncedAddPoints(1);
      setClickEnabled(false);
      enableClickAfterDelay();
    }
  }, [clickEnabled, setClickEnabled, debouncedAddPoints, enableClickAfterDelay]);

  const handleDecrementClick = useCallback(() => {
    if (clickEnabled) {
      setAnimationTrigger(prev => prev + 1);
      setRecentChange(-1);
      debouncedAddPoints(-1);
      setClickEnabled(false);
      enableClickAfterDelay();
    }
  }, [clickEnabled, setClickEnabled, debouncedAddPoints, enableClickAfterDelay]);

  return (
    <>
      <style>
        {`
          @keyframes pop {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.4) translateY(-2px); }
            100% { transform: scale(1) translateY(0); }
          }
        `}
      </style>
      <div className={cnsMerge(
        "flex justify-center items-stretch px-[4%]",
        className
      )}>
        <PointsButton
          onClick={handleDecrementClick}
          symbol="-"
          disabled={!clickEnabled}
        />

        <PointsDisplay
          points={student.points}
          recentChange={recentChange}
          animationTrigger={animationTrigger}
        />

        <PointsButton
          onClick={handleIncrementClick}
          symbol="+"
          disabled={!clickEnabled}
        />
      </div>
    </>
  );
};
