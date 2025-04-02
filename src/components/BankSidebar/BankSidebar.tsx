import React, { useMemo } from 'react';
import { useBankContext, SortOption } from '../../context/BankContext';
import { useStudentContext } from '../../context/StudentContext';
import { cnsMerge } from '../../utils/cnsMerge';
import './BankSidebar.css';

const TROPHY_EMOJIS = {
  1: '🥇',
  2: '🥈',
  3: '🥉'
};

const sortOptions = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'points', label: 'Points' },
] as const;

export const BankSidebar: React.FC = () => {
  const { bankedPoints, sortOption, setSortOption } = useBankContext();
  const { students } = useStudentContext();

  const totalBankedPoints = Object.values(bankedPoints).reduce((sum, points) => sum + points, 0);

  const sortedStudents = useMemo(() => {
    // Filter out students with empty names and add banked points
    const studentsWithBankedPoints = students
      .filter(student => student.name.trim())
      .map(student => ({
        ...student,
        bankedPoints: bankedPoints[student.id] || 0
      }));

    switch (sortOption) {
      case SortOption.FIRST_NAME:
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

  // Calculate class ranking
  const classRanking = useMemo(() => {
    const classNames = Array.from(new Set(students.map(s => s.className).filter((name): name is string => !!name)));
    const classTotals = classNames.map(className => ({
      className,
      total: students
        .filter(s => s.className === className)
        .reduce((sum, s) => sum + (bankedPoints[s.id] || 0), 0)
    }));
    
    return classTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((c, i) => ({ ...c, rank: i + 1 }));
  }, [students, bankedPoints]);

  return (
    <div className="BankSidebar bg-gray-100 border-l border-gray-400 p-4 w-64">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold">Bank</div>
        <div className="text-2xl font-bold">
          Class Total: {totalBankedPoints}
          {classRanking.length > 0 && (
            <div className="text-sm mt-1">
              {classRanking.map(({ className, total, rank }) => (
                <div key={className} className="flex items-center gap-2">
                  <span>{TROPHY_EMOJIS[rank as keyof typeof TROPHY_EMOJIS]}</span>
                  <span>{className}: {total} points</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Sort By:</div>
          <select 
            className="p-2 rounded border border-gray-300"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold mb-2">Banked Points by Student:</div>
          <div className="space-y-2">
            {sortedStudents.map(student => (
              <div key={student.id} className="flex justify-between items-center">
                <span className="text-sm">{student.name}</span>
                <span className="font-semibold">{student.bankedPoints}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 