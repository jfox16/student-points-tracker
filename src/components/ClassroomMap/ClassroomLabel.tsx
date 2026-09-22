import { memo } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";

import { useTabContext } from "../../context/TabContext";
import { CLASSROOM_LAYOUT_VERSION } from "../../types/classroomLayout.type";
import {
  CLASSROOM_BOUNDS,
  CLASSROOM_LABEL_MIN_HEIGHT,
  CLASSROOM_LABEL_MIN_WIDTH,
  CLASSROOM_MAP_HEIGHT,
  CLASSROOM_MAP_WIDTH,
  clampClassroomLabelPosition,
  getClassroomLabelSize,
  getClassroomLabels,
} from "../../utils/classroomLayout";
import { LabelNode } from "./classroomMapStore";

export const ClassroomLabelNode = memo(({
  id,
  data,
}: NodeProps<LabelNode>) => {
  const { activeTab, updateActiveTab } = useTabContext();
  const canEdit = (activeTab.tabOptions?.mapEditMode ?? false) && !data.preview;

  const className = [
    "ClassroomLabel",
    data.preview ? "ClassroomLabel--preview" : "",
    canEdit ? "" : "ClassroomLabel--locked",
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {canEdit && (
        <NodeResizer
          minWidth={CLASSROOM_LABEL_MIN_WIDTH}
          minHeight={CLASSROOM_LABEL_MIN_HEIGHT}
          color="#64748b"
          onResizeEnd={(_event, params) => {
            const size = getClassroomLabelSize(params);
            const position = clampClassroomLabelPosition(
              params.x,
              params.y,
              CLASSROOM_BOUNDS,
              size,
            );
            const labels = getClassroomLabels(activeTab.classroomLayout);
            updateActiveTab({
              classroomLayout: {
                ...activeTab.classroomLayout,
                version: CLASSROOM_LAYOUT_VERSION,
                desks: activeTab.classroomLayout?.desks ?? [],
                labels: labels.map((label) =>
                  label.id === id
                    ? { ...label, ...position, ...size }
                    : label,
                ),
              },
            });
          }}
          shouldResize={(_event, params) =>
            params.x >= 0 &&
            params.y >= 0 &&
            params.x + params.width <= CLASSROOM_MAP_WIDTH &&
            params.y + params.height <= CLASSROOM_MAP_HEIGHT
          }
        />
      )}
      <div className="ClassroomLabel__text">{data.text}</div>
    </div>
  );
});

ClassroomLabelNode.displayName = "ClassroomLabel";
