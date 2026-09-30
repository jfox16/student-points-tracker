import { memo, useState } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";

import { useTabContext } from "../../context/TabContext";
import { CLASSROOM_LAYOUT_VERSION } from "../../types/classroomLayout.type";
import {
  CLASSROOM_LABEL_MIN_HEIGHT,
  CLASSROOM_LABEL_MIN_WIDTH,
  clampClassroomLabelPosition,
  getClassroomLabelSize,
  getClassroomLabelTextSize,
  getClassroomLabels,
  getClassroomMapSize,
} from "../../utils/classroomLayout";
import { LabelNode } from "./classroomMapStore";

export const ClassroomLabelNode = memo(({
  id,
  data,
  height,
  selected,
  width,
}: NodeProps<LabelNode>) => {
  const { activeTab, updateActiveTab } = useTabContext();
  const [hovered, setHovered] = useState(false);
  const [resizing, setResizing] = useState(false);
  const canEdit = !data.preview;
  const mapSize = getClassroomMapSize(activeTab.classroomLayout);
  const textSize = getClassroomLabelTextSize({ width, height });

  const className = [
    "ClassroomLabel",
    data.preview ? "ClassroomLabel--preview" : "",
    canEdit ? "" : "ClassroomLabel--locked",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {canEdit && (
        <NodeResizer
          isVisible={Boolean(selected) || hovered || resizing}
          minWidth={CLASSROOM_LABEL_MIN_WIDTH}
          minHeight={CLASSROOM_LABEL_MIN_HEIGHT}
          color="#64748b"
          onResizeStart={() => setResizing(true)}
          onResizeEnd={(_event, params) => {
            setResizing(false);
            const size = getClassroomLabelSize(params);
            const position = clampClassroomLabelPosition(
              params.x,
              params.y,
              mapSize,
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
            params.x + params.width <= mapSize.width &&
            params.y + params.height <= mapSize.height
          }
        />
      )}
      <div className={`ClassroomLabel__text ClassroomLabel__text--${textSize}`}>
        {data.text}
      </div>
    </div>
  );
});

ClassroomLabelNode.displayName = "ClassroomLabel";
