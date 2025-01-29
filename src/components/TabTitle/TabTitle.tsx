import { useCallback } from "react";
import { HoverInput } from "../HoverInput/HoverInput"
import { useTabContext } from "../../context/TabContext";

export const TabTitle = () => {

  const { activeTab, updateTab } = useTabContext();
  
  const onTitleInputChange = useCallback((name: string) => {
    updateTab(activeTab?.id, { name });
  }, [
    activeTab?.id,
    updateTab,
  ]);

  return (
    <HoverInput
      className="text-4xl"
      onChange={onTitleInputChange}
      value={activeTab.name}
      placeholder="Type class name here..."
    />
  )
}
