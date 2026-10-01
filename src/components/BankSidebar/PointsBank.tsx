import React, { useMemo } from 'react';
import { useBankContext, SortOption } from '../../context/BankContext';
import { useStudentContext } from '../../context/StudentContext';
import { useModal } from '../../context/ModalContext';
import { BankHeader } from './BankHeader';
import { BankContent } from './BankContent';
import './BankSidebar.css';

interface PointsBankProps {
  compact?: boolean;
}

export const PointsBank: React.FC<PointsBankProps> = ({ compact = false }) => {
  const { bankedPoints, depositPoints, sortOption, setSortOption } = useBankContext();
  const { students } = useStudentContext();
  const { showModal } = useModal();

  const handleClearPoints = () => {
    showModal(
      <div className="text-center">
        <p className="mb-4">Are you sure you want to clear all banked points?</p>
        <p className="text-sm text-gray-600">This will reset all students' banked points to 0.</p>
      </div>,
      {
        onAccept: () => {
          const clearedPoints = students.reduce((acc, student) => {
            acc[student.id] = 0;
            return acc;
          }, {} as { [key: string]: number });
          depositPoints(clearedPoints);
        },
        acceptText: 'Clear',
        cancelText: 'Cancel'
      }
    );
  };

  const totalPoints = useMemo(() => {
    return students
      .reduce((sum, student) => sum + (bankedPoints[student.id] || 0), 0);
  }, [students, bankedPoints]);

  const sortedStudents = useMemo(() => {
    return [...students]
      .map(student => ({
        ...student,
        bankedPoints: student.id in bankedPoints ? bankedPoints[student.id] : undefined
      }))
      .sort((a, b) => {
        if (a.bankedPoints === undefined) return 1;
        if (b.bankedPoints === undefined) return -1;

        const aHasName = a.name.trim();
        const bHasName = b.name.trim();
        if (!aHasName && !bHasName) {
          return a.id.localeCompare(b.id);
        }
        if (!aHasName) return 1;
        if (!bHasName) return -1;

        switch (sortOption) {
          case SortOption.ALPHABETICAL:
            return a.name.localeCompare(b.name);
          case SortOption.LAST_NAME:
            const aLastName = a.name.split(' ').pop() || '';
            const bLastName = b.name.split(' ').pop() || '';
            return aLastName.localeCompare(bLastName);
          case SortOption.POINTS:
            return b.bankedPoints - a.bankedPoints;
          default:
            return 0;
        }
      });
  }, [students, bankedPoints, sortOption]);

  return (
    <div className="BankSidebar min-w-0 flex flex-col">
      <BankHeader compact={compact} totalPoints={totalPoints} />
      <BankContent
        students={sortedStudents}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onClearPoints={handleClearPoints}
      />
    </div>
  );
};
