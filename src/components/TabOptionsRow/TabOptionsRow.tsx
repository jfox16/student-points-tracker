import { useCallback, useMemo } from "react";
import { useTabContext } from "../../context/TabContext"
import { NumberInput } from "../NumberInput/NumberInput";
import { TabOptions } from "../../types/tabTypes";

export const TabOptionsRow = () => {
  const { activeTab, updateTab } = useTabContext();
  
  const updateTabOptions = useCallback((changes: Partial<TabOptions>) => {
    updateTab(activeTab.id, {
      tabOptions: { ...activeTab.tabOptions, ...changes }
    })
  }, [
    updateTab,
  ])

  const columnsValue = useMemo(() => {
    return activeTab.tabOptions?.columns ?? 8;
  }, [
    activeTab.tabOptions?.columns
  ])

  const onColumnsChange = useCallback((columns: number) => {
    updateTabOptions({
      columns: Math.max(1, Math.min(columns, 16))
    });
  }, [
    updateTabOptions,
  ])

  return (
    <div
      className="flex p-4"
    >
      <div className="flex flex-row">
        <div className="flex-none"># of columns:</div>
        <NumberInput
          className="w-5"
          value={columnsValue}
          onChange={onColumnsChange}
        />
      </div>
    </div>
  )
}
