/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
import classNames from 'classnames';
import {faCog} from '@fortawesome/free-solid-svg-icons';
import React, {useRef, useCallback, useMemo} from 'react';
import {DndContext, PointerSensor, closestCenter, useSensor, useSensors} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {SortableContext, arrayMove, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import Icon from '../../../common/components/Icon.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import formatMessage from '../../../i18n/index.js';
import useAutoSidebarScroll from '../hooks/AutoSidebarScroll.jsx';
import settings from '../../settings/index.js';
import {SettingPanelIds} from '../../settings/stores/SettingStore.jsx';
import styles from './Sidebar.module.css';
import {useElementSize} from '@mantine/hooks';

function SortableSidebarItem({category, section, onClick}) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: category.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      data-draggable
      onClick={() => onClick(category.id)}
      onKeyDown={() => onClick(category.id)}
      className={classNames(styles.navItem, {
        [styles.active]: category.id === section,
        [styles.dragging]: isDragging,
      })}
      {...attributes}
      {...listeners}>
      {category.icon}
    </div>
  );
}

function Sidebar({section, onClick, categories, className, onClose}) {
  const {height, ref} = useElementSize();
  const {height: settingsButtonHeight, ref: settingsButtonRef} = useElementSize();
  const containerRef = useRef(null);
  const middleCategories = categories.middle;

  const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}));

  const handleDragEnd = useCallback(
    (event) => {
      const {active, over} = event;
      if (over == null || active.id === over.id) {
        return;
      }

      const oldIndex = middleCategories.findIndex((c) => c.id === active.id);
      const newIndex = middleCategories.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(middleCategories, oldIndex, newIndex);

      emoteMenuViewStore.setCategoryOrder(reordered);
    },
    [middleCategories]
  );

  useAutoSidebarScroll(section, containerRef, Object.values(categories).flat(), height - settingsButtonHeight);

  const handleOpenSettings = useCallback(() => {
    settings.openSettings({scrollToSettingPanelId: SettingPanelIds.EMOTE_MENU});
    onClose();
  }, [onClose]);

  function createCategories(arr) {
    return arr.map((category) => (
      <div
        key={category.id}
        role="button"
        onClick={() => onClick(category.id)}
        onKeyDown={() => onClick(category.id)}
        className={classNames(styles.navItem, {
          [styles.active]: category.id === section,
        })}>
        {category.icon}
      </div>
    ));
  }

  const sortableIds = useMemo(() => middleCategories.map((c) => c.id), [middleCategories]);

  return (
    <div ref={ref} className={classNames(styles.sidebar, className)}>
      <div className={styles.content} ref={containerRef}>
        <div className={styles.contentInner}>
          <div className={styles.categoryList}>
            {createCategories(categories.top)}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {middleCategories.map((category) => (
                  <SortableSidebarItem key={category.id} category={category} section={section} onClick={onClick} />
                ))}
              </SortableContext>
            </DndContext>
            {createCategories(categories.bottom)}
          </div>
          <button
            type="button"
            ref={settingsButtonRef}
            className={styles.settingsButton}
            onClick={handleOpenSettings}
            aria-label={formatMessage({defaultMessage: 'Emote menu settings'})}>
            <Icon icon={faCog} size={16} className={styles.settingsIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(
  Sidebar,
  (prevProps, nextProps) =>
    prevProps.categories === nextProps.categories &&
    prevProps.section === nextProps.section &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick
);
