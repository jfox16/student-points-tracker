import { useStudentContext } from "../../../context/StudentContext";

import './AddStudentButton.css';

export const AddStudentButton = () => {
  const { addStudent } = useStudentContext();

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
