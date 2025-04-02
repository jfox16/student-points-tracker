export type StudentId = string;

export interface Student {
  id: StudentId;
  name: string;
  points: number;
  selected?: boolean;
  state?: StudentState;
  className?: string;
}

export interface StudentState {
  // relic of a time once forgotten
}
