import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { AppHeader } from "./components/AppHeader/AppHeader";
import { BankSidebar } from "./components/BankSidebar/BankSidebar";
import { StudentList } from "./components/StudentList/StudentList";
import { TabList } from "./components/TabList/TabList";
import { TabOptionsRow } from "./components/TabOptionsRow/TabOptionsRow";
import { TabTitle } from "./components/TabTitle/TabTitle";
import { ZustandKeyBindingsManager } from "./components/ZustandKeyBindingsManager";

import './App.css';
import './output.css'; // import generated tailwind styles

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App h-screen flex flex-col overflow-hidden">
        <div className="flex-none">
          <AppHeader />
        </div>
        <div className="App-row flex-1 flex min-h-0">
          <div className="flex-none">
            <TabList />
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <TabOptionsRow />
              <TabTitle />
              <StudentList />
            </div>
          </div>
          <div className="flex-none">
            <BankSidebar />
          </div>
        </div>
      </div>
      
      <ZustandKeyBindingsManager />
    </DndProvider>
  );
};

export default App;
