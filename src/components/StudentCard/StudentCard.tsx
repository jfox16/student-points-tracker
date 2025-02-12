

import { useCallback, useMemo, useState } from "react";

import { useAppContext } from "../../context/AppContext";
import { useStudentContext } from "../../context/StudentContext";
import { useCardDrag } from "../../hooks/useCardDrag";
import { Student } from "../../types/student.type";

import { useModal } from '../../context/ModalContext';
import { cnsMerge } from '../../utils/cnsMerge';

import { HoverInput } from '../HoverInput/HoverInput';
import { CardHeader } from '../CardHeader/CardHeader';
import { PointsCounter } from "./PointsCounter/PointsCounter";

import './StudentCard.css';

interface StudentCardProps {
  className?: string;
  student: Student;
  index: number; // index of Student in list. Needed for drag and drop
}

export const StudentCard = (props: StudentCardProps) => {
  const { className, student, index } = props;

  const {
    appOptions,
  } = useAppContext();
  const {
    deleteStudent,
    updateStudent,
    moveStudent,
    setDragHoverIndex,
    dragHoverIndex,
    keyBindingsMap,
  } = useStudentContext();
  
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
      { onAccept: () => deleteStudent(student.id) },
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

  const kbKey = useMemo(() => {
    if (appOptions.enableKeybinds) {
      const kbKey = keyBindingsMap[student.id];
      return kbKey ?? ' '; // Empty character to take the same space
    }
    return '';
  }, [
    appOptions.enableKeybinds,
    keyBindingsMap,
    student.id,
  ]);

  return (
    <div
      className={cnsMerge(
        'border-2 border-transparent p-1 rounded-lg',
        dragHoverIndex === index && 'border-l-blue-500',
        dragHoverIndex === index + 1 && 'border-r-blue-500',
        className,
      )}
      ref={dragObjectRef}
    >
      <div className={cnsMerge('border-2 border-transparent rounded-sm', student.selected && 'border-blue-500')}>
        <div
          className={cnsMerge("StudentCard h-[7em] px-1 py-2 pt-4 rounded-xs", isTransparent && 'opacity-50')}
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

          <div
            className="flex flex-col h-full justify-center"
          >
            {kbKey && <div className={cnsMerge('flex-1 max-h-6 text-gray-400')}>
              {kbKey}
            </div>}

            <HoverInput
              className="flex-1 max-h-10 w-full"
              onChange={onNameInputChange}
              placeholder="Type name here..."
              value={student.name}
            />

            
            <PointsCounter
              className="flex-1 w-full max-h-[3em] min-h-[2.6em]"
              student={student}
              index={index}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
