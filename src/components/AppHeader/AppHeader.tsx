import { Link } from "react-router-dom";
import iconSrc from "../../assets/img/trophy-icon-no-bg.png";
import { cnsMerge } from "../../utils/cnsMerge";
import { InfoModal } from "./InfoModal";

export const AppHeader = () => {

  return (
    <div className={cnsMerge("w-full flex text-lg p-1 pr-4 bg-gray-100 border-b border-gray-400 items-center shadow-lg")}>
      <img className="w-12" src={iconSrc} />
      <h1 className="text-2xl">Student Points Tracker</h1>
      <div className="flex-1" />
      <Link to="/demo" className="mr-4 text-blue-600 hover:text-blue-800">Zustand Demo</Link>
      <InfoModal />
    </div>
  );
};
