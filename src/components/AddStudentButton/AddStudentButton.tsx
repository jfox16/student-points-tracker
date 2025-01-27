import { useTabContext } from "../../context/TabContext"

import './AddStudentButton.css';

export const AddStudentButton = () => {
  const { addStudent } = useTabContext();

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
