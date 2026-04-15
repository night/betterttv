/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
import classNames from 'classnames';
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {DndContext, PointerSensor, closestCenter, useSensor, useSensors} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {SortableContext, arrayMove, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import Emote from '../../../common/components/Emote.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import {EMOTE_MENU_SIDEBAR_ROW_HEIGHT} from '../../../constants.js';
import emojis from '../../emotes/emojis.js';
import useAutoSidebarScroll from '../hooks/AutoSidebarScroll.jsx';
import styles from './Sidebar.module.css';
import {useElementSize} from '@mantine/hooks';

const DEFAULT_EMOJI = '\ud83d\ude03'; // Smiley face

const HOVER_EMOJI = [
  '\uD83E\uDD8B', // 🦋 (B)utterfly
  '\uD83C\uDF34', // 🌴 (T)ree
  '\uD83C\uDF2E', // 🌮 (T)aco
  '\uD83C\uDFBB', // 🎻 (V)iolin
  '\uD83D\uDE80', // 🚀 Rocket
];

function Sidebar({section, onClick, categories, className}) {
  const {height, ref} = useElementSize();
  const {height: emojiButtonHeight, ref: emojiButtonRef} = useElementSize();
  const containerRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [emojiButtonHidden, setEmojiButtonHidden] = useState(false);
  const hoverEmojiCount = useRef(0);
  const middleCategories = categories.middle;

  const bottomDepth = useMemo(
    () => (categories.top.length + middleCategories.length) * EMOTE_MENU_SIDEBAR_ROW_HEIGHT,
    [categories.top, middleCategories]
  );

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

  useAutoSidebarScroll(
    section,
    containerRef,
    Object.values(categories).flat(),
    emojiButtonHidden ? height : height - emojiButtonHeight
  );

  const handleEmojiClick = useCallback(() => {
    containerRef.current.scrollTo({top: bottomDepth, left: 0});
  }, [containerRef, bottomDepth]);

  function handleScroll() {
    if (containerRef.current == null) {
      return;
    }

    const top = containerRef.current.scrollTop;

    const isHidden = top + height > bottomDepth;
    if (isHidden === emojiButtonHidden) {
      return;
    }

    setEmojiButtonHidden(isHidden);
  }

  useEffect(() => {
    handleScroll();
  }, [bottomDepth]);

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

  const emoji = useMemo(() => {
    let code = DEFAULT_EMOJI;

    if (hovering) {
      const count = hoverEmojiCount.current;
      code = HOVER_EMOJI[count % HOVER_EMOJI.length];
      hoverEmojiCount.current = count + 1;
    }

    return emojis.getEligibleEmote(code);
  }, [hovering]);

  const sortableIds = useMemo(() => middleCategories.map((c) => c.id), [middleCategories]);

  return (
    <div ref={ref} className={classNames(styles.sidebar, className)}>
      <div className={styles.content} ref={containerRef} onScroll={handleScroll}>
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
      <div
        ref={emojiButtonRef}
        role="button"
        onMouseOver={() => setHovering(true)}
        onFocus={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => handleEmojiClick()}
        className={classNames(styles.emojiButton, {
          [styles.emojiButtonHidden]: emojiButtonHidden,
          [styles.emojiButtonVisible]: !emojiButtonHidden,
        })}>
        <Emote className={styles.emojiButtonEmote} emote={emoji} />
      </div>
    </div>
  );
}

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

export default React.memo(
  Sidebar,
  (prevProps, nextProps) =>
    prevProps.categories === nextProps.categories &&
    prevProps.section === nextProps.section &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick
);
