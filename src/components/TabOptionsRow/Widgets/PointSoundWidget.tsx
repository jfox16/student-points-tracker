
import { MenuItem, Select, SelectChangeEvent } from "@mui/material"

import { useAppContext } from "../../../context/AppContext";
import { PointSoundName } from "../../../context/SoundContext";

interface PointSoundWidgetProps {
  fullWidth?: boolean;
}

export const PointSoundWidget = ({ fullWidth = false }: PointSoundWidgetProps) => {
  const {
    appOptions,
    updateAppOptions,
  } = useAppContext();

  const pointSound = appOptions.pointSound ?? 'none';

  const handleChange = (event: SelectChangeEvent<PointSoundName>) => {
    const value = event.target.value;
    updateAppOptions({ pointSound: value as PointSoundName });
  };

  return (
    <Select
      fullWidth={fullWidth}
      SelectDisplayProps={{ "aria-label": "Point sound" }}
      onChange={handleChange}
      size="small"
      sx={{
        height: 40,
        backgroundColor: "#fff",
        ".MuiSelect-select": {
          display: "flex",
          alignItems: "center",
        },
      }}
      value={pointSound}
    >
      <MenuItem value="none">No point sound</MenuItem>
      <MenuItem value="pop">🫧 Pop</MenuItem>
      <MenuItem value="ding">🔔 Ding</MenuItem>
      <MenuItem value="bark">🐶 Bark</MenuItem>
      <MenuItem value="meow">🐱 Meow</MenuItem>
    </Select>
  )
}
