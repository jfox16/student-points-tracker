import React from 'react';
import { Tooltip } from '@mui/material';
import { useBankContext } from '../../../../context/BankContext';
import { useStudentContext } from '../../../../context/StudentContext';
import { useModal } from '../../../../context/ModalContext';
import { cnsMerge } from '../../../../utils/cnsMerge';
import { PillButton } from '../../../../components/PillButton/PillButton';

interface DepositPointsWidgetProps {
  className?: string;
}

export const DepositPointsWidget: React.FC<DepositPointsWidgetProps> = ({ className }) => {
  const { bankedPoints, depositPoints } = useBankContext();
  const { students, updateAllStudents } = useStudentContext();
  const { showModal } = useModal();

  const handleDeposit = () => {
    showModal(
      <div className="text-center">
        <p className="mb-4">Are you sure you want to deposit all student points to the bank?</p>
        <p className="text-sm text-gray-600">This will set all current points to 0.</p>
      </div>,
      {
        onAccept: () => {
          // Calculate all banked points updates
          const bankedPointsUpdates = students.reduce((acc, student) => {
            if (student.points > 0) {
              acc[student.id] = (bankedPoints[student.id] || 0) + student.points;
            }
            return acc;
          }, {} as { [key: string]: number });

          // Update all banked points at once
          depositPoints(bankedPointsUpdates);

          // Reset all student points to 0
          updateAllStudents({ points: 0 });
        },
        acceptText: 'Deposit',
        cancelText: 'Cancel'
      }
    );
  };

  return (
    <Tooltip title="Deposit all student points to the bank" enterDelay={1000}>
      <div>
        <PillButton
          className={className}
          onClick={handleDeposit}
        >
          Deposit Points
        </PillButton>
      </div>
    </Tooltip>
  );
}; 