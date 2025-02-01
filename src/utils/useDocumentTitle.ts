
import { useEffect, useState } from "react";

const useDocumentTitle = (initialTitle?: string) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return [title, setTitle] as const;
};

export default useDocumentTitle;
