import { useCallback, useEffect, useState } from "react";

import { useSoundStore } from "../../../stores/useSoundStore";
import { useStudentStore } from "../../../stores/useStudentStore";
import usePrevious from "../../../hooks/usePrevious";
import { Student } from "../../../types/student.type";
import { cnsMerge } from '../../../utils/cnsMerge';
import { useDebounce } from "../../../utils/useDebounce";

import { PointsButton } from "./PointsButton";
import { PointsDisplay } from "./PointsDisplay";

// Track animation states
const studentIdsWithDelayedPointsAnimation = new Set<string>();
const studentIdsWithNextPointsAnimation = new Set<string>();

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
  const { updateStudent, addPointsToStudent } = useStudentStore();
  const { playSound } = useSoundStore();
  const [recentChange, setRecentChange] = useState<number | undefined>(undefined);
  const prevPoints = usePrevious(student.points);
  const [animationTrigger, setAnimationTrigger] = useState(student.points);

  const debouncedResetRecentChange = useDebounce(() => {
    setRecentChange(undefined);
  }, 2000);

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
        playSound('ding');
      }, delay);
    } else if (studentIdsWithNextPointsAnimation.has(student.id)) {
      studentIdsWithNextPointsAnimation.delete(student.id);
      setAnimationTrigger(student.points);
      playSound('bubble');
    }
  }, [prevPoints, student.points, playSound, index]);

  const handleInputChange = useCallback((points: number) => {
    updateStudent(student.id, { points });
  }, [student, updateStudent]);

  const handleIncrementClick = useCallback(() => {
    addPointsToStudent(student.id, 1);
  }, [addPointsToStudent, student.id]);

  const handleDecrementClick = useCallback(() => {
    addPointsToStudent(student.id, -1);
  }, [addPointsToStudent, student.id]);

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
        />

        <PointsDisplay
          points={student.points}
          recentChange={recentChange}
          onChange={handleInputChange}
          animationTrigger={animationTrigger}
        />

        <PointsButton
          onClick={handleIncrementClick}
          symbol="+"
        />
      </div>
    </>
  );
};
