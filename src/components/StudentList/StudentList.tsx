
import { useCallback } from "react";

import { useStudentsContext } from "../../context/StudentsContext";
import { useTabContext } from "../../context/TabContext";

import { AddStudentButton } from "./AddStudentButton/AddStudentButton";
import { HoverInput } from "../HoverInput/HoverInput";
import { StudentCard } from "../StudentCard/StudentCard";

import './StudentList.css';

export const StudentList = () => {

  const { updateTab } = useTabContext();
  const { activeTab, students, } = useStudentsContext();

  const onTitleInputChange = useCallback((name: string) => {
    updateTab(activeTab?.id, { name });
  }, [
    activeTab?.id,
    updateTab,
  ]);

  return (
    <div className="StudentList">
      <HoverInput
        className="title"
        onChange={onTitleInputChange}
        value={activeTab.name}
        placeholder="Type class name here..."
      />
      <div className="students">
        {students.map(student => {
          return <StudentCard student={student} key={student.id}/>
        })}
        <AddStudentButton />
      </div>
    </div>
  )
}
