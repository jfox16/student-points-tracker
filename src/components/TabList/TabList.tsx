import { useCallback, useState } from 'react';
import { useTabContext } from "../../context/TabContext";
import { cnsMerge } from "../../utils/cnsMerge";
import { TabCard } from "../TabCard/TabCard";
import { AddTabButton } from "./AddTabButton/AddTabButton";
import { CollapsibleSidebarButton } from '../CollapsibleSidebarButton/CollapsibleSidebarButton';

import './TabList.css';

export const TabList = () => {
  const { tabs } = useTabContext();
  const [ open, setOpen ] = useState(true);

  const toggleOpen = useCallback(() => {
    setOpen(!open)
  }, [
    open,
    setOpen,
  ])

  return (
    <div
      className="h-full flex bg-gray-100 border-r border-gray-400"
    >
      <div className={cnsMerge("TabList h-full flex pr-2", !open && 'hidden')}>
        {tabs.map(tab => (
          <TabCard
            tab={tab}
            key={tab.id}
          />
        ))}
        <AddTabButton />
      </div>

      <CollapsibleSidebarButton
        isOpen={open}
        onClick={toggleOpen}
        side="right"
        label="Classes"
      />
    </div>
  );
}
