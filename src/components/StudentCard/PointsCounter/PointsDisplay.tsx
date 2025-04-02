import { useMemo } from "react";
import { cnsMerge } from "../../../utils/cnsMerge";
import { getGradientColor } from "../../../utils/getGradientColor";

interface PointsDisplayProps {
  points: number;
  recentChange?: number;
  animationTrigger: number;
  onInputChange?: (points: number) => void;
}

export const PointsDisplay = ({ points, recentChange, animationTrigger, onInputChange }: PointsDisplayProps) => {
  const gradientColor = useMemo(() => {
    return getGradientColor(
      points,
      -10, // min
      10,  // max
      [
        [239, 68, 68],  // red-500 for negative
        [107, 114, 128], // gray-500 for near zero
        [34, 197, 94],  // green-500 for positive
        [234, 179, 8]   // yellow-500 for high positive
      ]
    );
  }, [points]);

  const recentChangeString = useMemo(() => {
    if (!recentChange) return "";
    const sign = recentChange < 0 ? "" : "+";
    return `${sign}${recentChange}`;
  }, [recentChange]);

  return (
    <div key={animationTrigger} className="relative flex-2 h-full pop">
      <div className="absolute inset-0 top-[-0.5em] flex justify-center pointer-events-none text-xs text-gray-400">
        {recentChangeString}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <input
          type="number"
          value={points}
          onChange={(e) => onInputChange?.(Number(e.target.value))}
          className="text-lg font-bold bg-transparent border-none focus:outline-none text-center w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ 
            color: gradientColor,
            backgroundColor: 'rgba(229, 231, 235, 0)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(229, 231, 235, 0)'}
        />
      </div>
    </div>
  );
}; 