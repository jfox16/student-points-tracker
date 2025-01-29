import { useCallback } from "react";
import { useTabContext } from "../../../context/TabContext";

import './AddTabButton.css';

export const AddTabButton = () => {
  const { addTab } = useTabContext();

  const onClick = useCallback(() => {
    addTab();
  }, [
    addTab,
  ])

  return (
    <button
      className="AddTabButton"
      onClick={onClick}
    >
      <div>+</div>
    </button>
  );
}
