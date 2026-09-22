import { useMemo } from "react";
import { cnsMerge } from "../../../utils/cnsMerge";
import { getGradientColor } from '../../../utils/getGradientColor';
import { NumberInput } from '../../NumberInput/NumberInput';

interface PointsDisplayProps {
  className?: string;
  points: number;
  recentChange?: number;
  onChange?: (points: number) => void;
  animationTrigger: number;
  animationDirection?: "up" | "down";
  readOnly?: boolean;
  colored?: boolean;
}

export const PointsDisplay = ({
  className,
  points,
  recentChange,
  onChange,
  animationTrigger,
  animationDirection = "up",
  readOnly = false,
  colored = true,
}: PointsDisplayProps) => {
  const dynamicTextColor = useMemo(() => {
    if (!colored) return undefined;
    return getDynamicColor(points);
  }, [colored, points]);

  const recentChangeString = useMemo(() => {
    if (!recentChange) return "";
    const sign = recentChange < 0 ? "" : "+";
    return `${sign}${recentChange}`;
  }, [recentChange]);

  return (
    <div
      className={cnsMerge(
        "relative flex-2 h-full",
        animationDirection === "down"
          ? "animate-[pop-down_0.08s_ease-out]"
          : "animate-[pop_0.08s_ease-out]",
        className,
      )}
      key={`${animationTrigger}-${animationDirection}`}
    >
      <style>
        {`
          @keyframes pop {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.4) translateY(-2px); }
            100% { transform: scale(1) translateY(0); }
          }
          @keyframes pop-down {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(calc(1 / 1.4)) translateY(2px); }
            100% { transform: scale(1) translateY(0); }
          }
        `}
      </style>
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
      {readOnly ? (
        <div
          className={cnsMerge(
            "h-full w-full",
            points < 0 && colored && "text-red-500",
          )}
          style={{
            color: dynamicTextColor,
            fontSize: "1.5em",
            lineHeight: 1.1,
          }}
        >
          {points}
        </div>
      ) : (
        <NumberInput
          className={cnsMerge(
            "h-full w-full",
            points < 0 && colored && "text-red-500"
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
      )}
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