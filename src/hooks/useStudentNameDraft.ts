import { useEffect, useState } from "react";

import { useStudentContext } from "../context/StudentContext";
import { nextDefaultStudentName } from "../context/TabContext";
import { Student } from "../types/student.type";

export const nameForSave = (
  draft: string,
  otherStudents: { name: string }[],
) => {
  const trimmed = draft.trim();
  return trimmed || nextDefaultStudentName(otherStudents);
};

export const useStudentNameDraft = (student: Student) => {
  const { students, updateStudent } = useStudentContext();
  const [draftName, setDraftName] = useState(student.name);

  useEffect(() => {
    setDraftName(student.name);
  }, [student.id, student.name]);

  const onNameChange = (name: string) => {
    setDraftName(name);
    if (name.trim()) updateStudent(student.id, { name });
  };

  const onNameBlur = () => {
    const nextName = nameForSave(
      draftName,
      students.filter((candidate) => candidate.id !== student.id),
    );
    setDraftName(nextName);
    if (nextName !== student.name) updateStudent(student.id, { name: nextName });
  };

  return { draftName, onNameChange, onNameBlur };
};
