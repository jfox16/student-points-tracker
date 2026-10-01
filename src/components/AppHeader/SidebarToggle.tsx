import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ReactNode } from "react";
import { Tooltip } from "@mui/material";

import "./SidebarToggle.css";

interface SidebarToggleProps {
  edge: "start" | "end";
  icon: ReactNode;
  label: string;
  open: boolean;
  onClick: () => void;
}

export const SidebarToggle = ({
  edge,
  icon,
  label,
  open,
  onClick,
}: SidebarToggleProps) => {
  const pointsTowardSidebar = open;
  const pointsLeft = edge === "start" ? pointsTowardSidebar : !pointsTowardSidebar;
  const Chevron = pointsLeft ? ChevronLeftIcon : ChevronRightIcon;
  const action = open ? "Hide" : "Show";

  return (
    <Tooltip
      title={`${action} ${label}`}
      placement={edge === "start" ? "right" : "left"}
      enterDelay={400}
    >
      <button
        aria-expanded={open}
        aria-label={`${action} ${label}`}
        className="SidebarToggle"
        onClick={onClick}
        type="button"
      >
        {edge === "start" && (
          <Chevron className="SidebarToggle__chevron" sx={{ fontSize: 14 }} />
        )}
        <span className="SidebarToggle__icon">{icon}</span>
        {edge === "end" && (
          <Chevron className="SidebarToggle__chevron" sx={{ fontSize: 14 }} />
        )}
      </button>
    </Tooltip>
  );
};
