import cns from 'classnames';
import { useCallback, useState } from "react";
import { useTabStore } from "../../stores/useTabStore";
import { useModalStore } from "../../stores/useModalStore";
import { Tab } from "../../types/tab.type"
import './TabCard.css';
import { HoverInput } from '../HoverInput/HoverInput';
import { CardHeader } from '../CardHeader/CardHeader';

interface TabCardProps {
  tab: Tab;
}

export const TabCard = ({
  tab,
}: TabCardProps) => {
  const { openModal } = useModalStore();
  const { activeTab, setActiveTabId, updateTab, deleteTab } = useTabStore();
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
    openModal({
      title: 'Delete Tab',
      content: `Are you sure you want to delete this tab?${tabName}`,
      onConfirm: () => deleteTab(tab.id)
    });
  }, [
    deleteTab,
    openModal,
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
        autoHide={!isCardHovered}
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
