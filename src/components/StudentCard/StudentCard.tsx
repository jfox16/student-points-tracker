
import cns from 'classnames';
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Student } from "../../types/studentTypes";

import { useTabContext } from "../../context/TabContext";

import './StudentCard.css';
import { PointsCounter } from "./PointsCounter";

interface StudentCardProps {
  student: Student;
}

export const StudentCard = (props: StudentCardProps) => {
  const { student } = props;
  const { updateStudent } = useTabContext();

  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);

  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    updateStudent(
      student.id,
      { name: e.target.value }
    )
  }, [
    student.id,
    updateStudent,
  ]);

  useEffect(() => {
    setIsTransparent(!student.name && !student.points);
  }, [
    student.name
  ])

  return (
    <div
      className={cns("StudentCard", {
        'transparent': isTransparent
      })}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <div>
        <input
          className="name-input"
          value={student.name}
          onChange={onNameChange}
          onFocus={(e) => e.target.select()}
          placeholder="Type name here..."
        />
      </div>
      <PointsCounter student={student} />
    </div>
  );
}
