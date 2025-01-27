import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TabContextProvider } from "./context/TabContext";
import { StudentList } from "./components/StudentList/StudentList";

const App: React.FC = () => {

  return (
    <TabContextProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="App-row">
          
          <StudentList />
        </div>
      </DndProvider>
    </TabContextProvider>
  );
};

export default App;
