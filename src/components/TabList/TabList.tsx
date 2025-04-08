import { useCallback, useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTabContext } from "../../context/TabContext";
import { cnsMerge } from "../../utils/cnsMerge";
import { TabCard } from "../TabCard/TabCard";
import { AddTabButton } from "./AddTabButton/AddTabButton";
import { Tooltip } from '@mui/material';

import './TabList.css';

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <Tooltip title="Close classes" placement="right" enterDelay={500}>
    <div
      className="flex text-gray-400 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer w-6 h-full"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <ArrowBackIosIcon fontSize="small" />
      </div>
    </div>
  </Tooltip>
);

const OpenButton = ({ onClick }: { onClick: () => void }) => (
  <Tooltip title="Open classes" placement="right" enterDelay={500}>
    <div
      className="flex text-gray-400 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer w-6 h-full"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <ArrowForwardIosIcon className="pl-1" fontSize="small" />
        <div className="text-[10px] text-gray-400 tracking-wider mt-2">
          {"CLASSES".split('').map((letter, i) => (
            <div key={i} className="text-center leading-[0.9]">{letter}</div>
          ))}
        </div>
      </div>
    </div>
  </Tooltip>
);

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

      {open ? (
        <CloseButton onClick={toggleOpen} />
      ) : (
        <OpenButton onClick={toggleOpen} />
      )}
    </div>
  );
}
