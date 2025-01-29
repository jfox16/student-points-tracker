import cns from 'classnames';
import { useCallback, useState } from "react";
import { useTabContext } from "../../context/TabContext";
import { Tab } from "../../types/tabTypes"
import './TabCard.css';
import { HoverInput } from '../HoverInput/HoverInput';
import { CardHeader } from '../CardHeader/CardHeader';
import { useModal } from '../../context/ModalContext';


interface TabCardProps {
  tab: Tab;
}

export const TabCard = ({
  tab,
}: TabCardProps) => {
  const { showModal } = useModal();
  const { activeTab, setActiveTabId, updateTab, deleteTab } = useTabContext();
  const [ isCardHovered, setIsCardHovered ] = useState(false);

  const onClick = useCallback(() => {
    setActiveTabId(tab.id);
  }, [
    tab,
    setActiveTabId,
  ])
  
  const onNameChange = useCallback((name: string) => {
    updateTab(tab.id, { name });
  }, [
    tab.id,
    updateTab,
  ]);

  const openDeleteTabModal = useCallback(() => {
    const tabName = tab.name ? ` (${tab.name})` : '';
    showModal(
      `Are you sure you want to delete this tab?${tabName}`,
      () => deleteTab(tab.id)
    );
  }, [
    deleteTab,
    showModal,
    tab.id,
    tab.name,
  ])


  return (
    <div
      className={cns(
        "TabCard",
        { active: activeTab?.id === tab.id }
      )}
      onClick={onClick}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <CardHeader
        hide={!isCardHovered}
        onClickDelete={openDeleteTabModal}
      />
      <HoverInput
        value={tab.name}
        onChange={onNameChange}
        placeholder="Class name here..."
      />
    </div>
  )
}
