import React, { useMemo } from 'react';
import { useBankContext } from '../../context/BankContext';
import { useStudentContext } from '../../context/StudentContext';
import { useModal } from '../../context/ModalContext';
import { SortOption } from '../../context/BankContext';
import { StudentList } from './StudentList';
import { ClearPointsButton } from './ClearPointsButton';
import './BankSidebar.css';

export const BankSidebar: React.FC = () => {
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
          // Clear all banked points by setting them to 0
          const clearedPoints = Object.keys(bankedPoints).reduce((acc, studentId) => {
            acc[studentId] = 0;
            return acc;
          }, {} as { [key: string]: number });
          depositPoints(clearedPoints);
        },
        acceptText: 'Clear',
        cancelText: 'Cancel'
      }
    );
  };

  const totalBankedPoints = Object.values(bankedPoints).reduce((sum, points) => sum + points, 0);

  const sortedStudents = useMemo(() => {
    const studentsWithBankedPoints = students
      .filter(student => student.name.trim() !== '') // Filter out empty names
      .map(student => ({
        ...student,
        bankedPoints: bankedPoints[student.id] || 0
      }));

    switch (sortOption) {
      case SortOption.ALPHABETICAL:
        return studentsWithBankedPoints.sort((a, b) => a.name.localeCompare(b.name));
      case SortOption.LAST_NAME:
        return studentsWithBankedPoints.sort((a, b) => {
          const getLastName = (name: string) => name.split(' ').pop() || '';
          return getLastName(a.name).localeCompare(getLastName(b.name));
        });
      case SortOption.POINTS:
        return studentsWithBankedPoints.sort((a, b) => b.bankedPoints - a.bankedPoints);
      default:
        return studentsWithBankedPoints;
    }
  }, [students, bankedPoints, sortOption]);

  return (
    <div className="BankSidebar bg-gray-100 border-l border-gray-400 p-4 w-128">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold">Points Bank</div>
        <div className="text-2xl">
          Class Total: {totalBankedPoints}
        </div>
        
        <StudentList 
          students={sortedStudents}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        <ClearPointsButton 
          onClick={handleClearPoints}
          onDeposit={handleClearPoints}
        />
      </div>
    </div>
  );
}; 