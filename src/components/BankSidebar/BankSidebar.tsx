import React, { useMemo } from 'react';
import { useBankContext, SortOption } from '../../context/BankContext';
import { useSidebarLayout } from '../../context/SidebarLayoutContext';
import { useStudentContext } from '../../context/StudentContext';
import { useModal } from '../../context/ModalContext';
import { ResizableSidebar } from '../ResizableSidebar/ResizableSidebar';
import { BankHeader } from './BankHeader';
import { BankContent } from './BankContent';
import './BankSidebar.css';

export const BankSidebar: React.FC = () => {
  const { bankedPoints, depositPoints, sortOption, setSortOption } = useBankContext();
  const { students } = useStudentContext();
  const { showModal } = useModal();
  const { rightOpen } = useSidebarLayout();

  const handleClearPoints = () => {
    showModal(
      <div className="text-center">
        <p className="mb-4">Are you sure you want to clear all banked points?</p>
        <p className="text-sm text-gray-600">This will reset all students' banked points to 0.</p>
      </div>,
      {
        onAccept: () => {
          // Clear points only for current class students
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
        // If either student doesn't have banked points, put them at the end
        if (a.bankedPoints === undefined) return 1;
        if (b.bankedPoints === undefined) return -1;
        
        // If either student has no name, put them at the end
        const aHasName = a.name.trim();
        const bHasName = b.name.trim();
        if (!aHasName && !bHasName) {
          // If both are unnamed, sort by ID
          return a.id.localeCompare(b.id);
        }
        if (!aHasName) return 1;
        if (!bHasName) return -1;
        
        switch (sortOption) {
          case SortOption.ALPHABETICAL:
            // Sort by full name for alphabetical
            return a.name.localeCompare(b.name);
          case SortOption.LAST_NAME:
            // Sort by last word in the name
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

  if (!rightOpen) return null;

  return (
    <ResizableSidebar
      className="bg-gray-100 border-l border-gray-400"
      defaultWidth={256}
      handleEdge="left"
      label="Resize points bank"
      maxWidth={560}
      minWidth={240}
      storageKey="details_sidebar_width"
    >
      <div className="BankSidebar h-full min-w-0 flex flex-col overflow-y-auto py-4 pl-3 pr-3">
        <BankHeader totalPoints={totalPoints} />
        <BankContent
          students={sortedStudents}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onClearPoints={handleClearPoints}
        />
      </div>
    </ResizableSidebar>
  );
}; 