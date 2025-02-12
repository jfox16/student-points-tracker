
import { useCallback } from "react";
import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material"

import { useAppContext } from "../../../context/AppContext";

export const ReverseWidget = () => {

  const {
    appOptions,
    updateAppOptions,
  } = useAppContext();

  const enableKeybinds = appOptions?.reverseOrder;

  const handleChange: NonNullable<CheckboxProps['onChange']> = useCallback((_, checked) => {
    updateAppOptions({
      reverseOrder: checked
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
        label="Reverse"
      />
    </div>
  )
}
