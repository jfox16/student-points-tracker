import { useCallback } from "react";
import { useTabContext } from "../../context/TabContext";
import { Student } from "../../types/studentTypes";

interface PointsCounterProps {
  student: Student;
}

export const PointsCounter = (props: PointsCounterProps) => {
  const { student } = props;

  const { updateStudent } = useTabContext();

  const updatePoints = useCallback((points: number) => {
    updateStudent(student.id, { points });
  }, [
    student.id
  ]);

  const increment = useCallback(() => {
    updatePoints(student.points + 1);
  }, [
    updatePoints
  ]);

  const decrement = useCallback(() => {
    updatePoints(student.points - 1);
  }, [
    updatePoints
  ]);

  return (
    <div className="PointsCounter">
      {student.points}
    </div>
  );
}
