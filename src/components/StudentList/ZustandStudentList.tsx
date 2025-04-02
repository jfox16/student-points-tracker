import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { useTabStore } from "../../stores/useTabStore";
import { useStudentStore } from "../../stores/useStudentStore";
import { ZustandStudentCard } from "../StudentCard/ZustandStudentCard";
import { AddStudentButton } from "./AddStudentButton/AddStudentButton";
import './StudentList.css';
import { cnsMerge } from "../../utils/cnsMerge";

export const ZustandStudentList = () => {
  const { appOptions: { reverseOrder }} = useAppContext();
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
          return <ZustandStudentCard
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