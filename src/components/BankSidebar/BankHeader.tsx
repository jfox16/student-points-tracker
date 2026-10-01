import React from 'react';

interface BankHeaderProps {
  compact?: boolean;
  totalPoints: number;
}

export const BankHeader: React.FC<BankHeaderProps> = ({
  compact = false,
  totalPoints,
}) => {
  if (compact) {
    return (
      <div className="flex items-baseline justify-between gap-2">
        <span className="EditableField__label">Points Bank</span>
        <span className="text-sm font-semibold text-gray-900">
          Class Total: {totalPoints}
        </span>
      </div>
    );
  }

  return (
    <div className="flex-none border-b border-gray-400 pb-2">
      <div className="text-2xl font-bold text-gray-900">Points Bank</div>
      <div className="text-lg font-semibold text-gray-900">Class Total: {totalPoints}</div>
    </div>
  );
}; 