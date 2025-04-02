import { useCallback, useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { useTabContext } from "../../context/TabContext";
import { cnsMerge } from "../../utils/cnsMerge";
import { TabCard } from "../TabCard/TabCard";
import { AddTabButton } from "./AddTabButton/AddTabButton";
import { Tooltip } from "../Tooltip/Tooltip";

import './TabList.css';

export const TabList = () => {
  const { tabs } = useTabContext();
  const [ open, setOpen ] = useState(true);

  const toggleOpen = useCallback(() => {
    setOpen(!open)
  }, [
    open,
    setOpen,
  ])

  return (
    <div
      className="h-full flex bg-gray-100 border-r border-gray-400"
    >
      <div className={cnsMerge("TabList h-full flex pr-2", !open && 'hidden')}>
        {tabs.map(tab => (
          <TabCard
            tab={tab}
            key={tab.id}
          />
        ))}
        <AddTabButton />
      </div>

      <div
        className={cnsMerge('flex text-gray-400 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer w-6 h-full', open && 'w-3')}
        onClick={toggleOpen}
      >
        {open
          ? <ArrowBackIosIcon fontSize="small" />
          : <ArrowForwardIosIcon className="pl-1" fontSize="small" />
        }
      </div>
    </div>
  );
}
