import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const LEFT_OPEN_KEY = "classes_sidebar_open";
const RIGHT_OPEN_KEY = "right_sidebar_open";

const readOpen = (key: string) => localStorage.getItem(key) !== "false";

interface SidebarLayoutValue {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
}

const SidebarLayoutContext = createContext<SidebarLayoutValue>({
  leftOpen: true,
  rightOpen: true,
  toggleLeft: () => {},
  toggleRight: () => {},
});

export const SidebarLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [leftOpen, setLeftOpen] = useState(() => readOpen(LEFT_OPEN_KEY));
  const [rightOpen, setRightOpen] = useState(() => readOpen(RIGHT_OPEN_KEY));

  const toggleLeft = useCallback(() => {
    setLeftOpen((open) => {
      const nextOpen = !open;
      localStorage.setItem(LEFT_OPEN_KEY, String(nextOpen));
      return nextOpen;
    });
  }, []);

  const toggleRight = useCallback(() => {
    setRightOpen((open) => {
      const nextOpen = !open;
      localStorage.setItem(RIGHT_OPEN_KEY, String(nextOpen));
      return nextOpen;
    });
  }, []);

  return (
    <SidebarLayoutContext.Provider
      value={{ leftOpen, rightOpen, toggleLeft, toggleRight }}
    >
      {children}
    </SidebarLayoutContext.Provider>
  );
};

export const useSidebarLayout = () => useContext(SidebarLayoutContext);
