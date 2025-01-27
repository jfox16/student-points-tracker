import { useAppContext } from "../../context/AppContext";
import { Tab } from "../../types/tabTypes"

interface TabCardProps {
  tab: Tab;
}

export const TabCard = (props: TabCardProps) => {
  const {} = useAppContext();
  
  return (
    <div className="TabCard">

    </div>
  )
}
