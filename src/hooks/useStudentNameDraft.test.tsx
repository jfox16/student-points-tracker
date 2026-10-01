import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Student } from "../types/student.type";
import { nameForSave, useStudentNameDraft } from "./useStudentNameDraft";

const updateStudent = vi.fn();
const studentState = vi.hoisted(() => ({
  students: [] as Student[],
}));

vi.mock("../context/StudentContext", () => ({
  useStudentContext: () => ({
    students: studentState.students,
    updateStudent,
  }),
}));

const NameField = ({ student }: { student: Student }) => {
  const { draftName, onNameChange, onNameBlur } = useStudentNameDraft(student);
  return (
    <input
      aria-label="Student name"
      onBlur={onNameBlur}
      onChange={(event) => onNameChange(event.target.value)}
      value={draftName}
    />
  );
};

describe("nameForSave", () => {
  it("keeps a trimmed name", () => {
    expect(nameForSave("  Ada  ", [{ name: "Student 1" }])).toBe("Ada");
  });

  it("fills the next default name when the draft is blank", () => {
    expect(nameForSave("   ", [
      { name: "Student 1" },
      { name: "Ada" },
    ])).toBe("Student 2");
  });
});

describe("useStudentNameDraft", () => {
  beforeEach(() => {
    updateStudent.mockReset();
    studentState.students = [
      { id: "student-1", name: "Ada", points: 0 },
      { id: "student-2", name: "Student 2", points: 0 },
    ];
  });

  it("does not save an empty name while typing", () => {
    render(<NameField student={studentState.students[0]} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Student name" }), {
      target: { value: "" },
    });

    expect(updateStudent).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Student name" })).toHaveValue("");
  });

  it("saves the next default name when the field is left empty", () => {
    render(<NameField student={studentState.students[0]} />);
    const input = screen.getByRole("textbox", { name: "Student name" });

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);

    expect(updateStudent).toHaveBeenCalledWith("student-1", { name: "Student 1" });
    expect(input).toHaveValue("Student 1");
  });
});
