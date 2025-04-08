import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material";
import { useCallback } from "react";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle = ({ label, checked, onChange }: ToggleProps) => {
  const handleChange: NonNullable<CheckboxProps['onChange']> = useCallback((_, checked) => {
    onChange(checked);
  }, [onChange]);

  return (
    <div className='flex items-center'>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={handleChange} />}
        label={label}
      />
    </div>
  );
}; 