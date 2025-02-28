
import { useCallback } from "react";
import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material"

import { useAppContext } from "../../../context/AppContext";

export const EnableKeybindsToggle = () => {

  const {
    appOptions,
    updateAppOptions,
  } = useAppContext();

  const enableKeybinds = appOptions?.enableKeybinds;

  const handleChange: NonNullable<CheckboxProps['onChange']> = useCallback((_, checked) => {
    updateAppOptions({
      enableKeybinds: checked
    })
  }, [
    updateAppOptions
  ]);

  return (
    <div
      className='flex items-center'
    >
      <FormControlLabel
        control={<Checkbox checked={enableKeybinds ?? false} onChange={handleChange} />}
        label="Keybinds"
      />
    </div>
  )
}
