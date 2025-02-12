import { useCallback } from "react";
import InfoIcon from "@mui/icons-material/Info";
import GitHubIcon from "@mui/icons-material/GitHub";

import iconSrc from "../../assets/img/trophy-icon-no-bg.png";
import { useModal } from "../../context/ModalContext";
import { cnsMerge } from "../../utils/cnsMerge";

export const AppHeader = () => {
  const { showModal } = useModal();

  const handleInfoClick = useCallback(() => {
    const content = (
      <div>
        <p className="flex items-center gap-1">
          <GitHubIcon fontSize="small" />
          <a
            className="text-blue-500"
            href="https://github.com/jfox16/student-points-tracker"
            target="_blank"
            rel="noopener noreferrer"
          >
            student-points-tracker
          </a>
        </p>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>License:</strong> MIT</p>
        <hr className="my-2" />
        <p>
          Send any questions or requests to:{" "}
          <a className="text-blue-500" href="mailto:FoxJonathanP@gmail.com">
            FoxJonathanP@gmail.com
          </a>
        </p>
        <hr className="my-2" />
        <p><strong>Keyboard Shortcuts:</strong></p>
        <ul className="list-disc pl-5">
          <li><kbd>Space</kbd> - Add points to all/selected students</li>
          <li><kbd>Enter</kbd> - Confirm modal</li>
          <li><kbd>Escape</kbd> - Close modal</li>
        </ul>
      </div>
    );

    showModal(content, { cancelText: "Close" });
  }, [showModal]);

  return (
    <div className={cnsMerge("w-full flex text-lg p-1 pr-4 bg-gray-100 border-b border-gray-400 items-center shadow-lg")}>
      <img className="w-12" src={iconSrc} />
      <h1 className="text-2xl">Student Points Tracker</h1>
      <div className="flex-1" />
      <div className={cnsMerge('opacity-30', 'hover:opacity-70')}>
        <InfoIcon className="cursor-pointer" onClick={handleInfoClick} />
      </div>
    </div>
  );
};
