
import { useStudentsContext } from "../../context/StudentsContext";
import { useTabContext } from "../../context/TabContext";

import { StudentCard } from "../StudentCard/StudentCard";
import { AddStudentButton } from "./AddStudentButton/AddStudentButton";

import './StudentList.css';

export const StudentList = () => {

  const { activeTab: { tabOptions } } = useTabContext();
  const { students, } = useStudentsContext();

  return (
    <div className="StudentList" style={{
      fontSize: tabOptions?.fontSize
    }}>
      <div
        className="students"
        style={{
          gridTemplateColumns: `repeat(${Math.min(16, Math.max(1, (tabOptions?.columns ?? 8)))}, minmax(50px, 1fr))`
        }}
      >
        {students.map(student => {
          return <StudentCard student={student} key={student.id}/>
        })}
        <AddStudentButton />
      </div>
    </div>
  )
}
