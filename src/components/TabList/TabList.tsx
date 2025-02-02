import { useTabContext } from "../../context/TabContext";
import { CopyTabDataButton } from "../CopyTabDataButton/CopyTabDataButton";
import { TabCard } from "../TabCard/TabCard";
import { AddTabButton } from "./AddTabButton/AddTabButton";

import './TabList.css';

export const TabList = () => {
  const { tabs } = useTabContext();

  return (
    <div className="TabList">
      {tabs.map(tab => (
        <TabCard
          tab={tab}
          key={tab.id}
          
        />
      ))}
      <AddTabButton />
    </div>
  );
}
