
import { MenuItem, Select, SelectChangeEvent } from "@mui/material"

import { useAppContext } from "../../../context/AppContext";
import { PointSoundName } from "../../../context/SoundContext";

export const PointSoundWidget = () => {

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
    <div className="flex items-center gap-2">
      <Select
        value={pointSound}
        onChange={handleChange}
        style={{ height: 40 }}
      >
        <MenuItem value="none">No point sound</MenuItem>
        <MenuItem value="pop">Pop</MenuItem>
        <MenuItem value="ding">Ding</MenuItem>
        <MenuItem value="bark">Bark</MenuItem>
        <MenuItem value="meow">Meow</MenuItem>
      </Select>
    </div>
  )
}
