import GitHubIcon from "@mui/icons-material/GitHub";
import InfoIcon from "@mui/icons-material/Info";
import { useCallback } from "react";

import { useModal } from "../../context/ModalContext";
import { cnsMerge } from "../../utils/cnsMerge";

export const InfoModal = () => {
  
  const { showModal } = useModal();

  const handleInfoClick = useCallback(() => {
    const content = (
      <div>
        <p className="flex items-center gap-1">
          <GitHubIcon fontSize="small" />
          <a
            className="text-blue-600"
            href="https://github.com/jfox16/student-points-tracker"
            target="_blank"
            rel="noopener noreferrer"
          >
            jfox16/student-points-tracker
          </a>
        </p>
        <p><strong>Version:</strong> 2.0.0</p>
        <p><strong>License:</strong> MIT</p>

        <hr className="my-2" />
        
        <p><strong>Keyboard Shortcuts:</strong></p>
        <ul className="list-disc pl-5">
          <li><kbd>Space</kbd> - Add points to all/selected students</li>
          <li><kbd>Shift</kbd> + <kbd>Space</kbd> - Subtract points from all/selected students</li>
          <li><kbd>Shift</kbd> + <kbd>Student Key</kbd> - Subtract point from specific student</li>
          <li><kbd>Space</kbd> + drag - Pan the classroom map</li>
          <li><kbd>⌘/Ctrl</kbd> + click or drag - Add desks to the selection</li>
          <li><kbd>Shift</kbd> + click or drag - Remove desks from the selection</li>
          <li><kbd>Double-click</kbd> or <kbd>⌘/Ctrl</kbd> + <kbd>A</kbd> - Select all desks</li>
          <li><kbd>Esc</kbd> - Clear the desk selection</li>
          <li><kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>1–9</kbd> - Add selected desks to a control group</li>
          <li><kbd>Enter</kbd> - Confirm modal</li>
          <li><kbd>Escape</kbd> - Close modal</li>
        </ul>

        <hr className="my-2" />

        <p><strong>Autosave:</strong> Your data is automatically saved to local storage on your device.</p>

        <hr className="my-2" />
        
        <p>Always looking for feedback!</p>
        <p>
          Send to{" "}
          <a className="text-blue-600" href="mailto:FoxJonathanP@gmail.com">
            FoxJonathanP@gmail.com
          </a>
        </p>
      </div>
    );

    showModal(content, { cancelText: "Close" });
  }, [showModal]);

  return (
    <button className={cnsMerge('text-gray-400 hover:text-gray-500 active:text-gray-700')}>
      <InfoIcon className="cursor-pointer" onClick={handleInfoClick} />
    </button>
  );
}
