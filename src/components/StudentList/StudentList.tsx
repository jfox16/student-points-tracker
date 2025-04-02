import { useMemo } from "react";

import { StudentCard } from "../StudentCard/StudentCard";
import { AddStudentButton } from "./AddStudentButton/AddStudentButton";

import './StudentList.css';
import { cnsMerge } from "../../utils/cnsMerge";
import { useAppOptionsStore } from "../../stores/useAppOptionsStore";
import { useTabStore } from "../../stores/useTabStore";
import { useStudentStore } from "../../stores/useStudentStore";

export const StudentList = () => {
  const { appOptions: { reverseOrder }} = useAppOptionsStore();
  const { activeTab } = useTabStore();
  const { students } = useStudentStore();

  const fontSize = useMemo(() => getDynamicFontSize(activeTab.tabOptions?.columns ?? 1), [
    activeTab.tabOptions?.columns,
  ]);

  return (
    <div className="StudentList" style={{
      fontSize
    }}>
      <div
        className={cnsMerge('students', reverseOrder && 'rotate-180' )}
        style={{
          gridTemplateColumns: `repeat(${Math.min(16, Math.max(1, (activeTab.tabOptions?.columns ?? 1)))}, minmax(50px, 1fr))`
        }}
      >
        {students.map((student, i) => {
          return <StudentCard
            className={cnsMerge(reverseOrder && 'rotate-180')}
            student={student}
            index={i}
            key={student.id}
          />
        })}
          <AddStudentButton />
      </div>
    </div>
  )
}

const getDynamicFontSize = (columns: number = 0) => {
  const minColumns = 6;
  const maxColumns = 12;
  const minFontSize = 12;
  const maxFontSize = 18;

  if (columns <= minColumns) return `${maxFontSize}px`;
  if (columns >= maxColumns) return `${minFontSize}px`;

  const calculatedSize =
    maxFontSize -
    ((columns - minColumns) / (maxColumns - minColumns)) *
      (maxFontSize - minFontSize);

  return `${calculatedSize}px`;
}
