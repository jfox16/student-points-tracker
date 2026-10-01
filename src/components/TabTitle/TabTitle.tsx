import { useCallback } from "react";

import { useTabContext } from "../../context/TabContext";
import { HoverInput } from "../HoverInput/HoverInput";

export const TabTitle = () => {
  const { activeTab, updateTab } = useTabContext();

  const onTitleInputChange = useCallback((name: string) => {
    updateTab(activeTab?.id, { name });
  }, [
    activeTab?.id,
    updateTab,
  ]);

  return (
    <div className="px-4">
      <HoverInput
        className="min-w-0 text-4xl"
        onChange={onTitleInputChange}
        value={activeTab.name}
        placeholder="Type class name here..."
      />
    </div>
  );
};
