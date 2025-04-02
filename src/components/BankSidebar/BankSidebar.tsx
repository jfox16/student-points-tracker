import React, { useMemo } from 'react';
import { useBankContext, SortOption } from '../../context/BankContext';
import { useStudentContext } from '../../context/StudentContext';
import { useModal } from '../../context/ModalContext';
import { Student } from '../../types/student.type';
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

  const totalPoints = useMemo(() => {
    return students.reduce((sum, student) => sum + student.points, 0);
  }, [students]);

  const sortedStudents = useMemo(() => {
    return [...students]
      .filter(student => student.name.trim() !== '')
      .map(student => ({
        ...student,
        bankedPoints: bankedPoints[student.id] || 0
      }))
      .sort((a, b) => {
        switch (sortOption) {
          case SortOption.ALPHABETICAL:
            return a.name.localeCompare(b.name);
          case SortOption.LAST_NAME:
            return a.name.split(' ').pop()?.localeCompare(b.name.split(' ').pop() || '') || 0;
          case SortOption.POINTS:
            return b.bankedPoints - a.bankedPoints;
          default:
            return 0;
        }
      });
  }, [students, bankedPoints, sortOption]);

  return (
    <div className="w-128 h-full bg-white border-l border-gray-200 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Points Bank</h2>
        <div className="text-sm text-gray-500">Class Total: {totalPoints}</div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="mb-4">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={SortOption.ALPHABETICAL}>Sort by Name</option>
            <option value={SortOption.LAST_NAME}>Sort by Last Name</option>
            <option value={SortOption.POINTS}>Sort by Points</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          <StudentList students={sortedStudents} sortOption={sortOption} onSortChange={setSortOption} />
        </div>
        <div className="mt-4">
          <ClearPointsButton onClick={handleClearPoints} onDeposit={handleClearPoints} />
        </div>
      </div>
    </div>
  );
}; 