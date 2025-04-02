import { useEffect } from 'react';
import { useTabStore } from '../stores/useTabStore';
import { useStudentStore } from '../stores/useStudentStore';
import { ZustandKeyBindingsManager } from './ZustandKeyBindingsManager';
import { ZustandStudentList } from './StudentList/ZustandStudentList';

/**
 * Demo component showing how to use Zustand for performance improvements
 * 
 * This demonstrates:
 * 1. Integration between tab and student stores
 * 2. Automatic initialization of data
 * 3. Performance benefits from granular updates
 */
export const ZustandDemo = () => {
  const { tabs, activeTab, setActiveTabId } = useTabStore();
  const { setStudents } = useStudentStore();

  // Initialize students from active tab
  useEffect(() => {
    setStudents(activeTab.students);
  }, [activeTab.id, activeTab.students, setStudents]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Zustand State Management Demo</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Tabs:</h2>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded ${activeTab.id === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.name || 'Unnamed Tab'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Students in {activeTab.name || 'Current Tab'}:</h2>
        <ZustandStudentList />
      </div>

      {/* This component manages keyboard shortcuts */}
      <ZustandKeyBindingsManager />
    </div>
  );
}; 