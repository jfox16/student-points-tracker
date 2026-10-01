import { useCallback } from "react";

import { useStudentContext } from "../../../context/StudentContext";
import { useStudentPointsAnimation } from "../../../hooks/useStudentPointsAnimation";
import { PointAdjuster } from "../../PointAdjuster/PointAdjuster";
import { Student } from "../../../types/student.type";
import { cnsMerge } from "../../../utils/cnsMerge";

interface PointsCounterProps {
  className?: string;
  student: Student;
}

export const PointsCounter = ({
  className,
  student,
}: PointsCounterProps) => {
  const { updateStudent, addPointsToStudent } = useStudentContext();
  const { animationDirection, animationTrigger, recentChange } = useStudentPointsAnimation(
    student,
  );
  const studentName = student.name || "student";

  const handleInputChange = useCallback((points: number) => {
    updateStudent(student.id, { points });
  }, [student, updateStudent]);

  return (
    <PointAdjuster
      animationDirection={animationDirection}
      animationTrigger={animationTrigger}
      className={cnsMerge("px-[4%]", className)}
      decrementLabel={`Subtract one point from ${studentName}`}
      incrementLabel={`Add one point to ${studentName}`}
      onDecrement={() => addPointsToStudent(student.id, -1)}
      onIncrement={() => addPointsToStudent(student.id, 1)}
      onPointsChange={handleInputChange}
      points={student.points}
      recentChange={recentChange}
    />
  );
};
