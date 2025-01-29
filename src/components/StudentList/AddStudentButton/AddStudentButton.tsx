import { useStudentsContext } from "../../../context/StudentsContext";

import './AddStudentButton.css';

export const AddStudentButton = () => {
  const { addStudent } = useStudentsContext();

  const onClick = () => {
    addStudent();
  }

  return (
    <button
      className="AddStudentButton"
      onClick={onClick}
    >
      <div>+</div>
    </button>
  )
}
