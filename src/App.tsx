import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { AppHeader } from "./components/AppHeader/AppHeader";
import { BankSidebar } from "./components/BankSidebar/BankSidebar";
import { StudentList } from "./components/StudentList/StudentList";
import { TabList } from "./components/TabList/TabList";
import { TabOptionsRow } from "./components/TabOptionsRow/TabOptionsRow";
import { TabTitle } from "./components/TabTitle/TabTitle";
import { ZustandDemo } from "./components/ZustandDemo";

import { AppContextProvider } from "./context/AppContext";
import { BankContextProvider } from "./context/BankContext";
import { ModalProvider } from "./context/ModalContext";
import { SoundContextProvider } from "./context/SoundContext";
import { StudentContextProvider } from "./context/StudentContext";
import { TabContextProvider } from "./context/TabContext";

import { NestProviders } from "./utils/NestProviders";

import './App.css';
import './output.css'; // import generated tailwind styles

const providers = [
  AppContextProvider,
  TabContextProvider,
  StudentContextProvider,
  SoundContextProvider,
  ModalProvider,
  BankContextProvider,
];

const MainApp: React.FC = () => {
  return (
    <NestProviders providers={providers}>
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
      </DndProvider>
    </NestProviders>
  );
};

const App: React.FC = () => {
  return (
    <Router basename="/student-points-tracker">
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/demo" element={<ZustandDemo />} />
      </Routes>
    </Router>
  );
};

export default App;
