import { useCallback, useState } from "react";

import { useTabContext } from "../../context/TabContext"
import { TabOptions } from "../../types/tabOptions.type";
import { cnsMerge } from "../../utils/cnsMerge";

import { NumberInput } from "../NumberInput/NumberInput";
import { GroupSelectWidget } from "./Widgets/GroupSelectWidget/GroupSelectWidget";
import { EnableKeybindsToggle } from "./Widgets/EnableKeybindsToggle";
import { SelectAllWidget } from "./Widgets/SelectAllWidget";
import { ResetAllWidget } from "./Widgets/ResetAllWidget";
import { DingSoundWidget } from "./Widgets/DingSoundWidget";

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

  const showOnHover = cnsMerge('opacity-70', 'hover:opacity-100')

  return (
    <div>
      <div
        className={cnsMerge(
          "TabOptionsRow",
          "flex items-center h-12 px-4 gap-4",
          "bg-gray-200 opacity-40",
          showOnHover,
        )}
      >
        {/* Columns Input */}
        <div className={cnsMerge('flex items-center', showOnHover)}>
          <div className="flex-none">Columns:</div>
          <NumberInput
            className="w-6"
            value={activeTab.tabOptions?.columns ?? 1}
            onChange={onColumnsChange}
          />
        </div>

        <GroupSelectWidget
          className={showOnHover}
        />

        <div className={showOnHover}>
          <SelectAllWidget />
        </div>

        <div className={showOnHover}>
          <ResetAllWidget />
        </div>

        <div className={showOnHover}>
          <EnableKeybindsToggle />
        </div>

        <div className={showOnHover}>
          <DingSoundWidget />
        </div>
      </div>
    </div>
  )
}
