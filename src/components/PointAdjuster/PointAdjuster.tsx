import { Tooltip } from "@mui/material";
import { useState } from "react";

import { cnsMerge } from "../../utils/cnsMerge";
import { PointsDisplay } from "../StudentCard/PointsCounter/PointsDisplay";

import "./PointAdjuster.css";

export type PointAdjusterVariant = "stretch" | "square" | "bare";

interface PointAdjusterProps {
  onIncrement: () => void;
  onDecrement: () => void;
  incrementLabel: string;
  decrementLabel: string;
  points?: number;
  onPointsChange?: (points: number) => void;
  readOnly?: boolean;
  showValue?: boolean;
  recentChange?: number;
  animationTrigger?: number;
  animationDirection?: "up" | "down";
  variant?: PointAdjusterVariant;
  className?: string;
  buttonClassName?: string;
  valueClassName?: string;
  incrementTitle?: string;
  decrementTitle?: string;
  isolatePointerEvents?: boolean;
}

export const PointAdjuster = ({
  onIncrement,
  onDecrement,
  incrementLabel,
  decrementLabel,
  points = 0,
  onPointsChange,
  readOnly = false,
  showValue = true,
  recentChange,
  animationTrigger,
  animationDirection = "up",
  variant = "stretch",
  className,
  buttonClassName,
  valueClassName,
  incrementTitle,
  decrementTitle,
  isolatePointerEvents = false,
}: PointAdjusterProps) => {
  const [manualAnimation, setManualAnimation] = useState<{
    trigger: number;
    direction: "up" | "down";
  }>({ trigger: 0, direction: "up" });
  const animationControlled = animationTrigger !== undefined;

  const playManualAnimation = (direction: "up" | "down") => {
    if (animationControlled) return;
    setManualAnimation((current) => ({
      trigger: current.trigger + 1,
      direction,
    }));
  };

  const stopPointerEvent = (event: { stopPropagation: () => void }) => {
    if (isolatePointerEvents) event.stopPropagation();
  };

  return (
    <div
      className={cnsMerge("PointAdjuster", `PointAdjuster--${variant}`, className)}
      onClick={stopPointerEvent}
      onPointerDown={stopPointerEvent}
    >
      <AdjusterButton
        className={buttonClassName}
        label={decrementLabel}
        onClick={() => {
          playManualAnimation("down");
          onDecrement();
        }}
        onPointerDown={stopPointerEvent}
        symbol="−"
        title={decrementTitle}
      />
      {showValue && (
        <PointsDisplay
          animationDirection={
            animationControlled ? animationDirection : manualAnimation.direction
          }
          animationTrigger={
            animationControlled ? animationTrigger : manualAnimation.trigger
          }
          className={cnsMerge(
            variant === "square" && "h-auto flex-none",
            valueClassName,
          )}
          colored={false}
          onChange={readOnly ? undefined : onPointsChange}
          points={points}
          readOnly={readOnly || !onPointsChange}
          recentChange={recentChange}
        />
      )}
      <AdjusterButton
        className={buttonClassName}
        label={incrementLabel}
        onClick={() => {
          playManualAnimation("up");
          onIncrement();
        }}
        onPointerDown={stopPointerEvent}
        symbol="+"
        title={incrementTitle}
      />
    </div>
  );
};

const AdjusterButton = ({
  className,
  label,
  onClick,
  onPointerDown,
  symbol,
  title,
}: {
  className?: string;
  label: string;
  onClick: () => void;
  onPointerDown: (event: { stopPropagation: () => void }) => void;
  symbol: string;
  title?: string;
}) => {
  const button = (
    <button
      aria-label={label}
      className={cnsMerge("PointAdjuster__button", className)}
      onClick={(event) => {
        onPointerDown(event);
        onClick();
      }}
      onPointerDown={onPointerDown}
      type="button"
    >
      {symbol}
    </button>
  );

  if (!title) return button;

  return (
    <Tooltip enterDelay={500} title={title}>
      {button}
    </Tooltip>
  );
};
