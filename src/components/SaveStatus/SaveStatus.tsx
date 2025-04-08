import { useEffect, useState } from "react";
import { cnsMerge } from "../../utils/cnsMerge";

interface SaveStatusProps {
  isSaving: boolean;
  isSaved: boolean;
}

export const SaveStatus = ({ isSaving, isSaved }: SaveStatusProps) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (isSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  if (!isSaving && !showSaved) return null;

  return (
    <div className={cnsMerge(
      "fixed bottom-4 right-4",
      "px-4 py-2 rounded-lg",
      "bg-gray-800 text-white",
      "shadow-lg",
      "transition-opacity duration-300",
      "z-50"
    )}>
      {isSaving ? "Saving..." : "Saved!"}
    </div>
  );
}; 