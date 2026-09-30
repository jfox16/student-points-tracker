import {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Controls,
  OnNodeDrag,
  OnSelectionChangeFunc,
  NodeProps,
  NodeTypes,
  Panel,
  ReactFlow,
  SelectionMode,
  ViewportPortal,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useAppContext } from "../../context/AppContext";
import { useModal } from "../../context/ModalContext";
import { useStudentContext } from "../../context/StudentContext";
import { useTabContext } from "../../context/TabContext";
import { useStudentPointsAnimation } from "../../hooks/useStudentPointsAnimation";
import {
  CLASSROOM_CONTROL_GROUP_NUMBERS,
  CLASSROOM_LAYOUT_VERSION,
  ClassroomControlGroups,
  ClassroomDesk,
  ClassroomLabel,
} from "../../types/classroomLayout.type";
import { Student, StudentId } from "../../types/student.type";
import { Tab } from "../../types/tab.type";
import {
  CLASSROOM_CHAIR_DEPTH,
  CLASSROOM_CHAIR_OFFSET,
  CLASSROOM_CHAIR_WIDTH,
  CLASSROOM_DESK_FOOTPRINT_HEIGHT,
  CLASSROOM_DESK_FOOTPRINT_WIDTH,
  CLASSROOM_DESK_HEIGHT,
  CLASSROOM_DESK_DRAG_TYPE,
  CLASSROOM_DESK_WIDTH,
  CLASSROOM_GRID_SIZE,
  CLASSROOM_LABEL_DEFAULT_TEXT,
  CLASSROOM_LABEL_DRAG_TYPE,
  CLASSROOM_LABEL_HEIGHT,
  CLASSROOM_LABEL_WIDTH,
  clampClassroomLabelPosition,
  getClassroomLabelSize,
  addToClassroomControlGroup,
  removeFromClassroomControlGroup,
  toggleClassroomControlGroup,
  withDefaultControlGroupName,
  findClassroomDeskPastePositions,
  getClassroomDeskFootprint,
  getClassroomDesksBounds,
  getClosestValidClassroomDeskPositions,
  getClassroomControlGroupNumber,
  getClassroomLabels,
  getClassroomMapSize,
  getMinimumClassroomMapSize,
  getPlacedClassroomDesks,
  isClassroomDeskPlacementValid,
  isClassroomLabelPlacementValid,
  snapToClassroomGrid,
} from "../../utils/classroomLayout";
import type { ClassroomBounds } from "../../utils/classroomLayout";
import {
  copyClassroomSelection,
  getCopiedClassroomSelection,
} from "../../utils/deskClipboard";
import { generateUuid } from "../../utils/generateUuid";
import { applyDeskSelection, getDeskSelectionMode } from "../../utils/deskSelection";
import { PointAdjuster } from "../PointAdjuster/PointAdjuster";
import { PointsDisplay } from "../StudentCard/PointsCounter/PointsDisplay";
import { ClassroomLabelNode } from "./ClassroomLabel";
import { ClassroomMapFloor } from "./ClassroomMapFloor";
import {
  ClassroomMapNode,
  ClassroomMapStoreProvider,
  DeskNode,
  isDeskNode,
  LabelNode,
  useClassroomMapStore,
  useClassroomMapStoreApi,
} from "./classroomMapStore";

import "./ClassroomMap.css";

export const getDeleteSelectionMessage = (
  deskCount: number,
  rectangleCount: number,
) => {
  const count = deskCount + rectangleCount;
  const noun =
    deskCount > 0 && rectangleCount > 0
      ? "object"
      : deskCount > 0
        ? "desk"
        : "rectangle";
  return `Delete ${count} ${noun}${count === 1 ? "" : "s"}?`;
};

const classroomMapStyle = {
  "--classroom-grid-size": `${CLASSROOM_GRID_SIZE}px`,
  "--classroom-desk-width": `${CLASSROOM_DESK_WIDTH}px`,
  "--classroom-desk-height": `${CLASSROOM_DESK_HEIGHT}px`,
  "--classroom-desk-footprint-width": `${CLASSROOM_DESK_FOOTPRINT_WIDTH}px`,
  "--classroom-desk-footprint-height": `${CLASSROOM_DESK_FOOTPRINT_HEIGHT}px`,
  "--classroom-chair-width": `${CLASSROOM_CHAIR_WIDTH}px`,
  "--classroom-chair-depth": `${CLASSROOM_CHAIR_DEPTH}px`,
  "--classroom-chair-offset": `${CLASSROOM_CHAIR_OFFSET}px`,
} as CSSProperties;

const isAddPointTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(".ClassroomDesk__addPoint"));

const isTypingTarget = (target: EventTarget | null) => {
  const element = target instanceof HTMLElement ? target : document.activeElement;
  return element instanceof HTMLElement &&
    (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable);
};

const DeskNodeComponent = memo(({ data, selected }: NodeProps<DeskNode>) => {
  const selectAllDesks = useClassroomMapStore((state) => state.selectAllDesks);
  const selectWithModifier = useClassroomMapStore((state) => state.selectWithModifier);
  const spacePanActive = useClassroomMapStore((state) => state.spacePanActive);
  const { addPointsToStudent } = useStudentContext();
  const { animationDirection, animationTrigger, recentChange } = useStudentPointsAnimation(
    data.student,
  );
  const displayName = data.student.name;
  const className = [
    "ClassroomDesk",
    selected && !data.preview ? "ClassroomDesk--selected" : "",
    data.preview ? "ClassroomDesk--preview" : "",
    `ClassroomDesk--rotation-${data.rotation}`,
  ].filter(Boolean).join(" ");

  const pointsDisplay = (
    <PointsDisplay
      animationTrigger={animationTrigger}
      animationDirection={animationDirection}
      className="ClassroomDesk__pointsValue"
      colored={false}
      points={data.student.points}
      recentChange={recentChange}
      readOnly
    />
  );

  const handleMouseDown = (event: ReactMouseEvent) => {
    if (spacePanActive || data.preview || isAddPointTarget(event.target)) return;

    if (event.detail >= 2 && getDeskSelectionMode(event) === "replace") {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    const mode = getDeskSelectionMode(event);
    if (mode === "replace") return;

    event.stopPropagation();
    event.preventDefault();
    selectWithModifier(data.student.id, mode);
  };

  const handleModifierClick = (event: ReactMouseEvent) => {
    if (data.preview || isAddPointTarget(event.target)) return;
    if (event.detail < 2 && getDeskSelectionMode(event) === "replace") return;
    event.stopPropagation();
    event.preventDefault();
  };

  const handleDoubleClick = (event: ReactMouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (spacePanActive || data.preview || isAddPointTarget(event.target)) return;
    if (getDeskSelectionMode(event) !== "replace") return;
    selectAllDesks();
  };

  return (
    <div
      className={className}
      aria-hidden={data.preview || undefined}
      onClickCapture={handleModifierClick}
      onContextMenu={(event) => {
        if (event.metaKey || event.ctrlKey) event.preventDefault();
      }}
      onDoubleClickCapture={handleDoubleClick}
      onMouseDownCapture={handleMouseDown}
    >
      <div className="ClassroomDesk__body">
        <div className="ClassroomDesk__surface">
          <div className="ClassroomDesk__name">{displayName}</div>
          {data.preview ? (
            pointsDisplay
          ) : (
            <PointAdjuster
              animationDirection={animationDirection}
              animationTrigger={animationTrigger}
              className="ClassroomDesk__addPoint nodrag nopan"
              decrementLabel={`Subtract one point from ${displayName}`}
              incrementLabel={`Add one point to ${displayName}`}
              isolatePointerEvents
              onDecrement={() => addPointsToStudent(data.student.id, -1)}
              onIncrement={() => addPointsToStudent(data.student.id, 1)}
              points={data.student.points}
              readOnly
              recentChange={recentChange}
              valueClassName="ClassroomDesk__pointsValue"
            />
          )}
        </div>
        {Boolean(data.controlGroups?.length) && (
          <div
            className="ClassroomDesk__groups"
            aria-label={`Control groups ${data.controlGroups?.join(", ")}`}
          >
            {data.controlGroups?.map((groupNumber) => (
              <span
                className={`ClassroomDesk__group ClassroomDesk__group--${groupNumber}`}
                key={groupNumber}
              >
                {groupNumber}
              </span>
            ))}
          </div>
        )}
        <div className="ClassroomDesk__chair" aria-hidden="true" />
      </div>
    </div>
  );
});

DeskNodeComponent.displayName = "DeskNode";

const nodeTypes: NodeTypes = {
  desk: DeskNodeComponent,
  label: ClassroomLabelNode,
};

const createDeskNodes = (
  desks: ClassroomDesk[],
  students: Student[],
  selectedStudentIds: ReadonlySet<StudentId>,
  controlGroups: ClassroomControlGroups = {},
): DeskNode[] => {
  const studentsById = new Map(students.map((student) => [student.id, student]));

  return desks.flatMap((desk) => {
    const student = studentsById.get(desk.studentId);
    if (!student) return [];

    return [{
      id: desk.studentId,
      type: "desk",
      position: { x: desk.x, y: desk.y },
      zIndex: 1,
      selected: selectedStudentIds.has(desk.studentId),
      data: {
        student,
        rotation: desk.rotation,
        controlGroups: CLASSROOM_CONTROL_GROUP_NUMBERS.filter((groupNumber) =>
          controlGroups[groupNumber]?.includes(desk.studentId)
        ),
      },
    }];
  });
};

const createPreviewNode = (
  student: Student,
  position: { x: number; y: number },
): DeskNode => ({
  id: "desk-placement-preview",
  type: "desk",
  position,
  data: {
    student,
    rotation: 0,
    preview: true,
  },
  draggable: false,
  selectable: false,
  style: {
    opacity: 0.5,
    pointerEvents: "none",
  },
});

const createLabelNodes = (
  labels: ClassroomLabel[],
  selectable: boolean,
  selectedLabelId: string | null = null,
): LabelNode[] =>
  labels.map((label) => {
    const { width, height } = getClassroomLabelSize(label);
    return {
      id: label.id,
      type: "label",
      position: { x: label.x, y: label.y },
      width,
      height,
      selectable,
      selected: label.id === selectedLabelId,
      zIndex: 0,
      data: { text: label.text },
      style: {
        width,
        height,
      },
    };
  });

const createLabelPreviewNode = (
  position: { x: number; y: number },
): LabelNode => ({
  id: "label-placement-preview",
  type: "label",
  position,
  width: CLASSROOM_LABEL_WIDTH,
  height: CLASSROOM_LABEL_HEIGHT,
  selectable: false,
  draggable: false,
  data: { text: CLASSROOM_LABEL_DEFAULT_TEXT, preview: true },
  style: {
    width: CLASSROOM_LABEL_WIDTH,
    height: CLASSROOM_LABEL_HEIGHT,
    opacity: 0.5,
    pointerEvents: "none",
  },
});

interface ClassroomMapProps {
  onDeskSelectionChange?: (studentIds: ReadonlySet<StudentId>) => void;
  onLabelSelectionChange?: (labelId: string | null) => void;
  selectedLabelId?: string | null;
  selectedStudentIds: ReadonlySet<StudentId>;
}

interface ClassroomMapContentProps extends ClassroomMapProps {
  activeTab: Tab;
  desks: ClassroomDesk[];
  mapNodes: ClassroomMapNode[];
  updateActiveTab: (updates: Partial<Tab>) => void;
}

interface ClassroomFlowProps {
  handleNodeDrag: OnNodeDrag<ClassroomMapNode>;
  handleNodeDragStart: OnNodeDrag<ClassroomMapNode>;
  handleNodeDragStop: OnNodeDrag<ClassroomMapNode>;
  handleSelectionChange: OnSelectionChangeFunc<ClassroomMapNode>;
  mapSize: ClassroomBounds;
  minimumMapSize: ClassroomBounds;
  onMapResize: (size: ClassroomBounds) => void;
}

const ClassroomFlow = memo(({
  handleNodeDrag,
  handleNodeDragStart,
  handleNodeDragStop,
  handleSelectionChange,
  mapSize,
  minimumMapSize,
  onMapResize,
}: ClassroomFlowProps) => {
  const nodes = useClassroomMapStore((state) => state.nodes);
  const spacePanActive = useClassroomMapStore((state) => state.spacePanActive);
  const previewNode = useClassroomMapStore((state) => state.previewNode);
  const onNodesChange = useClassroomMapStore((state) => state.applyNodeChanges);
  const reactFlowInstance = useClassroomMapStore(
    (state) => state.reactFlowInstance,
  );
  const setReactFlowInstance = useClassroomMapStore(
    (state) => state.setReactFlowInstance,
  );
  const renderedNodes = useMemo(
    () => previewNode ? [...nodes, previewNode] : nodes,
    [nodes, previewNode],
  );
  const [allowSpacePan, setAllowSpacePan] = useState(true);
  const [viewportZoom, setViewportZoom] = useState(1);
  const handleViewportMove = useCallback((
    _event: MouseEvent | TouchEvent | null,
    viewport: { zoom: number },
  ) => {
    setViewportZoom((currentZoom) =>
      currentZoom === viewport.zoom ? currentZoom : viewport.zoom
    );
  }, []);

  useEffect(() => {
    const updateSpacePan = () => {
      setAllowSpacePan(!isTypingTarget(document.activeElement));
    };
    document.addEventListener("focusin", updateSpacePan);
    document.addEventListener("focusout", updateSpacePan);
    return () => {
      document.removeEventListener("focusin", updateSpacePan);
      document.removeEventListener("focusout", updateSpacePan);
    };
  }, []);

  return (
    <ReactFlow
      nodes={renderedNodes}
      edges={[]}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onSelectionChange={handleSelectionChange}
      onNodeDrag={handleNodeDrag}
      onNodeDragStart={handleNodeDragStart}
      onNodeDragStop={handleNodeDragStop}
      onInit={setReactFlowInstance}
      onMove={handleViewportMove}
      fitView={nodes.length > 0}
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.1}
      maxZoom={1.5}
      snapGrid={[CLASSROOM_GRID_SIZE, CLASSROOM_GRID_SIZE]}
      snapToGrid
      nodesDraggable={!spacePanActive}
      elementsSelectable={!spacePanActive}
      nodesConnectable={false}
      panOnDrag={[1, 2]}
      panActivationKeyCode={allowSpacePan ? "Space" : null}
      multiSelectionKeyCode={null}
      selectionKeyCode={null}
      selectionMode={SelectionMode.Partial}
      selectionOnDrag={!spacePanActive}
      nodeExtent={[
        [0, 0],
        [mapSize.width, mapSize.height],
      ]}
      deleteKeyCode={null}
    >
      <ViewportPortal>
        <ClassroomMapFloor
          editable
          minimumSize={minimumMapSize}
          onResize={onMapResize}
          size={mapSize}
          zoom={viewportZoom}
        />
      </ViewportPortal>
      <Controls showInteractive={false} />
      {nodes.length === 0 && (
        <Panel position="top-center">
          <div className="ClassroomMap__empty">
            Drag a desk or rectangle from the toolbar and drop it here.
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
});

ClassroomFlow.displayName = "ClassroomFlow";

const ClassroomMapContent = ({
  activeTab,
  desks,
  mapNodes,
  onDeskSelectionChange,
  onLabelSelectionChange,
  selectedLabelId = null,
  selectedStudentIds,
  updateActiveTab,
}: ClassroomMapContentProps) => {
  const { appOptions } = useAppContext();
  const { showModal } = useModal();
  const { addPointsToStudents } = useStudentContext();
  const controlGroups = activeTab.classroomLayout?.controlGroups ?? {};
  const reactFlowInstance = useClassroomMapStore(
    (state) => state.reactFlowInstance,
  );
  const replaceNodes = useClassroomMapStore((state) => state.replaceNodes);
  const setNodes = useClassroomMapStore((state) => state.setNodes);
  const setPreviewNode = useClassroomMapStore((state) => state.setPreviewNode);
  const beginSelectionGesture = useClassroomMapStore(
    (state) => state.beginSelectionGesture,
  );
  const endSelectionGesture = useClassroomMapStore(
    (state) => state.endSelectionGesture,
  );
  const [isSpacePanning, setIsSpacePanning] = useState(false);
  const setSpacePanActive = useClassroomMapStore((state) => state.setSpacePanActive);
  const setModifierSelectHandler = useClassroomMapStore(
    (state) => state.setModifierSelectHandler,
  );
  const setSelectAllDesksHandler = useClassroomMapStore(
    (state) => state.setSelectAllDesksHandler,
  );
  const lastValidDragPositions = useRef(
    new Map<string, { x: number; y: number }>(),
  );
  const modifierSelectRef = useRef<
    (studentId: StudentId, mode: "add" | "remove") => void
  >(() => {});
  const setDeskSelection = (nextStudentIds: ReadonlySet<StudentId>) => {
    setNodes((currentNodes) =>
      currentNodes.map((currentNode) =>
        isDeskNode(currentNode)
          ? { ...currentNode, selected: nextStudentIds.has(currentNode.id) }
          : currentNode
      )
    );
    onDeskSelectionChange?.(nextStudentIds);
  };
  modifierSelectRef.current = (studentId, mode) => {
    setDeskSelection(applyDeskSelection(
      selectedStudentIds,
      new Set([studentId]),
      mode,
    ));
  };
  const selectAllDesksRef = useRef<() => void>(() => {});
  selectAllDesksRef.current = () => {
    setDeskSelection(new Set(desks.map((desk) => desk.studentId)));
  };
  const nextUnplacedStudent = useMemo(() => {
    const placedStudentIds = new Set(desks.map((desk) => desk.studentId));
    return activeTab.students.find(
      (student) => !placedStudentIds.has(student.id),
    );
  }, [activeTab.students, desks]);
  const labels = useMemo(
    () => getClassroomLabels(activeTab.classroomLayout),
    [activeTab.classroomLayout],
  );
  const minimumMapSize = useMemo(
    () => getMinimumClassroomMapSize(desks, labels),
    [desks, labels],
  );
  const mapSize = useMemo(
    () => getClassroomMapSize(activeTab.classroomLayout, minimumMapSize),
    [activeTab.classroomLayout, minimumMapSize],
  );
  const handleMapResize = useCallback((size: ClassroomBounds) => {
    updateActiveTab({
      classroomLayout: {
        ...activeTab.classroomLayout,
        version: CLASSROOM_LAYOUT_VERSION,
        desks: activeTab.classroomLayout?.desks ?? [],
        width: size.width,
        height: size.height,
      },
    });
  }, [activeTab.classroomLayout, updateActiveTab]);
  const mapStore = useClassroomMapStoreApi();

  useEffect(() => {
    const handleDeleteSelection = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (document.querySelector(".MuiModal-root")) return;

      const selectedLabelIds = new Set(
        mapStore.getState().nodes
          .filter((node) => node.type === "label" && node.selected)
          .map((node) => node.id),
      );
      const selectedDeskIds = new Set(
        desks
          .map((desk) => desk.studentId)
          .filter((studentId) => selectedStudentIds.has(studentId)),
      );
      const deskCount = selectedDeskIds.size;
      const rectangleCount = selectedLabelIds.size;
      if (deskCount === 0 && rectangleCount === 0) return;

      event.preventDefault();
      showModal(getDeleteSelectionMessage(deskCount, rectangleCount), {
        acceptText: "Yes",
        cancelText: "No",
        acceptColor: "success",
        cancelColor: "error",
        cancelVariant: "contained",
        onAccept: () => {
          if (deskCount === 0) {
            updateActiveTab({
              classroomLayout: {
                ...activeTab.classroomLayout,
                version: CLASSROOM_LAYOUT_VERSION,
                desks: activeTab.classroomLayout?.desks ?? [],
                labels: labels.filter((label) => !selectedLabelIds.has(label.id)),
              },
            });
            onLabelSelectionChange?.(null);
            return;
          }

          const controlGroups = Object.fromEntries(
            Object.entries(activeTab.classroomLayout?.controlGroups ?? {})
              .map(([groupNumber, groupedStudentIds]) => [
                groupNumber,
                groupedStudentIds.filter((studentId) => !selectedDeskIds.has(studentId)),
              ]),
          ) as ClassroomControlGroups;

          updateActiveTab({
            classroomLayout: {
              ...activeTab.classroomLayout,
              version: CLASSROOM_LAYOUT_VERSION,
              desks: desks.filter((desk) => !selectedDeskIds.has(desk.studentId)),
              controlGroups,
              labels: labels.filter((label) => !selectedLabelIds.has(label.id)),
            },
          });
          onDeskSelectionChange?.(new Set());
          if (rectangleCount > 0) onLabelSelectionChange?.(null);
        },
      });
    };

    window.addEventListener("keydown", handleDeleteSelection);
    return () => window.removeEventListener("keydown", handleDeleteSelection);
  }, [
    activeTab.classroomLayout,
    desks,
    labels,
    mapStore,
    onDeskSelectionChange,
    onLabelSelectionChange,
    selectedStudentIds,
    showModal,
    updateActiveTab,
  ]);

  const previewNode = useClassroomMapStore((state) => state.previewNode);
  const selectedStudentIdsRef = useRef(selectedStudentIds);
  const selectedLabelIdRef = useRef(selectedLabelId);
  const selectionOrderRef = useRef<StudentId[]>([]);
  selectedStudentIdsRef.current = selectedStudentIds;
  selectedLabelIdRef.current = selectedLabelId;
  useEffect(() => {
    const previousIds = selectionOrderRef.current;
    const previousIdSet = new Set(previousIds);
    selectionOrderRef.current = [
      ...previousIds.filter((studentId) => selectedStudentIds.has(studentId)),
      ...Array.from(selectedStudentIds).filter(
        (studentId) => !previousIdSet.has(studentId),
      ),
    ];
  }, [selectedStudentIds]);
  const handleSelectionChange: OnSelectionChangeFunc<ClassroomMapNode> = useCallback(
    ({ nodes: selectedNodes }) => {
      const nextLabelId = selectedNodes.find(
        (selectedNode) =>
          selectedNode.type === "label" && !selectedNode.data.preview,
      )?.id ?? null;
      if (nextLabelId !== selectedLabelIdRef.current) {
        onLabelSelectionChange?.(nextLabelId);
      }

      const nextStudentIds = new Set(
        selectedNodes
          .filter((selectedNode) =>
            selectedNode.type === "desk" && !selectedNode.data.preview
          )
          .map((selectedNode) => selectedNode.id),
      );
      const sameIds = (left: ReadonlySet<StudentId>, right: ReadonlySet<StudentId>) =>
        left.size === right.size &&
        Array.from(left).every((studentId) => right.has(studentId));
      if (sameIds(nextStudentIds, selectedStudentIdsRef.current)) return;

      const storeStudentIds = new Set(
        mapStore.getState().nodes
          .filter((node) => isDeskNode(node) && node.selected)
          .map((node) => node.id),
      );
      if (!sameIds(nextStudentIds, storeStudentIds)) return;

      onDeskSelectionChange?.(nextStudentIds);
    },
    [mapStore, onDeskSelectionChange, onLabelSelectionChange],
  );
  const handleFloorPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0 || isSpacePanning) return;
    const mode = getDeskSelectionMode(event);
    if (mode === "replace") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(
      ".ClassroomMap__resize, .react-flow__node, .react-flow__controls, .react-flow__panel, .react-flow__attribution, a, button",
    )) {
      return;
    }

    beginSelectionGesture(mode);
  };

  useEffect(() => {
    const handleSpacePanKeyDown = (event: KeyboardEvent) => {
      if (
        event.code !== "Space" ||
        isTypingTarget(event.target) ||
        isTypingTarget(document.activeElement)
      ) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.querySelector(".MuiModal-root")) return;
      event.preventDefault();
      if (event.repeat) return;
      setIsSpacePanning(true);
      setSpacePanActive(true);
      endSelectionGesture();
    };
    const handleSpacePanKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      setIsSpacePanning(false);
      setSpacePanActive(false);
    };
    const endSpacePan = () => {
      setIsSpacePanning(false);
      setSpacePanActive(false);
    };

    window.addEventListener("keydown", handleSpacePanKeyDown);
    window.addEventListener("keyup", handleSpacePanKeyUp);
    window.addEventListener("blur", endSpacePan);
    return () => {
      window.removeEventListener("keydown", handleSpacePanKeyDown);
      window.removeEventListener("keyup", handleSpacePanKeyUp);
      window.removeEventListener("blur", endSpacePan);
    };
  }, [endSelectionGesture, setSpacePanActive]);

  useEffect(() => {
    setModifierSelectHandler((studentId, mode) => {
      modifierSelectRef.current(studentId, mode);
    });
    setSelectAllDesksHandler(() => {
      selectAllDesksRef.current();
    });
    return () => {
      setModifierSelectHandler(null);
      setSelectAllDesksHandler(null);
    };
  }, [setModifierSelectHandler, setSelectAllDesksHandler]);

  useEffect(() => {
    const endGesture = () => endSelectionGesture();
    window.addEventListener("pointerup", endGesture);
    window.addEventListener("pointercancel", endGesture);
    return () => {
      window.removeEventListener("pointerup", endGesture);
      window.removeEventListener("pointercancel", endGesture);
    };
  }, [endSelectionGesture]);

  useEffect(() => {
    replaceNodes(mapNodes);
  }, [mapNodes, replaceNodes]);

  useEffect(() => {
    if (previewNode?.type === "label" || nextUnplacedStudent) return;
    setPreviewNode(null);
  }, [nextUnplacedStudent, previewNode, setPreviewNode]);

  useEffect(() => {
    const clearPreview = () => setPreviewNode(null);
    window.addEventListener("dragend", clearPreview);

    return () => window.removeEventListener("dragend", clearPreview);
  }, [setPreviewNode]);

  useEffect(() => {
    const handleControlGroupKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (isTyping || !appOptions.enableKeybinds) return;

      if (
        event.code === "KeyA" &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        setDeskSelection(new Set(desks.map((desk) => desk.studentId)));
        event.preventDefault();
        return;
      }

      if (
        event.key === "Escape" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        selectedStudentIds.size > 0 &&
        !document.querySelector(".MuiModal-root")
      ) {
        setDeskSelection(new Set());
        event.preventDefault();
        return;
      }

      const groupNumber = getClassroomControlGroupNumber(event.code);
      if (groupNumber === undefined) return;

      if (event.altKey) {
        if (event.metaKey || event.ctrlKey || selectedStudentIds.size === 0) return;

        const placedStudentIds = new Set(desks.map((desk) => desk.studentId));
        const removedStudentIds = Array.from(selectedStudentIds).filter(
          (studentId) => placedStudentIds.has(studentId),
        );
        const nextControlGroups = removeFromClassroomControlGroup(
          controlGroups,
          groupNumber,
          removedStudentIds,
        );
        if (nextControlGroups === controlGroups) return;

        updateActiveTab({
          classroomLayout: {
            ...activeTab.classroomLayout,
            version: CLASSROOM_LAYOUT_VERSION,
            desks,
            controlGroups: nextControlGroups,
          },
        });
        event.preventDefault();
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        if (selectedStudentIds.size === 0) return;

        const placedStudentIds = new Set(
          desks.map((desk) => desk.studentId),
        );
        const assignedStudentIds = Array.from(selectedStudentIds).filter(
          (studentId) => placedStudentIds.has(studentId),
        );
        if (assignedStudentIds.length === 0) return;

        const updateControlGroups = event.shiftKey
          ? addToClassroomControlGroup
          : toggleClassroomControlGroup;
        const nextControlGroups = updateControlGroups(
          controlGroups,
          groupNumber,
          assignedStudentIds,
        );

        updateActiveTab({
          classroomLayout: {
            ...activeTab.classroomLayout,
            version: CLASSROOM_LAYOUT_VERSION,
            desks,
            controlGroups: nextControlGroups,
            controlGroupNames: nextControlGroups[groupNumber]
              ? withDefaultControlGroupName(
                activeTab.classroomLayout?.controlGroupNames,
                groupNumber,
              )
              : activeTab.classroomLayout?.controlGroupNames,
          },
        });
        event.preventDefault();
        return;
      }

      const groupedStudentIds = controlGroups[groupNumber] ?? [];
      if (groupedStudentIds.length === 0) return;

      addPointsToStudents(groupedStudentIds, event.shiftKey ? -1 : 1);
      event.preventDefault();
    };

    window.addEventListener("keydown", handleControlGroupKeyDown);
    return () => window.removeEventListener("keydown", handleControlGroupKeyDown);
  }, [
    activeTab.classroomLayout,
    addPointsToStudents,
    appOptions.enableKeybinds,
    controlGroups,
    desks,
    onDeskSelectionChange,
    selectedStudentIds,
    updateActiveTab,
  ]);

  useEffect(() => {
    const handleClipboardKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.altKey || event.shiftKey || event.repeat) {
        return;
      }
      if (!(event.metaKey || event.ctrlKey)) return;
      if (document.querySelector(".MuiModal-root")) return;

      if (event.code === "KeyC") {
        const desksByStudentId = new Map(
          desks.map((desk) => [desk.studentId, desk]),
        );
        const studentsById = new Map(
          activeTab.students.map((student) => [student.id, student]),
        );
        const selectedDesks = selectionOrderRef.current.flatMap((studentId) => {
          const desk = desksByStudentId.get(studentId);
          const student = studentsById.get(studentId);
          if (!desk || !student) return [];
          return [{ desk, name: student.name }];
        });
        const selectedLabelIds = new Set(
          mapStore.getState().nodes
            .filter((node) => node.type === "label" && node.selected && !node.data.preview)
            .map((node) => node.id),
        );
        if (selectedLabelId) selectedLabelIds.add(selectedLabelId);
        const selectedLabels = labels.filter((label) => selectedLabelIds.has(label.id));
        if (selectedDesks.length === 0 && selectedLabels.length === 0) return;

        const originX = Math.min(
          ...selectedDesks.map(({ desk }) => desk.x),
          ...selectedLabels.map((label) => label.x),
        );
        const originY = Math.min(
          ...selectedDesks.map(({ desk }) => desk.y),
          ...selectedLabels.map((label) => label.y),
        );
        copyClassroomSelection({
          desks: selectedDesks.map(({ desk, name }) => ({
            name,
            rotation: desk.rotation,
            offsetX: desk.x - originX,
            offsetY: desk.y - originY,
          })),
          labels: selectedLabels.map((label) => {
            const size = getClassroomLabelSize(label);
            return {
              text: label.text,
              width: size.width,
              height: size.height,
              offsetX: label.x - originX,
              offsetY: label.y - originY,
            };
          }),
        });
        event.preventDefault();
        return;
      }

      if (event.code !== "KeyV") return;

      const copies = getCopiedClassroomSelection();
      if (copies.desks.length === 0 && copies.labels.length === 0) return;

      const desksByStudentId = new Map(
        desks.map((desk) => [desk.studentId, desk]),
      );
      const selectedDesks = selectionOrderRef.current.flatMap((studentId) => {
        const desk = desksByStudentId.get(studentId);
        return desk ? [desk] : [];
      });
      const selectedLabels = labels.filter((label) =>
        label.id === selectedLabelId
        || mapStore.getState().nodes.some(
          (node) => node.id === label.id && node.type === "label" && node.selected,
        )
      );
      event.preventDefault();

      let deskPositions: Pick<ClassroomDesk, "x" | "y" | "rotation">[] = [];
      let originX = 0;
      let originY = 0;

      if (copies.desks.length > 0) {
        const anchor = selectedDesks.at(-1);
        deskPositions = findClassroomDeskPastePositions(
          copies.desks,
          desks,
          anchor,
          mapSize,
          getClassroomDesksBounds(selectedDesks),
        );
        if (deskPositions.length === 0) return;
        originX = deskPositions[0].x - copies.desks[0].offsetX;
        originY = deskPositions[0].y - copies.desks[0].offsetY;
      } else {
        const groupWidth = Math.max(
          ...copies.labels.map((label) => label.offsetX + label.width),
        );
        const groupHeight = Math.max(
          ...copies.labels.map((label) => label.offsetY + label.height),
        );
        const selectionFootprints = [
          ...selectedDesks.map(getClassroomDeskFootprint),
          ...selectedLabels.map((label) => ({
            x: label.x,
            y: label.y,
            ...getClassroomLabelSize(label),
          })),
        ];
        if (selectionFootprints.length > 0) {
          const minY = Math.min(...selectionFootprints.map((footprint) => footprint.y));
          const maxX = Math.max(
            ...selectionFootprints.map((footprint) => footprint.x + footprint.width),
          );
          originX = snapToClassroomGrid(maxX);
          originY = snapToClassroomGrid(minY);
        } else {
          originX = snapToClassroomGrid((mapSize.width - groupWidth) / 2);
          originY = snapToClassroomGrid((mapSize.height - groupHeight) / 2);
        }
        originX = Math.min(
          Math.max(0, originX),
          Math.max(0, mapSize.width - groupWidth),
        );
        originY = Math.min(
          Math.max(0, originY),
          Math.max(0, mapSize.height - groupHeight),
        );
      }

      const newStudents: Student[] = deskPositions.map((_position, index) => ({
        id: generateUuid(),
        name: copies.desks[index].name,
        points: 0,
      }));
      const newDesks: ClassroomDesk[] = newStudents.map((student, index) => ({
        studentId: student.id,
        x: deskPositions[index].x,
        y: deskPositions[index].y,
        rotation: deskPositions[index].rotation,
      }));
      const newLabels: ClassroomLabel[] = copies.labels.map((label) => ({
        id: generateUuid(),
        text: label.text,
        width: label.width,
        height: label.height,
        x: snapToClassroomGrid(originX + label.offsetX),
        y: snapToClassroomGrid(originY + label.offsetY),
      }));

      const pastedStudentIds = newDesks.map((desk) => desk.studentId);
      if (pastedStudentIds.length > 0) {
        selectionOrderRef.current = pastedStudentIds;
      }
      updateActiveTab({
        ...(newStudents.length > 0
          ? { students: [...activeTab.students, ...newStudents] }
          : {}),
        classroomLayout: {
          ...activeTab.classroomLayout,
          version: CLASSROOM_LAYOUT_VERSION,
          desks: [...desks, ...newDesks],
          ...(newLabels.length > 0
            ? { labels: [...(activeTab.classroomLayout?.labels ?? []), ...newLabels] }
            : {}),
        },
      });
      if (pastedStudentIds.length > 0) {
        onDeskSelectionChange?.(new Set(pastedStudentIds));
      } else if (newLabels.length > 0) {
        onDeskSelectionChange?.(new Set());
      }
      if (newLabels.length > 0) {
        onLabelSelectionChange?.(newLabels[newLabels.length - 1].id);
      }
    };

    window.addEventListener("keydown", handleClipboardKeyDown);
    return () => window.removeEventListener("keydown", handleClipboardKeyDown);
  }, [
    activeTab.classroomLayout,
    activeTab.students,
    desks,
    labels,
    mapSize,
    mapStore,
    onDeskSelectionChange,
    onLabelSelectionChange,
    selectedLabelId,
    updateActiveTab,
  ]);

  const getDesksAtDraggedPositions = useCallback(
    (draggedNodes: ClassroomMapNode[]) => {
      const positions = new Map(
        draggedNodes.map((draggedNode) => [
          draggedNode.id,
          draggedNode.position,
        ]),
      );

      return desks.map((desk) => {
        const position = positions.get(desk.studentId);
        return position ? { ...desk, ...position } : desk;
      });
    },
    [desks],
  );

  const areDraggedDeskPositionsValid = useCallback(
    (draggedNodes: ClassroomMapNode[], candidateDesks: ClassroomDesk[]) => {
      const draggedStudentIds = new Set(
        draggedNodes.map((draggedNode) => draggedNode.id),
      );

      return candidateDesks.every(
        (desk) =>
          !draggedStudentIds.has(desk.studentId) ||
          isClassroomDeskPlacementValid(desk, candidateDesks, mapSize),
      );
    },
    [mapSize],
  );

  const handleNodeDragStart: OnNodeDrag<ClassroomMapNode> = useCallback(
    (_event, node, draggedNodes) => {
      const nodesBeingDragged = draggedNodes.length > 0
        ? draggedNodes
        : [node];
      const draggedIds = new Set(
        nodesBeingDragged.map((draggedNode) => draggedNode.id),
      );

      lastValidDragPositions.current = new Map([
        ...desks
          .filter((desk) => draggedIds.has(desk.studentId))
          .map((desk) => [desk.studentId, { x: desk.x, y: desk.y }] as const),
        ...labels
          .filter((label) => draggedIds.has(label.id))
          .map((label) => [label.id, { x: label.x, y: label.y }] as const),
      ]);
    },
    [desks, labels],
  );

  const resolveDraggedNodePositions = useCallback(
    (nodesBeingDragged: ClassroomMapNode[]) => {
      const candidateDesks = getDesksAtDraggedPositions(nodesBeingDragged);
      if (areDraggedDeskPositionsValid(nodesBeingDragged, candidateDesks)) {
        return new Map(
          nodesBeingDragged.map((draggedNode) => [
            draggedNode.id,
            draggedNode.position,
          ] as const),
        );
      }

      const draggedIds = new Set(
        nodesBeingDragged.map((draggedNode) => draggedNode.id),
      );
      const movingDesks = candidateDesks.filter((desk) =>
        draggedIds.has(desk.studentId),
      );
      const resolvedDesks = getClosestValidClassroomDeskPositions(
        movingDesks,
        desks,
        mapSize,
      );
      const anchor = movingDesks[0];
      const resolvedAnchor = anchor
        ? resolvedDesks?.find((desk) => desk.studentId === anchor.studentId)
        : undefined;
      if (!anchor || !resolvedAnchor) {
        return new Map(lastValidDragPositions.current);
      }

      const dx = resolvedAnchor.x - anchor.x;
      const dy = resolvedAnchor.y - anchor.y;
      return new Map(
        nodesBeingDragged.map((draggedNode) => [
          draggedNode.id,
          {
            x: draggedNode.position.x + dx,
            y: draggedNode.position.y + dy,
          },
        ] as const),
      );
    },
    [
      areDraggedDeskPositionsValid,
      desks,
      getDesksAtDraggedPositions,
      mapSize,
    ],
  );

  const handleNodeDrag: OnNodeDrag<ClassroomMapNode> = useCallback(
    (_event, node, draggedNodes) => {
      const nodesBeingDragged = draggedNodes.length > 0
        ? draggedNodes
        : [node];
      const positions = resolveDraggedNodePositions(nodesBeingDragged);
      lastValidDragPositions.current = positions;
      const draggedUnchanged = nodesBeingDragged.every((draggedNode) => {
        const position = positions.get(draggedNode.id);
        return (
          position?.x === draggedNode.position.x &&
          position?.y === draggedNode.position.y
        );
      });
      if (draggedUnchanged) return;

      setNodes((currentNodes) =>
        currentNodes.map((currentNode) => {
          const position = positions.get(currentNode.id);
          return position
            ? { ...currentNode, position }
            : currentNode;
        }),
      );
    },
    [resolveDraggedNodePositions, setNodes],
  );

  const handleNodeDragStop: OnNodeDrag<ClassroomMapNode> = useCallback(
    (_event, node, draggedNodes) => {
      const nodesBeingDragged = draggedNodes.length > 0
        ? draggedNodes
        : [node];
      const nextPositions = resolveDraggedNodePositions(nodesBeingDragged);
      labels.forEach((label) => {
        const position = nextPositions.get(label.id);
        if (!position) return;
        nextPositions.set(
          label.id,
          clampClassroomLabelPosition(
            position.x,
            position.y,
            mapSize,
            getClassroomLabelSize(label, mapSize),
          ),
        );
      });

      setNodes((currentNodes) =>
        currentNodes.map((currentNode) => {
          const nextPosition = nextPositions.get(currentNode.id);
          return nextPosition
            ? { ...currentNode, position: nextPosition }
            : currentNode;
        }),
      );
      lastValidDragPositions.current = new Map();

      const nextDesks = desks.map((desk) =>
        nextPositions.has(desk.studentId)
          ? { ...desk, ...nextPositions.get(desk.studentId)! }
          : desk
      );
      const nextLabels = labels.map((label) => {
        const position = nextPositions.get(label.id);
        return position ? { ...label, ...position } : label;
      });

      updateActiveTab({
        classroomLayout: {
          ...activeTab.classroomLayout,
          version: CLASSROOM_LAYOUT_VERSION,
          desks: nextDesks,
          labels: nextLabels,
        },
      });
    },
    [
      activeTab.classroomLayout,
      desks,
      labels,
      mapSize,
      resolveDraggedNodePositions,
      setNodes,
      updateActiveTab,
    ],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const transferTypes = Array.from(event.dataTransfer.types);
      const isLabelTool = transferTypes.includes(CLASSROOM_LABEL_DRAG_TYPE);
      const isDeskTool = transferTypes.includes(CLASSROOM_DESK_DRAG_TYPE);
      if (!reactFlowInstance || (!isLabelTool && !isDeskTool)) return;
      if (isDeskTool && !isLabelTool && !nextUnplacedStudent) return;

      // Keeps react-dnd's window listener from resetting dropEffect to "none".
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      if (isLabelTool) {
        setPreviewNode(createLabelPreviewNode({
          x: snapToClassroomGrid(position.x - CLASSROOM_LABEL_WIDTH / 2),
          y: snapToClassroomGrid(position.y - CLASSROOM_LABEL_HEIGHT / 2),
        }));
        return;
      }
      if (!nextUnplacedStudent) return;

      setPreviewNode(
        createPreviewNode(
          nextUnplacedStudent,
          {
            x: snapToClassroomGrid(
              position.x - CLASSROOM_DESK_FOOTPRINT_WIDTH / 2,
            ),
            y: snapToClassroomGrid(
              position.y - CLASSROOM_DESK_FOOTPRINT_HEIGHT / 2,
            ),
          },
        ),
      );
    },
    [
      activeTab.students,
      nextUnplacedStudent,
      reactFlowInstance,
      setPreviewNode,
    ],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!reactFlowInstance) return;

      const transferTypes = Array.from(event.dataTransfer.types);
      if (
        transferTypes.includes(CLASSROOM_LABEL_DRAG_TYPE) ||
        transferTypes.includes(CLASSROOM_DESK_DRAG_TYPE)
      ) {
        event.stopPropagation();
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (event.dataTransfer.getData(CLASSROOM_LABEL_DRAG_TYPE) === "new-label") {
        event.preventDefault();
        const nextLabel: ClassroomLabel = {
          id: generateUuid(),
          x: snapToClassroomGrid(position.x - CLASSROOM_LABEL_WIDTH / 2),
          y: snapToClassroomGrid(position.y - CLASSROOM_LABEL_HEIGHT / 2),
          width: CLASSROOM_LABEL_WIDTH,
          height: CLASSROOM_LABEL_HEIGHT,
          text: CLASSROOM_LABEL_DEFAULT_TEXT,
        };
        setPreviewNode(null);
        if (!isClassroomLabelPlacementValid(nextLabel, mapSize)) return;

        updateActiveTab({
          classroomLayout: {
            ...activeTab.classroomLayout,
            version: CLASSROOM_LAYOUT_VERSION,
            desks: activeTab.classroomLayout?.desks ?? [],
            labels: [...labels, nextLabel],
          },
        });
        return;
      }

      if (
        !nextUnplacedStudent ||
        event.dataTransfer.getData(CLASSROOM_DESK_DRAG_TYPE) !== "new-desk"
      ) {
        return;
      }

      event.preventDefault();

      const nextDesk: ClassroomDesk = {
        studentId: nextUnplacedStudent.id,
        x: snapToClassroomGrid(position.x - CLASSROOM_DESK_FOOTPRINT_WIDTH / 2),
        y: snapToClassroomGrid(position.y - CLASSROOM_DESK_FOOTPRINT_HEIGHT / 2),
        rotation: 0,
      };
      setPreviewNode(null);

      if (!isClassroomDeskPlacementValid(nextDesk, desks, mapSize)) return;

      updateActiveTab({
        classroomLayout: {
          ...activeTab.classroomLayout,
          version: CLASSROOM_LAYOUT_VERSION,
          desks: [...desks, nextDesk],
        },
      });
    },
    [
      activeTab.classroomLayout,
      desks,
      labels,
      mapSize,
      nextUnplacedStudent,
      reactFlowInstance,
      setPreviewNode,
      updateActiveTab,
    ],
  );

  return (
    <div
      className={isSpacePanning ? "ClassroomMap ClassroomMap--space-pan" : "ClassroomMap"}
      onClickCapture={(event) => {
        if (!isSpacePanning) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerDownCapture={handleFloorPointerDown}
      style={{
        ...classroomMapStyle,
        "--classroom-map-width": `${mapSize.width}px`,
        "--classroom-map-height": `${mapSize.height}px`,
      } as CSSProperties}
    >
      <ClassroomFlow
        handleNodeDrag={handleNodeDrag}
        handleNodeDragStart={handleNodeDragStart}
        handleNodeDragStop={handleNodeDragStop}
        handleSelectionChange={handleSelectionChange}
        mapSize={mapSize}
        minimumMapSize={minimumMapSize}
        onMapResize={handleMapResize}
      />
    </div>
  );
};

export const ClassroomMap = (props: ClassroomMapProps) => {
  const { activeTab, updateActiveTab } = useTabContext();
  const desks = useMemo(
    () => getPlacedClassroomDesks(activeTab.students, activeTab.classroomLayout),
    [activeTab.classroomLayout, activeTab.students],
  );
  const deskNodes = useMemo(
    () => createDeskNodes(
      desks,
      activeTab.students,
      props.selectedStudentIds,
      activeTab.classroomLayout?.controlGroups,
    ),
    [
      activeTab.classroomLayout?.controlGroups,
      activeTab.students,
      desks,
      props.selectedStudentIds,
    ],
  );
  const mapNodes = useMemo(
    () => [
      ...createLabelNodes(
        getClassroomLabels(activeTab.classroomLayout),
        true,
        props.selectedLabelId,
      ),
      ...deskNodes,
    ],
    [activeTab.classroomLayout, deskNodes, props.selectedLabelId],
  );

  return (
    <ClassroomMapStoreProvider initialNodes={mapNodes}>
      <ClassroomMapContent
        {...props}
        activeTab={activeTab}
        desks={desks}
        mapNodes={mapNodes}
        updateActiveTab={updateActiveTab}
      />
    </ClassroomMapStoreProvider>
  );
};
