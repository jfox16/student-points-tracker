import { useAppContext } from "../../context/AppContext";
import { TabCard } from "../TabCard/TabCard";

export const TabSidebar = () => {
  const { activeTabId, tabs } = useAppContext();

  return (
    <div className="TabSidebar">
      {tabs.map(tab => <TabCard tab={tab} key={tab.id}/>)}
    </div>
  );
}
