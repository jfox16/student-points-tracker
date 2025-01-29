import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { StudentList } from "./components/StudentList/StudentList";
import { TabList } from "./components/TabList/TabList";
import { StudentsContextProvider } from "./context/StudentsContext";
import { TabContextProvider } from "./context/TabContext";

import './App.css';
import { ModalProvider } from "./context/ModalContext";

const App: React.FC = () => {

  return (
    <ModalProvider>
      <TabContextProvider>
          <DndProvider backend={HTML5Backend}>
            <div className="App">
              <div className="App-row">

                <TabList />

                <StudentsContextProvider>
                  <StudentList />
                </StudentsContextProvider>

              </div>
            </div>
          </DndProvider>
      </TabContextProvider>
    </ModalProvider>
  );
};

export default App;
