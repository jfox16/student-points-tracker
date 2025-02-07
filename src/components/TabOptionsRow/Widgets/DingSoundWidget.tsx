
import { useCallback } from "react";
import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material"

import { useAppContext } from "../../../context/AppContext";

export const DingSoundWidget = () => {

  const {
    appOptions,
    updateAppOptions,
  } = useAppContext();

  const enableDingSound = appOptions.enableDingSound;

  const handleChange: NonNullable<CheckboxProps['onChange']> = useCallback((_, checked) => {
    updateAppOptions({
      enableDingSound: checked
    })
  }, [
    updateAppOptions,
  ]);

  return (
    <div
      className='flex items-center'
    >
      <FormControlLabel
        control={<Checkbox checked={enableDingSound ?? false} onChange={handleChange} />}
        label="Ding sound"
      />
    </div>
  )
}
