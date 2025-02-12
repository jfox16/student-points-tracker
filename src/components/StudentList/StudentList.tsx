
import { useMemo } from "react";

import { useStudentContext } from "../../context/StudentContext";
import { useTabContext } from "../../context/TabContext";

import { StudentCard } from "../StudentCard/StudentCard";
import { AddStudentButton } from "./AddStudentButton/AddStudentButton";

import './StudentList.css';
import { cnsMerge } from "../../utils/cnsMerge";
import { useAppContext } from "../../context/AppContext";
import { reverse } from "dns";

export const StudentList = () => {

  const { appOptions: { reverseOrder }} = useAppContext();
  const { activeTab: { tabOptions } } = useTabContext();
  const { students, } = useStudentContext();

  const fontSize = useMemo(() => getDynamicFontSize(tabOptions?.columns), [
    tabOptions?.columns,
  ]);

  return (
    <div className="StudentList" style={{
      fontSize
    }}>
      <div
        className={cnsMerge('students', reverseOrder && 'rotate-180' )}
        style={{
          gridTemplateColumns: `repeat(${Math.min(16, Math.max(1, (tabOptions?.columns ?? 1)))}, minmax(50px, 1fr))`
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
