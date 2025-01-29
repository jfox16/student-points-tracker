import { useStudentsContext } from "../../context/StudentsContext";
import { AddStudentButton } from "./AddStudentButton/AddStudentButton";
import { StudentCard } from "../StudentCard/StudentCard";

import './StudentList.css';

export const StudentList = () => {
  const { students } = useStudentsContext();

  return (
    <div>
      <div className="StudentList">
        {students.map(student => {
          return <StudentCard student={student} key={student.id}/>
        })}
        <AddStudentButton />
      </div>
    </div>
  )
}
