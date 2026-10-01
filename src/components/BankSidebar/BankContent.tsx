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
    <div className="flex flex-col">
      <StudentList 
        students={students} 
        sortOption={sortOption} 
        onSortChange={onSortChange}
      />
      <div className="mt-4">
        <ClearPointsButton onClick={onClearPoints} />
      </div>
    </div>
  );
}; 