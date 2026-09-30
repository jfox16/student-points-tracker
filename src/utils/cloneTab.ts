import {
  ClassroomControlGroups,
  ClassroomLayout,
} from "../types/classroomLayout.type";
import { StudentId } from "../types/student.type";
import { Tab } from "../types/tab.type";
import { generateUuid } from "./generateUuid";

export const copiedTabName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return name;

  const numberedCopy = trimmed.match(/^(.*?) copy (\d+)$/);
  if (numberedCopy) {
    return `${numberedCopy[1]} copy ${Number(numberedCopy[2]) + 1}`;
  }
  if (trimmed.endsWith(" copy")) {
    return `${trimmed.slice(0, -" copy".length)} copy 2`;
  }
  return `${trimmed} copy`;
};

const remapStudentIds = (
  studentIds: readonly StudentId[] | undefined,
  idMap: ReadonlyMap<StudentId, StudentId>,
) => studentIds?.map((studentId) => idMap.get(studentId) ?? studentId);

const remapControlGroups = (
  controlGroups: ClassroomControlGroups | undefined,
  idMap: ReadonlyMap<StudentId, StudentId>,
): ClassroomControlGroups | undefined => {
  if (!controlGroups) return undefined;

  return Object.fromEntries(
    Object.entries(controlGroups).map(([groupNumber, studentIds]) => [
      groupNumber,
      remapStudentIds(studentIds, idMap),
    ]),
  ) as ClassroomControlGroups;
};

const cloneClassroomLayout = (
  layout: ClassroomLayout | undefined,
  idMap: ReadonlyMap<StudentId, StudentId>,
  createId: () => string,
): ClassroomLayout | undefined => {
  if (!layout) return undefined;

  return {
    ...layout,
    desks: layout.desks.map((desk) => ({
      ...desk,
      studentId: idMap.get(desk.studentId) ?? desk.studentId,
    })),
    labels: layout.labels?.map((label) => ({
      ...label,
      id: createId(),
    })),
    controlGroups: remapControlGroups(layout.controlGroups, idMap),
  };
};

export const cloneTab = (
  tab: Tab,
  createId: () => string = generateUuid,
): Tab => {
  const idMap = new Map<StudentId, StudentId>();
  const students = tab.students.map((student) => {
    const id = createId();
    idMap.set(student.id, id);
    return {
      ...student,
      id,
      selected: false,
    };
  });

  return {
    ...tab,
    id: createId(),
    name: copiedTabName(tab.name),
    students,
    tabOptions: tab.tabOptions ? { ...tab.tabOptions } : undefined,
    classroomLayout: cloneClassroomLayout(tab.classroomLayout, idMap, createId),
  };
};
