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
  CLASSROOM_LAYOUT_VERSION,
  ClassroomControlGroupNumber,
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
  CLASSROOM_BOUNDS,
  CLASSROOM_GRID_SIZE,
  CLASSROOM_LABEL_DRAG_TYPE,
  CLASSROOM_LABEL_HEIGHT,
  CLASSROOM_LABEL_WIDTH,
  CLASSROOM_MAP_HEIGHT,
  CLASSROOM_MAP_WIDTH,
  clampClassroomLabelPosition,
  getClassroomLabelSize,
  addToClassroomControlGroup,
  toggleClassroomControlGroup,
  findClassroomDeskPastePositions,
  getClosestValidClassroomDeskPosition,
  getClassroomControlGroupNumber,
  getClassroomLabels,
  getPlacedClassroomDesks,
  isClassroomDeskPlacementValid,
  isClassroomLabelPlacementValid,
  snapToClassroomGrid,
} from "../../utils/classroomLayout";
import {
  copyClassroomDesks,
  getCopiedClassroomDesks,
} from "../../utils/deskClipboard";
import { generateUuid } from "../../utils/generateUuid";
import { applyDeskSelection, getDeskSelectionMode } from "../../utils/deskSelection";
import { PointsDisplay } from "../StudentCard/PointsCounter/PointsDisplay";
import { ClassroomLabelNode } from "./ClassroomLabel";
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

const classroomMapStyle = {
  "--classroom-grid-size": `${CLASSROOM_GRID_SIZE}px`,
  "--classroom-desk-width": `${CLASSROOM_DESK_WIDTH}px`,
  "--classroom-desk-height": `${CLASSROOM_DESK_HEIGHT}px`,
  "--classroom-desk-footprint-width": `${CLASSROOM_DESK_FOOTPRINT_WIDTH}px`,
  "--classroom-desk-footprint-height": `${CLASSROOM_DESK_FOOTPRINT_HEIGHT}px`,
  "--classroom-chair-width": `${CLASSROOM_CHAIR_WIDTH}px`,
  "--classroom-chair-depth": `${CLASSROOM_CHAIR_DEPTH}px`,
  "--classroom-chair-offset": `${CLASSROOM_CHAIR_OFFSET}px`,
  "--classroom-map-width": `${CLASSROOM_MAP_WIDTH}px`,
  "--classroom-map-height": `${CLASSROOM_MAP_HEIGHT}px`,
} as CSSProperties;

const isAddPointTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(".ClassroomDesk__addPoint"));

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);

const DeskNodeComponent = memo(({ data, selected }: NodeProps<DeskNode>) => {
  const selectAllDesks = useClassroomMapStore((state) => state.selectAllDesks);
  const selectWithModifier = useClassroomMapStore((state) => state.selectWithModifier);
  const { addPointsToStudent } = useStudentContext();
  const { animationDirection, animationTrigger } = useStudentPointsAnimation(
    data.student,
    data.studentNumber - 1,
  );
  const displayName = data.student.name || `Student ${data.studentNumber}`;
  const className = [
    "ClassroomDesk",
    selected && !data.preview ? "ClassroomDesk--selected" : "",
    data.preview ? "ClassroomDesk--preview" : "",
    `ClassroomDesk--rotation-${data.rotation}`,
  ].filter(Boolean).join(" ");

  const handleAddPoint = () => {
    if (data.preview) return;
    addPointsToStudent(data.student.id, 1);
  };

  const pointsDisplay = (
    <PointsDisplay
      animationTrigger={animationTrigger}
      animationDirection={animationDirection}
      className="ClassroomDesk__pointsValue"
      colored={false}
      points={data.student.points}
      readOnly
    />
  );

  const handleMouseDown = (event: ReactMouseEvent) => {
    if (data.preview || isAddPointTarget(event.target)) return;

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
    if (data.preview || isAddPointTarget(event.target)) return;
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
            <div
              aria-label={`Add one point to ${displayName}`}
              className="ClassroomDesk__addPoint nodrag nopan"
              onClick={(event) => {
                event.stopPropagation();
                handleAddPoint();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              role="button"
            >
              {pointsDisplay}
              <span aria-hidden="true" className="ClassroomDesk__addPointPlus">
                +
              </span>
            </div>
          )}
        </div>
        {Boolean(data.controlGroups?.length) && (
          <div
            className="ClassroomDesk__groups"
            aria-label={`Control groups ${data.controlGroups?.join(", ")}`}
          >
            {data.controlGroups?.map((groupNumber) => (
              <span key={groupNumber}>{groupNumber}</span>
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

const classroomNodeExtent: [[number, number], [number, number]] = [
  [0, 0],
  [CLASSROOM_MAP_WIDTH, CLASSROOM_MAP_HEIGHT],
];
const classroomTranslateExtent: [[number, number], [number, number]] = [
  [-CLASSROOM_GRID_SIZE * 10, -CLASSROOM_GRID_SIZE * 10],
  [
    CLASSROOM_MAP_WIDTH + CLASSROOM_GRID_SIZE * 10,
    CLASSROOM_MAP_HEIGHT + CLASSROOM_GRID_SIZE * 10,
  ],
];

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
        studentNumber: students.indexOf(student) + 1,
        rotation: desk.rotation,
        controlGroups: (
          Object.keys(controlGroups)
            .map(Number) as ClassroomControlGroupNumber[]
        ).filter((groupNumber) =>
          controlGroups[groupNumber]?.includes(desk.studentId)
        ),
      },
    }];
  });
};

const createPreviewNode = (
  student: Student,
  studentNumber: number,
  position: { x: number; y: number },
): DeskNode => ({
  id: "desk-placement-preview",
  type: "desk",
  position,
  data: {
    student,
    studentNumber,
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
  data: { text: "", preview: true },
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
  mapEditMode: boolean;
  showSelectionHelp: boolean;
}

const ClassroomFlow = memo(({
  handleNodeDrag,
  handleNodeDragStart,
  handleNodeDragStop,
  handleSelectionChange,
  mapEditMode,
  showSelectionHelp,
}: ClassroomFlowProps) => {
  const nodes = useClassroomMapStore((state) => state.nodes);
  const previewNode = useClassroomMapStore((state) => state.previewNode);
  const onNodesChange = useClassroomMapStore((state) => state.applyNodeChanges);
  const setReactFlowInstance = useClassroomMapStore(
    (state) => state.setReactFlowInstance,
  );
  const renderedNodes = useMemo(
    () => previewNode ? [...nodes, previewNode] : nodes,
    [nodes, previewNode],
  );

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
      fitView={nodes.length > 0}
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.35}
      maxZoom={1.5}
      snapGrid={[CLASSROOM_GRID_SIZE, CLASSROOM_GRID_SIZE]}
      snapToGrid
      nodesDraggable={mapEditMode}
      nodesConnectable={false}
      panOnDrag={[1, 2]}
      panActivationKeyCode="Space"
      multiSelectionKeyCode={null}
      selectionKeyCode={null}
      selectionMode={SelectionMode.Partial}
      selectionOnDrag
      nodeExtent={classroomNodeExtent}
      translateExtent={classroomTranslateExtent}
      deleteKeyCode={null}
    >
      <ViewportPortal>
        <div
          className={
            mapEditMode
              ? "ClassroomMap__floor ClassroomMap__floor--edit"
              : "ClassroomMap__floor"
          }
          aria-hidden="true"
        />
      </ViewportPortal>
      <Controls showInteractive={false} />
      <Panel position="bottom-right">
        <div className="ClassroomMap__helpRow">
          {showSelectionHelp && (
            <div className="ClassroomMap__groupHelp">
              <span><kbd>⌘/Ctrl</kbd> click or drag adds</span>
              <span><kbd>Shift</kbd> click or drag removes</span>
              <span><kbd>Double-click</kbd> or <kbd>⌘/Ctrl</kbd>+<kbd>A</kbd> selects all</span>
              <span><kbd>Esc</kbd> clears</span>
              {mapEditMode && <span><kbd>Backspace</kbd> deletes</span>}
              <span><kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>1–9</kbd> adds to group</span>
            </div>
          )}
          <div className="ClassroomMap__groupHelp">
            <span><kbd>⌘/Ctrl</kbd> + <kbd>1–9</kbd> assign or clear</span>
            <span><kbd>1–9</kbd> +1 point</span>
            <span><kbd>Shift</kbd> + <kbd>1–9</kbd> −1 point</span>
            <span><kbd>Space</kbd> + drag pans</span>
            {mapEditMode && (
              <span><kbd>⌘/Ctrl</kbd>+<kbd>C</kbd>/<kbd>V</kbd> copy and paste desks</span>
            )}
          </div>
        </div>
      </Panel>
      {nodes.length === 0 && (
        <Panel position="top-center">
          <div className="ClassroomMap__empty">
            {mapEditMode
              ? "Drag a desk or rectangle from the toolbar and drop it here."
              : "Switch to Edit mode to place desks and rectangles."}
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
  const mapEditMode = activeTab.tabOptions?.mapEditMode ?? false;
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
  const mapStore = useClassroomMapStoreApi();

  useEffect(() => {
    if (!mapEditMode) return;

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
      if (selectedDeskIds.size === 0 && selectedLabelIds.size === 0) return;

      event.preventDefault();
      if (selectedDeskIds.size === 0) {
        updateActiveTab({
          classroomLayout: {
            ...activeTab.classroomLayout,
            version: CLASSROOM_LAYOUT_VERSION,
            desks: activeTab.classroomLayout?.desks ?? [],
            labels: labels.filter((label) => !selectedLabelIds.has(label.id)),
          },
        });
        return;
      }

      showModal("Are you sure?", {
        acceptText: "Yes",
        cancelText: "No",
        acceptColor: "success",
        cancelColor: "error",
        cancelVariant: "contained",
        onAccept: () => {
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
          if (selectedLabelIds.size > 0) onLabelSelectionChange?.(null);
        },
      });
    };

    window.addEventListener("keydown", handleDeleteSelection);
    return () => window.removeEventListener("keydown", handleDeleteSelection);
  }, [
    activeTab.classroomLayout,
    desks,
    labels,
    mapEditMode,
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
      ".react-flow__node, .react-flow__controls, .react-flow__panel, .react-flow__attribution, a, button",
    )) {
      return;
    }

    beginSelectionGesture(mode);
  };

  useEffect(() => {
    const handleSpacePanKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTypingTarget(event.target)) return;
      event.preventDefault();
      if (event.repeat) return;
      setIsSpacePanning(true);
    };
    const handleSpacePanKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      setIsSpacePanning(false);
    };
    const endSpacePan = () => setIsSpacePanning(false);

    window.addEventListener("keydown", handleSpacePanKeyDown);
    window.addEventListener("keyup", handleSpacePanKeyUp);
    window.addEventListener("blur", endSpacePan);
    return () => {
      window.removeEventListener("keydown", handleSpacePanKeyDown);
      window.removeEventListener("keyup", handleSpacePanKeyUp);
      window.removeEventListener("blur", endSpacePan);
    };
  }, []);

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
    if (mapEditMode && (previewNode?.type === "label" || nextUnplacedStudent)) {
      return;
    }
    setPreviewNode(null);
  }, [mapEditMode, nextUnplacedStudent, previewNode, setPreviewNode]);

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
      if (groupNumber === undefined || event.altKey) return;

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

        updateActiveTab({
          classroomLayout: {
            ...activeTab.classroomLayout,
            version: CLASSROOM_LAYOUT_VERSION,
            desks,
            controlGroups: updateControlGroups(
              controlGroups,
              groupNumber,
              assignedStudentIds,
            ),
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
      if (document.querySelector(".MuiModal-root") || !mapEditMode) return;

      if (event.code === "KeyC") {
        const desksByStudentId = new Map(
          desks.map((desk) => [desk.studentId, desk]),
        );
        const studentsById = new Map(
          activeTab.students.map((student) => [student.id, student]),
        );
        const copies = selectionOrderRef.current.flatMap((studentId) => {
          const desk = desksByStudentId.get(studentId);
          const student = studentsById.get(studentId);
          if (!desk || !student) return [];
          return [{ name: student.name, rotation: desk.rotation }];
        });
        if (copies.length === 0) return;

        copyClassroomDesks(copies);
        event.preventDefault();
        return;
      }

      if (event.code !== "KeyV") return;

      const copies = getCopiedClassroomDesks();
      if (copies.length === 0) return;

      const lastSelectedId = selectionOrderRef.current.at(-1);
      const anchor = lastSelectedId
        ? desks.find((desk) => desk.studentId === lastSelectedId)
        : undefined;
      const positions = findClassroomDeskPastePositions(copies, desks, anchor);
      event.preventDefault();
      if (positions.length === 0) return;

      const newStudents: Student[] = positions.map((_position, index) => ({
        id: generateUuid(),
        name: copies[index].name,
        points: 0,
      }));
      const newDesks: ClassroomDesk[] = newStudents.map((student, index) => ({
        studentId: student.id,
        x: positions[index].x,
        y: positions[index].y,
        rotation: positions[index].rotation,
      }));

      const pastedStudentIds = newDesks.map((desk) => desk.studentId);
      selectionOrderRef.current = pastedStudentIds;
      updateActiveTab({
        students: [...activeTab.students, ...newStudents],
        classroomLayout: {
          ...activeTab.classroomLayout,
          version: CLASSROOM_LAYOUT_VERSION,
          desks: [...desks, ...newDesks],
        },
      });
      onDeskSelectionChange?.(new Set(pastedStudentIds));
    };

    window.addEventListener("keydown", handleClipboardKeyDown);
    return () => window.removeEventListener("keydown", handleClipboardKeyDown);
  }, [
    activeTab.classroomLayout,
    activeTab.students,
    desks,
    mapEditMode,
    onDeskSelectionChange,
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
          isClassroomDeskPlacementValid(desk, candidateDesks),
      );
    },
    [],
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

  const handleNodeDrag: OnNodeDrag<ClassroomMapNode> = useCallback(
    (_event, node, draggedNodes) => {
      if (!mapEditMode) return;

      const nodesBeingDragged = draggedNodes.length > 0
        ? draggedNodes
        : [node];
      const candidateDesks = getDesksAtDraggedPositions(nodesBeingDragged);

      if (areDraggedDeskPositionsValid(nodesBeingDragged, candidateDesks)) {
        lastValidDragPositions.current = new Map(
          nodesBeingDragged.map((draggedNode) => [
            draggedNode.id,
            draggedNode.position,
          ]),
        );
        return;
      }

      if (nodesBeingDragged.length > 1) {
        const fallbackPositions = lastValidDragPositions.current;
        setNodes((currentNodes) =>
          currentNodes.map((currentNode) => {
            const fallbackPosition = fallbackPositions.get(currentNode.id);
            return fallbackPosition
              ? { ...currentNode, position: fallbackPosition }
              : currentNode;
          }),
        );
        return;
      }

      const desk = candidateDesks.find(
        (candidate) => candidate.studentId === node.id,
      );
      if (!desk) return;

      const closestPosition = getClosestValidClassroomDeskPosition(
        desk,
        desks,
      );
      lastValidDragPositions.current = new Map([
        [desk.studentId, closestPosition],
      ]);

      setNodes((currentNodes) =>
        currentNodes.map((currentNode) =>
          currentNode.id === node.id
            ? {
                ...currentNode,
                position: closestPosition,
              }
            : currentNode
        ),
      );
    },
    [
      areDraggedDeskPositionsValid,
      desks,
      getDesksAtDraggedPositions,
      mapEditMode,
      setNodes,
    ],
  );

  const handleNodeDragStop: OnNodeDrag<ClassroomMapNode> = useCallback(
    (_event, node, draggedNodes) => {
      if (!mapEditMode) return;

      const nodesBeingDragged = draggedNodes.length > 0
        ? draggedNodes
        : [node];
      const candidateDesks = getDesksAtDraggedPositions(nodesBeingDragged);
      const nextPositions = new Map(
        areDraggedDeskPositionsValid(nodesBeingDragged, candidateDesks)
          ? nodesBeingDragged.map((draggedNode) => [
              draggedNode.id,
              draggedNode.position,
            ] as const)
          : lastValidDragPositions.current,
      );
      labels.forEach((label) => {
        const position = nextPositions.get(label.id);
        if (!position) return;
        nextPositions.set(
          label.id,
          clampClassroomLabelPosition(
            position.x,
            position.y,
            CLASSROOM_BOUNDS,
            getClassroomLabelSize(label),
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
      areDraggedDeskPositionsValid,
      activeTab.classroomLayout,
      desks,
      getDesksAtDraggedPositions,
      labels,
      mapEditMode,
      setNodes,
      updateActiveTab,
    ],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const transferTypes = Array.from(event.dataTransfer.types);
      const isLabelTool = transferTypes.includes(CLASSROOM_LABEL_DRAG_TYPE);
      const isDeskTool = transferTypes.includes(CLASSROOM_DESK_DRAG_TYPE);
      if (!mapEditMode || !reactFlowInstance || (!isLabelTool && !isDeskTool)) {
        return;
      }
      if (isDeskTool && !isLabelTool && !nextUnplacedStudent) return;

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
          activeTab.students.indexOf(nextUnplacedStudent) + 1,
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
      mapEditMode,
      nextUnplacedStudent,
      reactFlowInstance,
      setPreviewNode,
    ],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!mapEditMode || !reactFlowInstance) return;

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
          text: "",
        };
        setPreviewNode(null);
        if (!isClassroomLabelPlacementValid(nextLabel)) return;

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

      if (!isClassroomDeskPlacementValid(nextDesk, desks)) return;

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
      mapEditMode,
      nextUnplacedStudent,
      reactFlowInstance,
      setPreviewNode,
      updateActiveTab,
    ],
  );

  return (
    <div
      className={isSpacePanning ? "ClassroomMap ClassroomMap--space-pan" : "ClassroomMap"}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerDownCapture={handleFloorPointerDown}
      style={classroomMapStyle}
    >
      <ClassroomFlow
        handleNodeDrag={handleNodeDrag}
        handleNodeDragStart={handleNodeDragStart}
        handleNodeDragStop={handleNodeDragStop}
        handleSelectionChange={handleSelectionChange}
        mapEditMode={mapEditMode}
        showSelectionHelp={selectedStudentIds.size > 0}
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
  const mapEditMode = activeTab.tabOptions?.mapEditMode ?? false;
  const mapNodes = useMemo(
    () => [
      ...createLabelNodes(
        getClassroomLabels(activeTab.classroomLayout),
        mapEditMode,
      ),
      ...deskNodes,
    ],
    [activeTab.classroomLayout, deskNodes, mapEditMode],
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
