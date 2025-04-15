import { createContext, useContext, useEffect, useState } from 'react';

interface UIContextValue {
  isShiftPressed: boolean;
  isMobile: boolean;
}

const UIContext = createContext<UIContextValue>({
  isShiftPressed: false,
  isMobile: false,
});

export const useUIContext = () => useContext(UIContext);

interface UIContextProviderProps {
  children: React.ReactNode;
}

export const UIContextProvider = ({ children }: UIContextProviderProps) => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle shift key state
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for mobile
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <UIContext.Provider value={{ isShiftPressed, isMobile }}>
      {children}
    </UIContext.Provider>
  );
}; 