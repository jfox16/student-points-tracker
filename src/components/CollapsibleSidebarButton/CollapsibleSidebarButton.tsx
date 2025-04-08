import { Tooltip } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface CollapsibleSidebarButtonProps {
  isOpen: boolean;
  onClick: () => void;
  side: 'left' | 'right';
  label: string;
}

const CloseButton = ({ onClick, side, label }: { onClick: () => void; side: 'left' | 'right'; label: string }) => (
  <Tooltip title={`Close ${label}`} placement={side} enterDelay={500}>
    <div
      className="flex text-gray-400 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer w-6 h-full"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {side === 'right' ? (
          <ArrowBackIosIcon fontSize="small" />
        ) : (
          <ArrowBackIosIcon fontSize="small" className="rotate-180" />
        )}
      </div>
    </div>
  </Tooltip>
);

const OpenButton = ({ onClick, side, label }: { onClick: () => void; side: 'left' | 'right'; label: string }) => (
  <Tooltip title={`Open ${label}`} placement={side} enterDelay={500}>
    <div
      className="flex text-gray-400 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer w-6 h-full"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {side === 'right' ? (
          <ArrowForwardIosIcon className="pl-1" fontSize="small" />
        ) : (
          <ArrowForwardIosIcon className="pr-1 rotate-180" fontSize="small" />
        )}
        <div className="flex flex-col gap-1 text-[10px] text-gray-400 tracking-wider mt-2">
          {label.toUpperCase().split(' ').map((word, wordIndex) => (
            <div key={wordIndex}>
              {word.split('').map((letter, letterIndex) => (
                <div key={`${wordIndex}-${letterIndex}`} className="text-center leading-[0.9]">{letter}</div>
              ))}
              {wordIndex < label.split(' ').length - 1 && (
                <div className="text-center leading-[0.45]">&nbsp;</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </Tooltip>
);

export const CollapsibleSidebarButton = ({ isOpen, onClick, side, label }: CollapsibleSidebarButtonProps) => {
  return isOpen ? (
    <CloseButton onClick={onClick} side={side} label={label} />
  ) : (
    <OpenButton onClick={onClick} side={side} label={label} />
  );
}; 