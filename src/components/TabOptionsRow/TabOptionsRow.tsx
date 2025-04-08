import { useCallback, useState, useRef, useEffect } from "react";

import { useTabContext } from "../../context/TabContext"
import { TabOptions } from "../../types/tabOptions.type";
import { cnsMerge } from "../../utils/cnsMerge";

import { NumberInput } from "../NumberInput/NumberInput";
import { GroupSelectWidget } from "./Widgets/GroupSelectWidget/GroupSelectWidget";
import { EnableKeybindsToggle } from "./Widgets/EnableKeybindsToggle";
import { PointSoundWidget } from "./Widgets/PointSoundWidget";
import { ResetAllWidget } from "./Widgets/ResetAllWidget";
import { SelectAllWidget } from "./Widgets/SelectAllWidget";
import { ReverseWidget } from "./Widgets/ReverseWidget";
import { DepositPointsWidget } from "./Widgets/DepositPointsWidget/DepositPointsWidget";

export const TabOptionsRow = () => {
  const { activeTab, updateTab } = useTabContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  
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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (isHoveredRef.current) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const showOnHover = cnsMerge('opacity-70', 'hover:opacity-100')

  return (
    <div 
      ref={scrollContainerRef}
      className="overflow-x-auto"
    >
      <div
        className={cnsMerge(
          "TabOptionsRow",
          "flex items-center h-14 px-4 pt-1 gap-4",
          "bg-gray-200",
          "min-w-max",
          "relative",
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
          <DepositPointsWidget />
        </div>

        <div className={showOnHover}>
          <EnableKeybindsToggle />
        </div>
        
        <div className={showOnHover}>
          <ReverseWidget />
        </div>

        <div className={showOnHover}>
          <PointSoundWidget />
        </div>
      </div>
    </div>
  )
}
