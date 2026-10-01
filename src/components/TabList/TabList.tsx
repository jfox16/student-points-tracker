import { useCallback, useRef, useState } from 'react';
import { useSidebarLayout } from "../../context/SidebarLayoutContext";
import { useTabContext } from "../../context/TabContext";
import { cnsMerge } from "../../utils/cnsMerge";
import { ResizableSidebar } from "../ResizableSidebar/ResizableSidebar";
import { TabCard } from "../TabCard/TabCard";
import { AddTabButton } from "./AddTabButton/AddTabButton";

import './TabList.css';

export const TabList = () => {
  const { leftOpen } = useSidebarLayout();
  const { tabs } = useTabContext();
  const [ dragHoverIndex, setDragHoverIndex ] = useState(-1);
  const ignoreClickRef = useRef(false);

  const finishDrag = useCallback(() => {
    ignoreClickRef.current = true;
    setDragHoverIndex(-1);
    requestAnimationFrame(() => {
      ignoreClickRef.current = false;
    });
  }, []);

  const shouldIgnoreClick = useCallback(() => {
    if (!ignoreClickRef.current) return false;
    ignoreClickRef.current = false;
    return true;
  }, []);

  if (!leftOpen) return null;

  return (
    <ResizableSidebar
      className="bg-gray-100 border-r border-gray-400"
      defaultWidth={220}
      handleEdge="right"
      label="Resize classes"
      maxWidth={360}
      minWidth={160}
      storageKey="classes_sidebar_width"
    >
      <div className={cnsMerge("TabList h-full min-w-0 w-full")}>
        {tabs.map((tab, index) => (
          <TabCard
            dragHoverIndex={dragHoverIndex}
            index={index}
            key={tab.id}
            onDragEnd={finishDrag}
            setDragHoverIndex={setDragHoverIndex}
            shouldIgnoreClick={shouldIgnoreClick}
            tab={tab}
            tabCount={tabs.length}
          />
        ))}
        <AddTabButton />
      </div>
    </ResizableSidebar>
  );
}
