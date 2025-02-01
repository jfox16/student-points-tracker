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
        'bg-gray-300 opacity-50 px-3 rounded-xl cursor-pointer',
        'hover:opacity-100'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
