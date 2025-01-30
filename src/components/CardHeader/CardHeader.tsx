
import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox } from '@mui/material';
import cns from 'classnames';
import React, { useMemo } from 'react';

import { cnsMerge } from '../../utils/cnsMerge';

import './CardHeader.css';

interface CardHeaderProps {
  autoHide?: boolean;
  onClickDelete?: () => void;
  onSelectChange?: (selected: boolean) => void;
  selected?: boolean;
}

export const CardHeader = (props: CardHeaderProps) => {
  const {
    autoHide = false,
    selected = false,
    onClickDelete,
    onSelectChange,
  } = props;

  const handleSelectedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectChange?.(e.target.checked);
  }

  const isCheckboxHidden: boolean = useMemo(() => {
    return autoHide && !selected;
  }, [
    autoHide,
    selected,
  ])

  return (
    <div className={cns('CardHeader')}>
      {(onSelectChange || selected) && (
        <Checkbox
          checked={selected}
          onChange={handleSelectedChange}
          size="small"
          style={{ padding: 0 }}
          hidden={isCheckboxHidden}
        />
      )}
      <div className={cnsMerge('flex w-full', autoHide && 'hidden')}>
        {/* Left Side */}
        <div className="flex-1" />
        {/* Right Side */}
        {onClickDelete && <DeleteIcon className="icon" onClick={onClickDelete} fontSize="small" />}
      </div>
    </div>
  )
}
