import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { AppHeader } from "./components/AppHeader/AppHeader";
import { BankSidebar } from "./components/BankSidebar/BankSidebar";
import { DeskDetailsSidebar } from "./components/DetailsSidebar/DeskDetailsSidebar";
import { StudentList } from "./components/StudentList/StudentList";
import { TabList } from "./components/TabList/TabList";
import { TabOptionsRow } from "./components/TabOptionsRow/TabOptionsRow";
import { TabTitle } from "./components/TabTitle/TabTitle";

import { AppContextProvider } from "./context/AppContext";
import { BankContextProvider } from "./context/BankContext";
import { ModalProvider } from "./context/ModalContext";
import { SoundContextProvider } from "./context/SoundContext";
import { StudentContextProvider } from "./context/StudentContext";
import { TabContextProvider, useTabContext } from "./context/TabContext";
import { StudentId } from "./types/student.type";

import { NestProviders } from "./utils/NestProviders";

import './App.css';
import './output.css'; // import generated tailwind styles

const ClassroomMap = React.lazy(() =>
  import("./components/ClassroomMap/ClassroomMap").then((module) => ({
    default: module.ClassroomMap,
  }))
);

const providers = [
  AppContextProvider,
  TabContextProvider,
  StudentContextProvider,
  SoundContextProvider,
  ModalProvider,
  BankContextProvider,
];

interface ActiveTabContentProps {
  onDeskSelectionChange: (studentIds: ReadonlySet<StudentId>) => void;
  onLabelSelectionChange: (labelId: string | null) => void;
  selectedDeskStudentIds: ReadonlySet<StudentId>;
  selectedLabelId: string | null;
}

const ActiveTabContent = ({
  onDeskSelectionChange,
  onLabelSelectionChange,
  selectedDeskStudentIds,
  selectedLabelId,
}: ActiveTabContentProps) => {
  const { activeTab } = useTabContext();
  const viewMode = activeTab.tabOptions?.viewMode ?? "list";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex-none">
        <TabOptionsRow />
      </div>
      <div className="flex-none">
        <TabTitle />
      </div>
      {viewMode === "map" ? (
        <div className="min-h-0 flex-1">
          <React.Suspense fallback={<div className="p-4 text-gray-500">Loading map…</div>}>
            <ClassroomMap
              key={activeTab.id}
              onDeskSelectionChange={onDeskSelectionChange}
              onLabelSelectionChange={onLabelSelectionChange}
              selectedLabelId={selectedLabelId}
              selectedStudentIds={selectedDeskStudentIds}
            />
          </React.Suspense>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <StudentList />
        </div>
      )}
    </div>
  );
};

const AppWorkspace = () => {
  const { activeTab } = useTabContext();
  const [selectedDeskStudentIds, setSelectedDeskStudentIds] =
    React.useState<ReadonlySet<StudentId>>(() => new Set());
  const [selectedLabelId, setSelectedLabelId] = React.useState<string | null>(null);
  const viewMode = activeTab.tabOptions?.viewMode ?? "list";
  const handleDeskSelectionChange = React.useCallback(
    (nextStudentIds: ReadonlySet<StudentId>) => {
      setSelectedDeskStudentIds((currentStudentIds) => {
        const selectionIsUnchanged =
          currentStudentIds.size === nextStudentIds.size &&
          Array.from(currentStudentIds).every((studentId) =>
            nextStudentIds.has(studentId)
          );

        return selectionIsUnchanged ? currentStudentIds : nextStudentIds;
      });
    },
    [],
  );

  React.useEffect(() => {
    setSelectedDeskStudentIds(new Set());
    setSelectedLabelId(null);
  }, [activeTab.id, viewMode]);

  return (
    <div className="App-row flex-1 flex min-h-0">
      <div className="flex-none">
        <TabList />
      </div>
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <ActiveTabContent
          onDeskSelectionChange={handleDeskSelectionChange}
          onLabelSelectionChange={setSelectedLabelId}
          selectedDeskStudentIds={selectedDeskStudentIds}
          selectedLabelId={selectedLabelId}
        />
      </div>
      <div className="flex-none">
        {viewMode === "map" ? (
          <DeskDetailsSidebar
            onDeskDeleted={() => setSelectedDeskStudentIds(new Set())}
            selectedLabelId={selectedLabelId}
            studentIds={selectedDeskStudentIds}
          />
        ) : (
          <BankSidebar />
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NestProviders providers={providers}>
      <DndProvider backend={HTML5Backend}>
        <div className="App h-screen flex flex-col overflow-hidden">
          <div className="flex-none">
            <AppHeader />
          </div>
          <AppWorkspace />
        </div>
      </DndProvider>
    </NestProviders>
  );
};

export default App;
