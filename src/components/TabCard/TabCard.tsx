import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import cns from 'classnames';
import { useCallback, useState } from "react";
import { useTabContext } from "../../context/TabContext";
import { Tab } from "../../types/tab.type"
import './TabCard.css';
import { HoverInput } from '../HoverInput/HoverInput';
import { CardHeader } from '../CardHeader/CardHeader';
import { useModal } from '../../context/ModalContext';
import { useCardDrag } from '../../hooks/useCardDrag';


interface TabCardProps {
  dragHoverIndex: number;
  index: number;
  onDragEnd: () => void;
  setDragHoverIndex: (dragHoverIndex: number) => void;
  shouldIgnoreClick: () => boolean;
  tab: Tab;
  tabCount: number;
}

export const TabCard = ({
  dragHoverIndex,
  index,
  onDragEnd,
  setDragHoverIndex,
  shouldIgnoreClick,
  tab,
  tabCount,
}: TabCardProps) => {
  const { showModal } = useModal();
  const { activeTab, deleteTab, duplicateTab, moveTab, setActiveTabId, updateTab } = useTabContext();
  const [ isCardHovered, setIsCardHovered ] = useState(false);
  const {
    dragObjectRef,
    dragHandleRef,
    isDragging,
  } = useCardDrag({
    axis: "vertical",
    dragHoverIndex,
    index,
    item: tab,
    moveCard: moveTab,
    onDragEnd,
    setDragHoverIndex,
    type: "TAB",
  });

  const onClick = useCallback(() => {
    if (shouldIgnoreClick()) return;
    setActiveTabId(tab.id);
  }, [
    setActiveTabId,
    shouldIgnoreClick,
    tab.id,
  ])
  
  const onNameChange = useCallback((name: string) => {
    updateTab(tab.id, { name });
  }, [
    tab.id,
    updateTab,
  ]);

  const duplicateThisTab = useCallback(() => {
    duplicateTab(tab.id);
  }, [
    duplicateTab,
    tab.id,
  ]);

  const openDeleteTabModal = useCallback(() => {
    const tabName = tab.name ? ` (${tab.name})` : '';
    showModal(
      `Are you sure you want to delete this tab?${tabName}`,
      { onAccept: () => deleteTab(tab.id) }
    );
  }, [
    deleteTab,
    showModal,
    tab.id,
    tab.name,
  ])

  const isLastTab = index === tabCount - 1;

  return (
    <div
      className={cns(
        "TabCard",
        { active: activeTab?.id === tab.id },
        isDragging && "TabCard--dragging",
        dragHoverIndex === index && "TabCard--dropBefore",
        dragHoverIndex === tabCount && isLastTab && "TabCard--dropAfter",
      )}
      onClick={onClick}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      ref={dragObjectRef}
    >
      <div
        aria-label="Drag to reorder"
        className="TabCard__handle"
        ref={dragHandleRef}
      >
        <DragIndicatorIcon sx={{ fontSize: 18 }} />
      </div>
      <CardHeader
        autoHide={!isCardHovered}
        duplicateLabel={`Duplicate ${tab.name || "class"}`}
        onClickDelete={openDeleteTabModal}
        onClickDuplicate={duplicateThisTab}
      />
      <HoverInput
        value={tab.name}
        onChange={onNameChange}
        placeholder="Class name here..."
      />
    </div>
  )
}
