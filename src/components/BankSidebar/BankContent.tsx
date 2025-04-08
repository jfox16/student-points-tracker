import React from 'react';
import { Student } from '../../types/student.type';
import { StudentList } from './StudentList';
import { ClearPointsButton } from './ClearPointsButton';
import { SortOption } from '../../context/BankContext';

interface BankContentProps {
  students: (Student & { bankedPoints: number | undefined })[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  onClearPoints: () => void;
}

export const BankContent: React.FC<BankContentProps> = ({
  students,
  sortOption,
  onSortChange,
  onClearPoints,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-6">
        <StudentList 
          students={students} 
          sortOption={sortOption} 
          onSortChange={onSortChange}
        />
      </div>
      <div className="mt-4 pr-4">
        <ClearPointsButton onClick={onClearPoints} />
      </div>
    </div>
  );
}; 