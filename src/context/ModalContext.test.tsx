import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ModalProvider, useModal } from "./ModalContext";

const OpenConfirm = () => {
  const { showModal } = useModal();

  return (
    <button
      onClick={() => showModal("Are you sure?", {
        acceptText: "Yes",
        cancelText: "No",
        acceptColor: "success",
        cancelColor: "error",
        cancelVariant: "contained",
        onAccept: () => {},
      })}
      type="button"
    >
      Open
    </button>
  );
};

describe("confirmation buttons", () => {
  it("shows a red No and a green Yes", () => {
    render(
      <ModalProvider>
        <OpenConfirm />
      </ModalProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toHaveClass("MuiButton-containedError");
    expect(screen.getByRole("button", { name: "Yes" })).toHaveClass("MuiButton-containedSuccess");
  });
});
