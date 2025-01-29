
import { useCallback } from "react";

import { useStudentsContext } from "../../context/StudentsContext";
import { useTabContext } from "../../context/TabContext";

import { AddStudentButton } from "./AddStudentButton/AddStudentButton";
import { HoverInput } from "../HoverInput/HoverInput";
import { StudentCard } from "../StudentCard/StudentCard";

import './StudentList.css';

export const StudentList = () => {

  const { activeTab, updateTab } = useTabContext();
  const { students, } = useStudentsContext();

  const onTitleInputChange = useCallback((name: string) => {
    updateTab(activeTab.id, { name });
  }, [
    updateTab,
  ]);

  return (
    <div className="StudentList">
      {activeTab.name && (
        <HoverInput
          className="title"
          onChange={onTitleInputChange}
          value={activeTab.name}
        />
      )}
      <div className="students">
        {students.map(student => {
          return <StudentCard student={student} key={student.id}/>
        })}
        <AddStudentButton />
      </div>
    </div>
  )
}
