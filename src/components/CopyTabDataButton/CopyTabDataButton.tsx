import { useCallback, useState } from "react";

import { LocalStorageKey } from "../../utils/useLocalStorage"
import { PillButton } from "../PillButton/PillButton";

export const CopyTabDataButton = () => {
  const [ copied, setCopied ] = useState(false);

  const copyDataToClipboard = useCallback(async () => {
    const storedValue = localStorage.getItem(LocalStorageKey.SAVED_TABS);
    if (!storedValue) { return; }
    try {
      console.log({ storedValue });
      await navigator.clipboard.writeText(storedValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, [
  ])

  return (
    <PillButton
      className="cursor-pointer opacity-30 hover:opacity-80"
      onClick={copyDataToClipboard}
    >
      {copied ? 'Copied!' : 'Copy data'}
    </PillButton>
  );
}
