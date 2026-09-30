import { useMemo, useRef } from "react";
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

  const animationKey = `${animationTrigger}-${animationDirection}`;
  const previousAnimationKey = useRef<string | null>(null);
  const hasPointChange = useRef(false);

  if (previousAnimationKey.current !== animationKey) {
    hasPointChange.current = previousAnimationKey.current !== null;
    previousAnimationKey.current = animationKey;
  }

  return (
    <div
      className={cnsMerge(
        "relative flex-2 h-full",
        hasPointChange.current
          ? animationDirection === "down"
            ? "animate-[pop-down_0.08s_ease-out]"
            : "animate-[pop_0.08s_ease-out]"
          : undefined,
        className,
      )}
      key={animationKey}
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
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative">
          {readOnly ? (
            <div
              className={cnsMerge(
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
                "h-full",
                points < 0 && colored && "text-red-500"
              )}
              value={points}
              onChange={onChange}
              inputProps={{
                style: {
                  color: dynamicTextColor,
                  fontSize: "1.5em",
                  width: `${Math.max(String(points).length, 1)}ch`,
                },
              }}
            />
          )}
          {recentChangeString && (
            <span
              aria-hidden="true"
              className="PointsDisplay__delta pointer-events-none absolute left-full top-1/2 -translate-y-1/2 whitespace-nowrap font-semibold leading-none text-gray-700"
              style={{ marginLeft: "0.15em", fontSize: "1.15em" }}
            >
              {recentChangeString}
            </span>
          )}
        </div>
      </div>
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