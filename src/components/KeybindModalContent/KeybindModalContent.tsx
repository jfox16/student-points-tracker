import React, { useState, useEffect } from 'react';
import { Student } from '../../types/student.type';
import { useKeybindStore } from '../../stores/useKeybindStore';

interface KeybindModalContentProps {
  student: Student;
  onClose: () => void;
}

export const KeybindModalContent: React.FC<KeybindModalContentProps> = ({ student, onClose }) => {
  const [key, setKey] = useState<string>('');
  const { keyBindingsMap, setKeyBinding } = useKeybindStore();

  useEffect(() => {
    const currentKey = keyBindingsMap[student.id];
    if (currentKey) {
      setKey(currentKey);
    }
  }, [student.id, keyBindingsMap]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const newKey = e.key.toUpperCase();
    setKey(newKey);
    setKeyBinding(student.id, newKey);
    onClose();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h3 className="text-lg font-semibold">Set Keybind for {student.name}</h3>
      <p className="text-sm text-gray-600">Press any key to set the keybind</p>
      <div
        className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold"
        tabIndex={0}
        onKeyDown={handleKeyPress}
      >
        {key || '?'}
      </div>
    </div>
  );
}; 