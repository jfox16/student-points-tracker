
import cns from 'classnames';
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { Student } from "../../types/studentTypes";
import { useStudentsContext } from "../../context/StudentsContext";
import { HoverInput } from '../HoverInput/HoverInput';
import { PointsCounter } from "./PointsCounter/PointsCounter";

import './StudentCard.css';
import { useModal } from '../../context/ModalContext';
import { CardHeader } from '../CardHeader/CardHeader';

interface StudentCardProps {
  student: Student;
}

export const StudentCard = (props: StudentCardProps) => {
  const { student } = props;

  const { showModal } = useModal();
  const { updateStudent, deleteStudent } = useStudentsContext();

  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);

  const onNameInputChange = useCallback((name: string) => {
    updateStudent(student.id, { name });
  }, [
    student.id,
    updateStudent,
  ]);

  useEffect(() => {
    setIsTransparent(!student.name && !student.points);
  }, [
    student.name,
    student.points,
  ]);

  const openDeleteStudentModal = useCallback(() => {
    const studentName = student.name ? ` (${student.name})` : '';
    showModal(
      `Are you sure you want to delete this student?${studentName}`,
      () => deleteStudent(student.id),
    )
  }, [
    deleteStudent,
    showModal,
    student.id,
    student.name,
  ]);

  return (
    <div
      className={cns("StudentCard", {
        'transparent': isTransparent
      })}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <CardHeader
        hide={!isCardHovered}
        onClickDelete={openDeleteStudentModal}
      />
      <div>
        <HoverInput
          onChange={onNameInputChange}
          placeholder="Type name here..."
          value={student.name}
        />
      </div>
      <PointsCounter student={student} />
    </div>
  );
}
