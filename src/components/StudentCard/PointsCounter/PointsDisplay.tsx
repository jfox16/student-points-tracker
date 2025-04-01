import { useMemo } from "react";
import { cnsMerge } from "../../../utils/cnsMerge";

interface PointsDisplayProps {
  points: number;
  recentChange?: number;
  animationTrigger: number;
}

export const PointsDisplay = ({ points, recentChange, animationTrigger }: PointsDisplayProps) => {
  const textColor = useMemo(() => {
    if (points > 0) return "text-green-500";
    if (points < 0) return "text-red-500";
    return "text-gray-500";
  }, [points]);

  const recentChangeString = useMemo(() => {
    if (!recentChange) return "";
    const sign = recentChange < 0 ? "" : "+";
    return `${sign}${recentChange}`;
  }, [recentChange]);

  return (
    <div className={cnsMerge("relative flex-2 bounce h-full")} key={animationTrigger}>
      <div className="absolute inset-0 top-[-0.5em] flex justify-center pointer-events-none text-xs text-gray-400">
        {recentChangeString}
      </div>
      <div className={cnsMerge("absolute inset-0 flex items-center justify-center", textColor)}>
        <span className="text-lg font-bold">{points}</span>
      </div>
    </div>
  );
}; 