import { useEffect } from "react";

export function useKeypress(targetKey: KeyboardEvent['key'], onPress = () => {}): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        onPress();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [targetKey, onPress]);
}
