export type TabViewMode = "list" | "map";

export interface TabOptions {
  columns?: number;
  viewMode?: TabViewMode;
  mapEditMode?: boolean;
}
