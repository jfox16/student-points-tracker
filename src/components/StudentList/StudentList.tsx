
import { useMemo } from "react";

import { useStudentsContext } from "../../context/StudentsContext";
import { useTabContext } from "../../context/TabContext";

import { StudentCard } from "../StudentCard/StudentCard";
import { AddStudentButton } from "./AddStudentButton/AddStudentButton";

import './StudentList.css';

export const StudentList = () => {

  const { activeTab: { tabOptions } } = useTabContext();
  const { students, } = useStudentsContext();

  const fontSize = useMemo(() => getDynamicFontSize(tabOptions?.columns), [
    tabOptions?.columns,
  ]);

  return (
    <div className="StudentList" style={{
      fontSize
    }}>
      <div
        className="students"
        style={{
          gridTemplateColumns: `repeat(${Math.min(16, Math.max(1, (tabOptions?.columns ?? 8)))}, minmax(50px, 1fr))`
        }}
      >
        {students.map((student, i) => {
          return <StudentCard
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
