import React from 'react';
import { SortOption } from '../../context/BankContext';

interface Student {
  id: string;
  name: string;
  bankedPoints: number | undefined;
}

interface StudentListProps {
  students: Student[];
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
}

export const StudentList: React.FC<StudentListProps> = ({ students, sortOption, onSortChange }) => {
  // Filter out students who don't have a defined bankedPoints value
  const studentsWithBankedPoints = students.filter(student => student.bankedPoints !== undefined);

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
        {studentsWithBankedPoints.length > 0 ? (
          <div className="space-y-2">
            {studentsWithBankedPoints.map(student => (
              <div key={student.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {student.name.trim() ? (
                    <span className="font-medium">{student.name}</span>
                  ) : (
                    <span className="text-gray-400 italic">
                      Unnamed student {student.id.slice(0, 3)}
                    </span>
                  )}
                </div>
                <span className="font-semibold">{student.bankedPoints}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No points deposited yet</div>
        )}
      </div>
    </div>
  );
}; 