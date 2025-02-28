import React from "react"
import { cnsMerge } from "../../utils/cnsMerge";

interface PillButtonProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const PillButton = (props: PillButtonProps) => {
  const {
    className,
    children,
    onClick,
  } = props;

  return (
    <button
      className={cnsMerge(
        className,
        'relative bg-gray-300 px-3 rounded-xl cursor-pointer',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
