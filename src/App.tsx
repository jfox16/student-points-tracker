import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { SiteHeader } from "./components/SiteHeader/SiteHeader";
import { StudentList } from "./components/StudentList/StudentList";
import { TabList } from "./components/TabList/TabList";
import { TabOptionsRow } from "./components/TabOptionsRow/TabOptionsRow";
import { TabTitle } from "./components/TabTitle/TabTitle";

import { AppContextProvider } from "./context/AppContext";
import { ModalProvider } from "./context/ModalContext";
import { SoundContextProvider } from "./context/SoundContext";
import { StudentContextProvider } from "./context/StudentContext";
import { TabContextProvider } from "./context/TabContext";

import './App.css';
import './output.css'; // import generated tailwind styles
import { NestProviders } from "./utils/NestProviders";

const providers = [
  AppContextProvider,
  TabContextProvider,
  StudentContextProvider,
  SoundContextProvider,
  ModalProvider,
];

const App: React.FC = () => {
  return (
    <NestProviders providers={providers}>
      <DndProvider backend={HTML5Backend}>
        <div className="App h-screen flex flex-col">

          <SiteHeader />

          <div className="App-row h-full">

            <TabList />
              <div className="flex flex-col gap-4">
                <TabOptionsRow />
                <TabTitle />
                <StudentList />
              </div>
          </div>
        </div>
      </DndProvider>
    </NestProviders>
  );
};

export default App;
