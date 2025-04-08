import React from 'react';

interface BankHeaderProps {
  totalPoints: number;
}

export const BankHeader: React.FC<BankHeaderProps> = ({ totalPoints }) => {
  return (
    <div className="flex-none border-b border-gray-400">
      <div className="text-2xl font-bold text-gray-900">Points Bank</div>
      <div className="text-lg font-semibold text-gray-900">Class Total: {totalPoints}</div>
    </div>
  );
}; 