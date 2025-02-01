

import { useCallback, useMemo, useState } from "react";

import { useStudentsContext } from "../../context/StudentsContext";
import { useCardDrag } from "../../hooks/useCardDrag";
import { Student } from "../../types/student.type";

import { useModal } from '../../context/ModalContext';
import { cnsMerge } from '../../utils/cnsMerge';

import { HoverInput } from '../HoverInput/HoverInput';
import { CardHeader } from '../CardHeader/CardHeader';
import { PointsCounter } from "./PointsCounter/PointsCounter";

import './StudentCard.css';

interface StudentCardProps {
  student: Student;
  index: number; // index of Student in list. Needed for drag and drop
}

export const StudentCard = (props: StudentCardProps) => {
  const { student, index } = props;
  const {
    students,
    deleteStudent,
    updateStudent,
    moveStudent,
    setDragHoverIndex,
    dragHoverIndex,
  } = useStudentsContext();
  
  const { showModal } = useModal();

  const {
    dragObjectRef,
    dragHandleRef,
    isDragging,
  } = useCardDrag({
    moveCard: moveStudent,
    type: "STUDENT",
    item: student,
    index,
    dragHoverIndex,
    setDragHoverIndex
  });

  const [ isHovered, setIsHovered ] = useState(false);

  const onNameInputChange = useCallback((name: string) => {
    updateStudent(student.id, { name });
  }, [
    student.id,
    updateStudent,
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
    updateStudent(student.id, { selected });
  }, [
    student.id,
    updateStudent,
  ]);

  const isTransparent = useMemo(() => {
    return (!student.name && !student.points) || isDragging
  }, [
    student.name,
    student.points,
    isDragging,
  ]);

  return (
    <div
      className={cnsMerge(
        'border-2 border-transparent p-2',
        dragHoverIndex === index && 'border-l-blue-500',
        dragHoverIndex === index + 1 && 'border-r-blue-500',
      )}
      ref={dragObjectRef}
    >
      <div
        className={cnsMerge("StudentCard", isTransparent && 'opacity-50')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader
          autoHide={!isHovered}
          onClickDelete={openDeleteStudentModal}
          onSelectChange={handleSelectChange}
          selected={student.selected}
          dragHandleRef={dragHandleRef}
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
    </div>
  );
}
