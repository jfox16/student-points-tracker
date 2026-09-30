import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox, Tooltip } from '@mui/material';

import { cnsMerge } from '../../utils/cnsMerge';

import './CardHeader.css';

interface CardHeaderProps {
  autoHide?: boolean;
  onClickDelete?: () => void;
  onClickDuplicate?: () => void;
  duplicateLabel?: string;
  onSelectChange?: (selected: boolean) => void;
  selected?: boolean;
  dragHandleRef?: React.Ref<HTMLDivElement>;
}

export const CardHeader = (props: CardHeaderProps) => {
  const {
    autoHide = false,
    selected = false,
    duplicateLabel = "Duplicate",
    onClickDelete,
    onClickDuplicate,
    onSelectChange,
    dragHandleRef,
  } = props;

  // const autoHide = false;

  const handleSelectedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectChange?.(e.target.checked);
  }

  return (
    <div className={cnsMerge('CardHeader', 'background-gray-200')}>
      {(onSelectChange || selected) && (
        <div className={cnsMerge(autoHide && 'hidden')}>
          <Checkbox
            className={cnsMerge(!selected && 'opacity-20')}
            checked={selected}
            onChange={handleSelectedChange}
            style={{ padding: 0 }}
            size={"large"}
          />
        </div>
      )}
      <div className={cnsMerge('flex w-full', autoHide && 'hidden')}>
        {/* Left Side */}
        <div
          className="flex-1"
        >
          {dragHandleRef && (
            <div
              className="w-full h-[18px] cursor-grab active:cursor-grabbing"
              ref={dragHandleRef}
            >
              {/* <div className="w-full h-[9px] border-b-3 border-gray-200" />
              <div className="w-full h-[5px] border-b-3 border-gray-200" /> */}
              {/* <div className="h-[7px]" />
              <div className="w-full bg-gray-200 h-[5px]" /> */}
            </div>
          )}
        </div>
        {/* Right Side */}
        <div className="flex items-center">
          {onClickDuplicate && (
            <Tooltip title={duplicateLabel}>
              <ContentCopyIcon
                aria-label={duplicateLabel}
                className={cnsMerge('opacity-20 cursor-pointer hover:opacity-80')}
                fontSize="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onClickDuplicate();
                }}
              />
            </Tooltip>
          )}
          {onClickDelete && <DeleteIcon
            className={cnsMerge('opacity-20 cursor-pointer hover:opacity-80')}
            onClick={onClickDelete}
            fontSize="small"
          />}
        </div>
      </div>
    </div>
  )
}
