import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { StudentList } from "./components/StudentList/StudentList";
import { TabList } from "./components/TabList/TabList";
import { TabTitle } from "./components/TabTitle/TabTitle";

import { ModalProvider } from "./context/ModalContext";
import { StudentsContextProvider } from "./context/StudentsContext";
import { TabContextProvider } from "./context/TabContext";

import './App.css';
// import generated tailwind styles
import './output.css';
import { TabOptionsRow } from "./components/TabOptionsRow/TabOptionsRow";

const App: React.FC = () => {

  return (
    <ModalProvider>
      <TabContextProvider>
          <DndProvider backend={HTML5Backend}>
            <div className="App h-screen">
              <div className="App-row">

                <TabList />

                <StudentsContextProvider>
                  <div className="flex flex-col">
                    <TabOptionsRow />
                    <TabTitle />
                    <StudentList />
                  </div>
                </StudentsContextProvider>

              </div>
            </div>
          </DndProvider>
      </TabContextProvider>
    </ModalProvider>
  );
};

export default App;
