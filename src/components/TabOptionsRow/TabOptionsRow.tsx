import { useCallback, useRef, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";
import {
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';

import { useTabContext } from "../../context/TabContext"
import { TabOptions, TabViewMode } from "../../types/tabOptions.type";
import { cnsMerge } from "../../utils/cnsMerge";
import {
  CLASSROOM_DESK_DRAG_TYPE,
  CLASSROOM_LABEL_DRAG_TYPE,
  getPlacedClassroomDesks,
} from "../../utils/classroomLayout";

import { NumberInput } from "../NumberInput/NumberInput";
import { GroupSelectWidget } from "./Widgets/GroupSelectWidget/GroupSelectWidget";
import { EnableKeybindsToggle } from "./Widgets/EnableKeybindsToggle";
import { PointSoundWidget } from "./Widgets/PointSoundWidget";
import { ResetAllWidget } from "./Widgets/ResetAllWidget";
import { SelectAllWidget } from "./Widgets/SelectAllWidget";
import { ReverseWidget } from "./Widgets/ReverseWidget";
import { DepositPointsWidget } from "./Widgets/DepositPointsWidget/DepositPointsWidget";

type MapMode = "class" | "edit";

const MapModeLabel = ({ mode }: { mode: MapMode }) => (
  <span className="flex items-center gap-2">
    {mode === "edit" ? (
      <EditIcon aria-hidden="true" fontSize="small" />
    ) : (
      <SchoolIcon aria-hidden="true" fontSize="small" />
    )}
    {mode === "edit" ? "Edit Mode" : "Class Mode"}
  </span>
);

export const TabOptionsRow = () => {
  const { activeTab, updateTab } = useTabContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  
  const updateTabOptions = useCallback((changes: Partial<TabOptions>) => {
    updateTab(activeTab.id, {
      tabOptions: { ...activeTab.tabOptions, ...changes }
    })
  }, [
    activeTab.id,
    activeTab.tabOptions,
    updateTab,
  ]);

  const onColumnsChange = useCallback((columns: number) => {
    updateTabOptions({
      columns
    });
  }, [
    updateTabOptions,
  ]);

  const onViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, viewMode: TabViewMode | null) => {
      if (viewMode) updateTabOptions({ viewMode });
    },
    [updateTabOptions],
  );

  const onMapModeChange = useCallback(
    (event: SelectChangeEvent<MapMode>) => {
      updateTabOptions({ mapEditMode: event.target.value === "edit" });
    },
    [updateTabOptions],
  );

  const handleDeskDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData(CLASSROOM_DESK_DRAG_TYPE, "new-desk");
      event.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  const handleLabelDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData(CLASSROOM_LABEL_DRAG_TYPE, "new-label");
      event.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (isHoveredRef.current) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const showOnHover = cnsMerge('opacity-70', 'hover:opacity-100')
  const isMapMode = (activeTab.tabOptions?.viewMode ?? "list") === "map";
  const mapEditMode = activeTab.tabOptions?.mapEditMode ?? false;
  const placedDesks = getPlacedClassroomDesks(
    activeTab.students,
    activeTab.classroomLayout,
  );
  const unplacedStudentCount = activeTab.students.length - placedDesks.length;

  return (
    <div 
      ref={scrollContainerRef}
      className="overflow-x-auto"
    >
      <div
        className={cnsMerge(
          "TabOptionsRow",
          "flex items-center h-14 px-4 pt-1 gap-4",
          "bg-gray-200",
          "min-w-max",
          "relative",
        )}
      >
        <Tooltip title="Switch between the student list and classroom map" enterDelay={1000}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={activeTab.tabOptions?.viewMode ?? "list"}
            onChange={onViewModeChange}
          >
            <ToggleButton value="list">List</ToggleButton>
            <ToggleButton value="map">Map</ToggleButton>
          </ToggleButtonGroup>
        </Tooltip>

        {/* Columns Input */}
        {!isMapMode && (
          <Tooltip title="Number of columns in the student grid" enterDelay={1000}>
            <div className={cnsMerge('flex items-center', showOnHover)}>
              <div className="flex-none">Columns:</div>
              <NumberInput
                className="w-6"
                value={activeTab.tabOptions?.columns ?? 1}
                onChange={onColumnsChange}
              />
            </div>
          </Tooltip>
        )}

        {isMapMode && (
          <>
            <Select<MapMode>
              aria-label="Map mode"
              onChange={onMapModeChange}
              size="small"
              sx={{
                height: 40,
                minWidth: 168,
                backgroundColor: "#fff",
                ".MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
              value={mapEditMode ? "edit" : "class"}
            >
              <MenuItem value="class">
                <MapModeLabel mode="class" />
              </MenuItem>
              <MenuItem value="edit">
                <MapModeLabel mode="edit" />
              </MenuItem>
            </Select>

            {mapEditMode && (
              <>
              <Tooltip
                title={
                  unplacedStudentCount > 0
                    ? "Drag onto the map to place the next student"
                    : "Every student already has a desk"
                }
              >
                <div
                  aria-disabled={unplacedStudentCount === 0}
                  aria-label="New desk"
                  className={cnsMerge(
                    "flex items-center gap-2 rounded border border-gray-400 bg-gray-100 px-3 py-1",
                    unplacedStudentCount > 0
                      ? "cursor-grab hover:bg-white"
                      : "cursor-not-allowed opacity-40",
                  )}
                  draggable={unplacedStudentCount > 0}
                  onDragStart={handleDeskDragStart}
                >
                  <div className="relative h-7 w-9" aria-hidden="true">
                    <div className="absolute left-0 top-0 h-4 w-9 rounded border-2 border-gray-500 bg-gray-300" />
                    <div className="absolute bottom-0 left-3 h-4 w-3 rounded-b-lg border-2 border-gray-400 bg-gray-200" />
                  </div>
                  <span>Desk ({unplacedStudentCount})</span>
                </div>
              </Tooltip>
              <Tooltip title="Drag onto the map to add a rectangle">
                <div
                  aria-label="New rectangle"
                  className="flex cursor-grab items-center gap-2 rounded border border-gray-400 bg-white px-3 py-1 hover:bg-gray-50"
                  draggable
                  onDragStart={handleLabelDragStart}
                >
                  <div
                    aria-hidden="true"
                    className="h-6 w-10 rounded-sm border-2 border-gray-500 bg-white"
                  />
                  <span>Rectangle</span>
                </div>
              </Tooltip>
              </>
            )}
          </>
        )}

        {!isMapMode && (
          <>
            <GroupSelectWidget
              className={showOnHover}
            />

            <div className={showOnHover}>
              <SelectAllWidget />
            </div>

            <div className={showOnHover}>
              <ResetAllWidget />
            </div>

            <div className={showOnHover}>
              <DepositPointsWidget />
            </div>

            <Tooltip title="Enable keyboard shortcuts for point management" enterDelay={1000}>
              <div className={showOnHover}>
                <EnableKeybindsToggle />
              </div>
            </Tooltip>
            
            <Tooltip title="Reverse the order of students in the list" enterDelay={1000}>
              <div className={showOnHover}>
                <ReverseWidget />
              </div>
            </Tooltip>
          </>
        )}

        <Tooltip title="Select a sound to play when points are added" enterDelay={1000}>
          <div className={showOnHover}>
            <PointSoundWidget />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
