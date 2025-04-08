import React from 'react';
import { Tooltip } from '../Tooltip/Tooltip';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { cnsMerge } from '../../utils/cnsMerge';

interface CollapseButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({ isOpen, onToggle }) => {
  return isOpen ? (
    <Tooltip text="Close points bank" placement="right">
      <div
        className={cnsMerge('flex text-gray-400 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer w-6 h-full', isOpen && 'w-3')}
        onClick={onToggle}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <ArrowForwardIosIcon fontSize="small" />
        </div>
      </div>
    </Tooltip>
  ) : (
    <Tooltip text="Open points bank" placement="right">
      <div
        className={cnsMerge('flex text-gray-400 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer w-6 h-full', isOpen && 'w-3')}
        onClick={onToggle}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <ArrowBackIosIcon className="pl-1" fontSize="small" />
          <div className="flex flex-col gap-2 text-[10px] text-gray-400 tracking-wider mt-2">
            <div>
              {"POINTS".split('').map((letter, i) => (
                <div key={i} className="text-center leading-[0.9]">{letter}</div>
              ))}
            </div>
            <div>
              {"BANK".split('').map((letter, i) => (
                <div key={i} className="text-center leading-[0.9]">{letter}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}; 