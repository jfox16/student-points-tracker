import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useRef,
} from "react";
import { applyNodeChanges } from "@xyflow/react";
import type {
  Node,
  NodeChange,
  ReactFlowInstance,
} from "@xyflow/react";
import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";

import { DeskRotation } from "../../types/classroomLayout.type";
import type { ClassroomControlGroupNumber } from "../../types/classroomLayout.type";
import { Student, StudentId } from "../../types/student.type";
import {
  applyDeskSelection,
  DeskSelectionMode,
} from "../../utils/deskSelection";

type DeskSelectionModifier = Exclude<DeskSelectionMode, "replace">;

export interface DeskSelectionGesture {
  mode: DeskSelectionModifier;
  baseIds: StudentId[];
  // React Flow reports box contents as a diff against its own selection,
  // which lags behind the selection we show for add/remove drags.
  rfTargetIds: StudentId[];
}

type ModifierSelectHandler = (
  studentId: StudentId,
  mode: DeskSelectionModifier,
) => void;
type SelectAllDesksHandler = () => void;

export interface DeskNodeData extends Record<string, unknown> {
  student: Student;
  studentNumber: number;
  rotation: DeskRotation;
  controlGroups?: ClassroomControlGroupNumber[];
  preview?: boolean;
}

export type DeskNode = Node<DeskNodeData, "desk">;

export interface LabelNodeData extends Record<string, unknown> {
  text: string;
  preview?: boolean;
}

export type LabelNode = Node<LabelNodeData, "label">;
export type ClassroomMapNode = DeskNode | LabelNode;
type NodesUpdater = ClassroomMapNode[] | ((nodes: ClassroomMapNode[]) => ClassroomMapNode[]);

export interface ClassroomMapState {
  nodes: ClassroomMapNode[];
  previewNode: ClassroomMapNode | null;
  reactFlowInstance: ReactFlowInstance<ClassroomMapNode> | null;
  selectionGesture: DeskSelectionGesture | null;
  modifierSelectHandler: ModifierSelectHandler | null;
  selectAllDesksHandler: SelectAllDesksHandler | null;
  applyNodeChanges: (changes: NodeChange<ClassroomMapNode>[]) => void;
  beginSelectionGesture: (mode: DeskSelectionModifier) => void;
  endSelectionGesture: () => void;
  replaceNodes: (nodes: ClassroomMapNode[]) => void;
  selectAllDesks: () => void;
  selectWithModifier: (studentId: StudentId, mode: DeskSelectionModifier) => void;
  setModifierSelectHandler: (handler: ModifierSelectHandler | null) => void;
  setSelectAllDesksHandler: (handler: SelectAllDesksHandler | null) => void;
  setNodes: (updater: NodesUpdater) => void;
  setPreviewNode: (node: ClassroomMapNode | null) => void;
  setReactFlowInstance: (instance: ReactFlowInstance<ClassroomMapNode>) => void;
}

export const isDeskNode = (node: ClassroomMapNode): node is DeskNode =>
  node.type === "desk";

const selectedDeskIds = (nodes: ClassroomMapNode[]): StudentId[] =>
  nodes.filter((node) => isDeskNode(node) && node.selected).map((node) => node.id);

const withSelectedDeskIds = (
  nodes: ClassroomMapNode[],
  selectedIds: ReadonlySet<StudentId>,
): ClassroomMapNode[] => {
  let changed = false;
  const nextNodes = nodes.map((node) => {
    if (!isDeskNode(node)) return node;
    const selected = selectedIds.has(node.id);
    if (Boolean(node.selected) === selected) return node;
    changed = true;
    return { ...node, selected };
  });
  return changed ? nextNodes : nodes;
};

const isSamePreview = (
  current: ClassroomMapNode | null,
  previewNode: ClassroomMapNode | null,
) => {
  if (current === previewNode) return true;
  if (!current || !previewNode) return false;
  if (
    current.position.x !== previewNode.position.x ||
    current.position.y !== previewNode.position.y ||
    current.type !== previewNode.type
  ) {
    return false;
  }
  if (current.type === "label" && previewNode.type === "label") {
    return current.data.text === previewNode.data.text;
  }
  if (current.type === "desk" && previewNode.type === "desk") {
    return current.data.student === previewNode.data.student;
  }
  return false;
};

export type ClassroomMapStore = StoreApi<ClassroomMapState>;

export const createClassroomMapStore = (
  initialNodes: ClassroomMapNode[] = [],
): ClassroomMapStore =>
  createStore<ClassroomMapState>()((set, get) => ({
    nodes: initialNodes,
    previewNode: null,
    reactFlowInstance: null,
    selectionGesture: null,
    modifierSelectHandler: null,
    selectAllDesksHandler: null,
    applyNodeChanges: (changes) =>
      set((state) => {
        const gesture = state.selectionGesture;
        const hasSelectionChanges = changes.some((change) => change.type === "select");
        if (!gesture || !hasSelectionChanges) {
          return { nodes: applyNodeChanges(changes, state.nodes) };
        }

        const structuralChanges = changes.filter((change) => change.type !== "select");
        const nodes = structuralChanges.length > 0
          ? applyNodeChanges(structuralChanges, state.nodes)
          : state.nodes;
        const deskIds = new Set(
          nodes.filter(isDeskNode).map((node) => node.id),
        );
        const rfTargetIds = new Set(gesture.rfTargetIds);
        changes.forEach((change) => {
          if (change.type !== "select" || !deskIds.has(change.id)) return;
          if (change.selected) rfTargetIds.add(change.id);
          else rfTargetIds.delete(change.id);
        });
        const nextNodes = withSelectedDeskIds(
          nodes,
          applyDeskSelection(new Set(gesture.baseIds), rfTargetIds, gesture.mode),
        );

        return {
          nodes: nextNodes,
          selectionGesture: {
            ...gesture,
            rfTargetIds: Array.from(rfTargetIds),
          },
        };
      }),
    beginSelectionGesture: (mode) =>
      set((state) => {
        const baseIds = selectedDeskIds(state.nodes);
        return {
          selectionGesture: {
            mode,
            baseIds,
            rfTargetIds: baseIds,
          },
        };
      }),
    endSelectionGesture: () =>
      set((state) => (
        state.selectionGesture ? { selectionGesture: null } : state
      )),
    selectWithModifier: (studentId, mode) => {
      get().modifierSelectHandler?.(studentId, mode);
    },
    selectAllDesks: () => {
      get().selectAllDesksHandler?.();
    },
    setModifierSelectHandler: (modifierSelectHandler) => {
      get().modifierSelectHandler = modifierSelectHandler;
    },
    setSelectAllDesksHandler: (selectAllDesksHandler) => {
      get().selectAllDesksHandler = selectAllDesksHandler;
    },
    replaceNodes: (nodes) =>
      set((state) => {
        if (nodes === state.nodes) return state;

        const currentNodesById = new Map(
          state.nodes.map((node) => [node.id, node]),
        );
        return {
          nodes: nodes.map((node) => {
            const currentNode = currentNodesById.get(node.id);
            if (!currentNode?.measured) return node;

            return {
              ...node,
              measured: currentNode.measured,
              width: currentNode.width,
              height: currentNode.height,
              ...(node.type === "label"
                ? { selected: currentNode.selected }
                : {}),
            };
          }),
        };
      }),
    setNodes: (updater) =>
      set((state) => {
        const nodes = typeof updater === "function"
          ? updater(state.nodes)
          : updater;
        return nodes === state.nodes ? state : { nodes };
      }),
    setPreviewNode: (previewNode) =>
      set((state) => (
        isSamePreview(state.previewNode, previewNode) ? state : { previewNode }
      )),
    setReactFlowInstance: (reactFlowInstance) =>
      set((state) =>
        reactFlowInstance === state.reactFlowInstance
          ? state
          : { reactFlowInstance }
      ),
  }));

const ClassroomMapStoreContext = createContext<ClassroomMapStore | null>(null);

export const ClassroomMapStoreProvider = ({
  children,
  initialNodes,
}: {
  children: ReactNode;
  initialNodes?: ClassroomMapNode[];
}) => {
  const storeRef = useRef<ClassroomMapStore>();
  if (!storeRef.current) {
    storeRef.current = createClassroomMapStore(initialNodes);
  }

  return createElement(
    ClassroomMapStoreContext.Provider,
    { value: storeRef.current },
    children,
  );
};

export const useClassroomMapStore = <T>(
  selector: (state: ClassroomMapState) => T,
): T => {
  const store = useContext(ClassroomMapStoreContext);
  if (!store) {
    throw new Error(
      "useClassroomMapStore must be used within ClassroomMapStoreProvider",
    );
  }

  return useStore(store, selector);
};

export const useClassroomMapStoreApi = (): ClassroomMapStore => {
  const store = useContext(ClassroomMapStoreContext);
  if (!store) {
    throw new Error(
      "useClassroomMapStore must be used within ClassroomMapStoreProvider",
    );
  }

  return store;
};
