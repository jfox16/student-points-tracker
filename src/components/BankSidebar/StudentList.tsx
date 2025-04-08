import React, { useState, useEffect } from 'react';
import { SortOption } from '../../context/BankContext';

interface Student {
  id: string;
  name: string;
  bankedPoints: number;
}

interface StudentListProps {
  students: Student[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const CountingNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    if (value === displayValue) return;
    
    const difference = value - displayValue;
    const increment = difference > 0 ? 1 : -1;
    
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const next = prev + increment;
        if ((increment > 0 && next >= value) || (increment < 0 && next <= value)) {
          clearInterval(interval);
          return value;
        }
        return next;
      });
    }, 16); // ~60fps animation
    
    return () => clearInterval(interval);
  }, [value, displayValue]);
  
  return <span className="font-semibold">{displayValue}</span>;
};

export const StudentList: React.FC<StudentListProps> = ({ students, sortOption, onSortChange }) => {
  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold">Sort By:</div>
        <select 
          className="p-2 rounded border border-gray-300"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value={SortOption.ALPHABETICAL}>First Name</option>
          <option value={SortOption.LAST_NAME}>Last Name</option>
          <option value={SortOption.POINTS}>Points</option>
        </select>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">Banked Points by Student:</div>
        <div className="space-y-2">
          {students.map(student => (
            <div key={student.id} className="flex justify-between items-center">
              <span className="text-sm">{student.name}</span>
              <CountingNumber value={student.bankedPoints} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 