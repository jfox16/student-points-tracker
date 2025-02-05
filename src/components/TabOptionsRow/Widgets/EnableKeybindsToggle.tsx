
import { useCallback } from "react";
import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material"

import { useTabContext } from "../../../context/TabContext"

export const EnableKeybindsToggle = () => {

  const {
    activeTab,
    updateActiveTab,
  } = useTabContext();

  const enableKeybinds = activeTab.tabOptions?.enableKeybinds;

  const handleChange: NonNullable<CheckboxProps['onChange']> = useCallback((_, checked) => {
    updateActiveTab({
      tabOptions: {
        ...activeTab.tabOptions,
        enableKeybinds: checked
      }
    });
  }, [
    activeTab.tabOptions,
    updateActiveTab,
  ]);

  return (
    <div
      className='flex items-center'
    >
      <FormControlLabel
        control={<Checkbox checked={enableKeybinds ?? false} onChange={handleChange} />}
        label="Enable keybinds"
      />
    </div>
  )
}
