import { useMemo } from "react";
import { cnsMerge } from "../../../utils/cnsMerge";
import { getGradientColor } from '../../../utils/getGradientColor';
import { NumberInput } from '../../NumberInput/NumberInput';

interface PointsDisplayProps {
  points: number;
  recentChange?: number;
  onChange: (points: number) => void;
  animationTrigger: number;
}

export const PointsDisplay = ({ 
  points, 
  recentChange, 
  onChange, 
  animationTrigger 
}: PointsDisplayProps) => {
  const dynamicTextColor = useMemo(() => {
    return getDynamicColor(points);
  }, [points]);

  const recentChangeString = useMemo(() => {
    if (!recentChange) return "";
    const sign = recentChange < 0 ? "" : "+";
    return `${sign}${recentChange}`;
  }, [recentChange]);

  return (
    <div 
      className={cnsMerge(
        "relative flex-2 h-full",
        "animate-[pop_0.08s_ease-out]"
      )} 
      key={animationTrigger}
    >
      <div
        className={cnsMerge(
          "absolute inset-0 top-[-0.5em]",
          "flex justify-center",
          "pointer-events-none",
          "font-xs text-gray-400"
        )}
      >
        {recentChangeString}
      </div>
      <NumberInput
        className={cnsMerge(
          "h-full w-full",
          points < 0 && "text-red-500"
        )}
        value={points}
        onChange={onChange}
        inputProps={{
          style: {
            color: dynamicTextColor,
            fontSize: "1.5em",
          },
        }}
      />
    </div>
  );
};

const getDynamicColor = (points: number) => {
  return getGradientColor(points, 0, 100, [
    [0, 0, 0], // Black
    [0, 160, 0], // Green
    [0, 120, 220], // Blue
    [180, 0, 220], // Purple
    [200, 160, 0], // Gold
  ]);
}; 