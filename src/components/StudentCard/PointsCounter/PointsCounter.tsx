import { useCallback } from "react";

import { useStudentContext } from "../../../context/StudentContext";
import { useStudentPointsAnimation } from "../../../hooks/useStudentPointsAnimation";
import { Student } from "../../../types/student.type";
import { cnsMerge } from '../../../utils/cnsMerge';

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
  const { animationDirection, animationTrigger, recentChange } = useStudentPointsAnimation(
    student,
    index,
  );

  const handleInputChange = useCallback((points: number) => {
    updateStudent(student.id, { points });
  }, [student, updateStudent]);

  const handleIncrementClick = useCallback(() => {
    addPointsToStudent(student.id, 1);
  }, [addPointsToStudent]);

  const handleDecrementClick = useCallback(() => {
    addPointsToStudent(student.id, -1);
  }, [addPointsToStudent]);

  return (
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
          animationDirection={animationDirection}
        />

        <PointsButton
          onClick={handleIncrementClick}
          symbol="+"
        />
    </div>
  );
};
