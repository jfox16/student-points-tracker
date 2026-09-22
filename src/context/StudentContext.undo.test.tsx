import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppContextProvider } from "./AppContext";
import { StudentContextProvider, useStudentContext } from "./StudentContext";
import { TabContextProvider, useTabContext } from "./TabContext";

const Probe = () => {
  const { updateActiveTab } = useTabContext();
  const {
    addPointsToStudent,
    addPointsToStudents,
    redo,
    students,
    undo,
  } = useStudentContext();

  return (
    <div>
      <span data-testid="points">
        {students.map((student) => student.points).join(",")}
      </span>
      <button
        onClick={() => {
          updateActiveTab({
            students: [
              { id: "a", name: "Ada", points: 0 },
              { id: "b", name: "Ben", points: 0 },
            ],
          });
        }}
        type="button"
      >
        seed
      </button>
      <button
        onClick={() => addPointsToStudent("a", 1)}
        type="button"
      >
        add one
      </button>
      <button
        onClick={() => addPointsToStudents(["a", "b"], 1)}
        type="button"
      >
        add group
      </button>
      <button onClick={undo} type="button">undo</button>
      <button onClick={redo} type="button">redo</button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <AppContextProvider>
      <TabContextProvider>
        <StudentContextProvider>
          <Probe />
        </StudentContextProvider>
      </TabContextProvider>
    </AppContextProvider>,
  );

describe("StudentContext point undo", () => {
  it("undoes a single point add and a group add as one action each", () => {
    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "seed" }));
    fireEvent.click(screen.getByRole("button", { name: "add one" }));
    fireEvent.click(screen.getByRole("button", { name: "add group" }));

    expect(screen.getByTestId("points")).toHaveTextContent("2,1");

    fireEvent.click(screen.getByRole("button", { name: "undo" }));
    expect(screen.getByTestId("points")).toHaveTextContent("1,0");

    fireEvent.click(screen.getByRole("button", { name: "undo" }));
    expect(screen.getByTestId("points")).toHaveTextContent("0,0");

    fireEvent.click(screen.getByRole("button", { name: "redo" }));
    expect(screen.getByTestId("points")).toHaveTextContent("1,0");
  });
});
