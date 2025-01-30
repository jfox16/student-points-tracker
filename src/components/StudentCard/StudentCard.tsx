
import cns from 'classnames';
import { useCallback, useEffect, useMemo, useState } from "react";

import { Student } from "../../types/student.type";
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
  const {
    deleteStudent,
    updateStudent,
    selectedStudentIds,
    setStudentSelected
  } = useStudentsContext();

  const [isCardHovered, setIsCardHovered] = useState(false);

  const onNameInputChange = useCallback((name: string) => {
    updateStudent(student.id, { name });
  }, [
    student.id,
    updateStudent,
  ]);

  const isTransparent = useMemo(() => {
    return !student.name && !student.points
  }, [
    student.name,
    student.points
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

  const handleSelectChange = useCallback((selected: boolean) => {
    setStudentSelected(student.id, selected);
  }, [
    student.id,
    setStudentSelected
  ])

  const selected = useMemo(() => {
    console.log({ selectedStudentIds })
    return selectedStudentIds.has(student.id);
  }, [
    student.id,
    selectedStudentIds,
  ])

  return (
    <div
      className={cns("StudentCard", {
        'transparent': isTransparent
      })}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <CardHeader
        autoHide={!isCardHovered}
        onClickDelete={openDeleteStudentModal}
        onSelectChange={handleSelectChange}
        selected={selected}
      />
      <div>
        <HoverInput
          className="w-full"
          onChange={onNameInputChange}
          placeholder="Type name here..."
          value={student.name}
        />
      </div>
      <PointsCounter student={student} />
    </div>
  );
}
