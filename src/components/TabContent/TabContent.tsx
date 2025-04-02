import React from 'react';
import { TabOptionsRow } from '../TabOptionsRow/TabOptionsRow';
import { TabTitle } from '../TabTitle/TabTitle';
import { StudentList } from '../StudentList/StudentList';

export const TabContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <TabOptionsRow />
      <TabTitle />
      <StudentList />
    </div>
  );
}; 