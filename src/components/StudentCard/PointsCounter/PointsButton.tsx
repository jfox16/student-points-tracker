import { cnsMerge } from "../../../utils/cnsMerge";

interface PointsButtonProps {
  onClick: () => void;
  symbol: "+" | "-";
  disabled?: boolean;
  className?: string;
}

export const PointsButton = ({ 
  onClick, 
  symbol, 
  disabled,
  className 
}: PointsButtonProps) => {
  return (
    <div
      className={cnsMerge(
        "flex items-center justify-center",
        "cursor-pointer p-[0.2em] flex-1",
        "text-gray-400 hover:text-gray-600",
        "hover:bg-[#e0e0e0] select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
    >
      <span className="pointer-events-none">{symbol}</span>
    </div>
  );
}; 