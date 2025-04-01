import { useCallback } from "react";
import { cnsMerge } from "../../../utils/cnsMerge";

interface PointsButtonProps {
  symbol: "+" | "-";
  onClick: () => void;
  disabled?: boolean;
}

export const PointsButton = ({ symbol, onClick, disabled = false }: PointsButtonProps) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  return (
    <div
      className={cnsMerge(
        "flex-1 flex items-center justify-center cursor-pointer select-none p-1",
        "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      <span className="text-lg font-bold">{symbol}</span>
    </div>
  );
}; 