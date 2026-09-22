import { describe, expect, it } from "vitest";

import {
  createClassroomMapStore,
  DeskNode,
} from "./classroomMapStore";

const createNode = (id: string, x = 0): DeskNode => ({
  id,
  type: "desk",
  position: { x, y: 0 },
  data: {
    student: { id, name: id, points: 0 },
    studentNumber: 1,
    rotation: 0,
  },
});

describe("classroomMapStore", () => {
  it("keeps each map instance isolated", () => {
    const firstStore = createClassroomMapStore([createNode("first")]);
    const secondStore = createClassroomMapStore([createNode("second")]);

    firstStore.getState().replaceNodes([createNode("replacement")]);

    expect(firstStore.getState().nodes[0].id).toBe("replacement");
    expect(secondStore.getState().nodes[0].id).toBe("second");
  });

  it("applies React Flow node changes without touching persistent app state", () => {
    const store = createClassroomMapStore([createNode("student-1")]);

    store.getState().applyNodeChanges([
      {
        id: "student-1",
        type: "position",
        position: { x: 40, y: 20 },
        dragging: true,
      },
    ]);

    expect(store.getState().nodes[0]).toMatchObject({
      id: "student-1",
      position: { x: 40, y: 20 },
      dragging: true,
    });
  });

  it("preserves measured dimensions when app data resynchronizes a node", () => {
    const store = createClassroomMapStore([createNode("student-1")]);
    store.getState().applyNodeChanges([
      {
        id: "student-1",
        type: "dimensions",
        dimensions: { width: 160, height: 160 },
        setAttributes: true,
      },
    ]);

    store.getState().replaceNodes([
      {
        ...createNode("student-1"),
        selected: true,
      },
    ]);

    expect(store.getState().nodes[0]).toMatchObject({
      selected: true,
      measured: { width: 160, height: 160 },
      width: 160,
      height: 160,
    });
  });

  it("supports atomic functional node updates", () => {
    const store = createClassroomMapStore([
      createNode("student-1"),
      createNode("student-2"),
    ]);

    store.getState().setNodes((nodes) =>
      nodes.map((node) =>
        node.id === "student-2"
          ? { ...node, position: { x: 80, y: 100 } }
          : node
      )
    );

    expect(store.getState().nodes.map((node) => node.position)).toEqual([
      { x: 0, y: 0 },
      { x: 80, y: 100 },
    ]);
  });

  it("does not notify subscribers for an unchanged drag preview", () => {
    const store = createClassroomMapStore();
    const preview = {
      ...createNode("preview", 40),
      position: { x: 40, y: 20 },
    };
    let notifications = 0;
    store.subscribe(() => {
      notifications += 1;
    });

    store.getState().setPreviewNode(preview);
    store.getState().setPreviewNode({ ...preview });

    expect(notifications).toBe(1);
  });

  it("adds desks inside a drag box without dropping the desks selected at the start", () => {
    const store = createClassroomMapStore([
      { ...createNode("ada"), selected: true },
      createNode("grace"),
      createNode("lin"),
    ]);

    store.getState().beginSelectionGesture("add");
    store.getState().applyNodeChanges([
      { id: "ada", type: "select", selected: false },
      { id: "grace", type: "select", selected: true },
    ]);
    store.getState().applyNodeChanges([
      { id: "lin", type: "select", selected: true },
    ]);

    expect(store.getState().nodes.map((node) => [node.id, Boolean(node.selected)]))
      .toEqual([
        ["ada", true],
        ["grace", true],
        ["lin", true],
      ]);
  });

  it("removes only the desks currently inside a subtractive drag box", () => {
    const store = createClassroomMapStore([
      { ...createNode("ada"), selected: true },
      { ...createNode("grace"), selected: true },
      { ...createNode("lin"), selected: true },
    ]);

    store.getState().beginSelectionGesture("remove");
    store.getState().applyNodeChanges([
      { id: "ada", type: "select", selected: false },
      { id: "lin", type: "select", selected: false },
    ]);
    store.getState().applyNodeChanges([
      { id: "grace", type: "select", selected: false },
      { id: "lin", type: "select", selected: true },
    ]);

    expect(store.getState().nodes.map((node) => [node.id, Boolean(node.selected)]))
      .toEqual([
        ["ada", true],
        ["grace", true],
        ["lin", false],
      ]);
  });

  it("keeps text boxes out of desk drag-box selection", () => {
    const store = createClassroomMapStore([
      { ...createNode("ada"), selected: true },
      {
        id: "label-1",
        type: "label",
        position: { x: 40, y: 20 },
        data: { text: "Front" },
        selected: true,
      },
    ]);

    store.getState().beginSelectionGesture("add");
    expect(store.getState().selectionGesture?.baseIds).toEqual(["ada"]);

    store.getState().applyNodeChanges([
      { id: "label-1", type: "select", selected: false },
    ]);

    expect(store.getState().nodes.find((node) => node.id === "label-1")?.selected)
      .toBe(true);
  });

  it("keeps a text box selected when the map resynchronizes", () => {
    const store = createClassroomMapStore([
      {
        id: "label-1",
        type: "label",
        position: { x: 40, y: 20 },
        data: { text: "Front" },
        selected: true,
        measured: { width: 240, height: 100 },
        width: 240,
        height: 100,
      },
    ]);

    store.getState().replaceNodes([
      {
        id: "label-1",
        type: "label",
        position: { x: 40, y: 20 },
        data: { text: "Front" },
        width: 320,
        height: 120,
      },
    ]);

    expect(store.getState().nodes[0]).toMatchObject({
      selected: true,
      width: 240,
      height: 100,
    });
  });
});
