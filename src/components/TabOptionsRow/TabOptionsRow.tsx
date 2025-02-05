import { useCallback } from "react";

import { useTabContext } from "../../context/TabContext"
import { TabOptions } from "../../types/tabOptions.type";
import { cnsMerge } from "../../utils/cnsMerge";

import { NumberInput } from "../NumberInput/NumberInput";
import { GroupSelectWidget } from "./Widgets/GroupSelectWidget/GroupSelectWidget";
import { AllActionsWidget } from "./Widgets/AllActionsWidget";
import { DEFAULT_NUM_COLUMNS } from "../../context/StudentsContext";

export const TabOptionsRow = () => {
  const { activeTab, updateTab } = useTabContext();
  
  const updateTabOptions = useCallback((changes: Partial<TabOptions>) => {
    updateTab(activeTab.id, {
      tabOptions: { ...activeTab.tabOptions, ...changes }
    })
  }, [
    activeTab.id,
    activeTab.tabOptions,
    updateTab,
  ]);

  const onColumnsChange = useCallback((columns: number) => {
    updateTabOptions({
      columns
    });
  }, [
    updateTabOptions,
  ]);

  return (
    <div
      className={cnsMerge(
        "TabOptionsRow",
        "flex p-4 gap-4",
        "bg-gray-200",
      )}
    >
      {/* Columns Input */}
      <div className="flex flex-row">
        <div className="flex-none">Columns:</div>
        <NumberInput
          className="w-6 pb-1"
          value={activeTab.tabOptions?.columns ?? DEFAULT_NUM_COLUMNS}
          onChange={onColumnsChange}
        />
      </div>

      {/* Font Input */}
      {/* <div className="flex flex-row">
        <div className="flex-none">Font Size:</div>
        <NumberInput
          className="w-6 pb-1"
          value={activeTab.tabOptions?.fontSize ?? 16}
          onChange={onFontSizeChange}
        />
      </div> */}
      
      <GroupSelectWidget />

      <AllActionsWidget />
    </div>
  )
}
