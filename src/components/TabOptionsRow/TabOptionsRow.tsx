import { useCallback } from "react";

import { useTabContext } from "../../context/TabContext"
import { TabOptions } from "../../types/tabOptions.type";
import { cnsMerge } from "../../utils/cnsMerge";

import { NumberInput } from "../NumberInput/NumberInput";
import { GroupSelectWidget } from "./GroupSelectWidget";

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
  ])

  const onColumnsChange = useCallback((columns: number) => {
    updateTabOptions({
      columns
    });
  }, [
    updateTabOptions,
  ]);

  const onFontSizeChange = useCallback((fontSize: number) => {
    updateTabOptions({
      fontSize
    });
  }, [
    updateTabOptions
  ])

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
          value={activeTab.tabOptions?.columns ?? 8}
          onChange={onColumnsChange}
        />
      </div>

      {/* Columns Input */}
      <div className="flex flex-row">
        <div className="flex-none">Font Size:</div>
        <NumberInput
          className="w-6 pb-1"
          value={activeTab.tabOptions?.fontSize ?? 16}
          onChange={onFontSizeChange}
        />
      </div>
      
      <GroupSelectWidget />
    </div>
  )
}
