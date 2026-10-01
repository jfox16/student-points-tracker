import { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { beforeEach, describe, expect, it } from "vitest";

import { ModalProvider } from "../../context/ModalContext";
import { TabContextProvider, useTabContext } from "../../context/TabContext";
import { LocalStorageKey } from "../../utils/useLocalStorage";
import { TabList } from "./TabList";

const tabOptions = { columns: 8, viewMode: "list" as const };

const seedTabs = () => {
  localStorage.setItem(
    LocalStorageKey.SAVED_TABS,
    JSON.stringify({
      activeTabId: "class-a",
      tabs: [
        {
          id: "class-a",
          name: "Alpha",
          students: [{ id: "student-1", name: "Ada", points: 3, selected: true }],
          tabOptions,
        },
        {
          id: "class-b",
          name: "Beta",
          students: [],
          tabOptions,
        },
      ],
    }),
  );
};

const OrderProbe = () => {
  const { moveTab, tabs } = useTabContext();
  return (
    <>
      <TabList />
      <button onClick={() => moveTab(0, 1)} type="button">Reorder</button>
      <div data-testid="order">{tabs.map((tab) => tab.name).join(",")}</div>
    </>
  );
};

const renderList = (ui: ReactNode = <TabList />) =>
  render(
    <DndProvider backend={HTML5Backend}>
      <ModalProvider>
        <TabContextProvider>{ui}</TabContextProvider>
      </ModalProvider>
    </DndProvider>,
  );

const classNames = () =>
  screen.getAllByRole("textbox").map((input) => (input as HTMLInputElement).value);

describe("class list", () => {
  beforeEach(() => {
    localStorage.clear();
    seedTabs();
  });

  it("moves a class to a new position", () => {
    renderList(<OrderProbe />);

    expect(screen.getAllByLabelText("Drag to reorder")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Reorder" }));

    expect(screen.getByTestId("order")).toHaveTextContent("Beta,Alpha");
  });

  it("duplicates a class below it and selects the copy", () => {
    renderList();

    const card = screen.getByDisplayValue("Alpha").closest(".TabCard");
    if (!card) throw new Error("Missing class card");
    fireEvent.mouseEnter(card);
    fireEvent.click(screen.getByLabelText("Duplicate Alpha"));

    expect(classNames()).toEqual(["Alpha", "Alpha copy", "Beta"]);
    expect(document.querySelector(".TabCard.active input")).toHaveValue("Alpha copy");
  });
});
