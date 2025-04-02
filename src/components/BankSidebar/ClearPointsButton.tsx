import React from 'react';
import { PillButton } from '../PillButton/PillButton';

interface ClearPointsButtonProps {
  onClick: () => void;
  onDeposit: () => void;
}

export const ClearPointsButton: React.FC<ClearPointsButtonProps> = ({ onClick, onDeposit }) => {
  return (
    <div className="pt-2 border-t border-gray-200 flex gap-2">
      <PillButton
        onClick={onClick}
        className="flex-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
      >
        Reset Points
      </PillButton>
      <PillButton
        onClick={onDeposit}
        className="flex-1 text-sm text-gray-500 hover:text-green-500 transition-colors"
      >
        Deposit Points
      </PillButton>
    </div>
  );
}; 