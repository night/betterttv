/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import classNames from 'classnames';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {createPortal} from 'react-dom';
import styles from './Sidebar.module.css';
import useAutoScroll from '../hooks/AutoScroll.jsx';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import {EMOTE_MENU_SIDEBAR_ROW_HEIGHT, EMOTE_MENU_GRID_HEIGHT} from '../../../constants.js';
import emojis from '../../emotes/emojis.js';
import Emote from '../../../common/components/Emote.jsx';

// https://github.com/atlassian/react-beautiful-dnd/issues/128#issuecomment-669083882
function useDraggableInPortal() {
  const self = useRef({}).current;

  useEffect(() => {
    const div = document.createElement('div');
    div.classList.add(styles.portal);
    self.divElement = div;
    document.body.appendChild(div);
    return () => {
      document.body.removeChild(div);
    };
  }, [self]);

  return (render) =>
    (provided, ...args) => {
      const element = render(provided, ...args);
      if (provided.draggableProps.style.position === 'fixed') {
        return createPortal(element, self.divElement);
      }
      return element;
    };
}

export default function Sidebar({section, onClick, categories}) {
  const containerRef = useRef(null);
  const [middleCategories, setMiddleCategories] = useState(categories.middle);
  const [hovering, setHovering] = useState(false);
  const [emojiButtonHidden, setEmojiButtonHidden] = useState(false);

  const bottomDepth = useMemo(
    () => (categories.top.length + middleCategories.length) * EMOTE_MENU_SIDEBAR_ROW_HEIGHT,
    [categories.top, middleCategories]
  );

  const renderDraggable = useDraggableInPortal();
  useEffect(() => setMiddleCategories(categories.middle), [categories.middle]);

  useAutoScroll(
    section,
    containerRef,
    [...categories.top, ...middleCategories, ...categories.bottom],
    emojiButtonHidden ? EMOTE_MENU_GRID_HEIGHT + 49 : EMOTE_MENU_GRID_HEIGHT // 1px (divider) + 48px (emojiButton) = 49px
  );

  const handleEmojiClick = useCallback(() => {
    containerRef.current.scrollTo({
      top: bottomDepth,
      left: 0,
    });
  }, [containerRef, bottomDepth]);

  const handleReorder = useCallback(
    (oldDest, newDest) => {
      if (oldDest === newDest) {
        return;
      }

      const result = [...middleCategories];
      const [removed] = result.splice(oldDest, 1);
      result.splice(newDest, 0, removed);

      setMiddleCategories(result);
      emoteMenuViewStore.setCategoryOrder(result);
    },
    [categories]
  );

  function handleScroll() {
    if (containerRef.current == null) {
      return;
    }

    const top = containerRef.current.scrollTop;

    const isHidden = top + EMOTE_MENU_GRID_HEIGHT > bottomDepth;
    if (isHidden === emojiButtonHidden) {
      return;
    }

    setEmojiButtonHidden(isHidden);
  }

  useEffect(() => handleScroll(), [bottomDepth]);

  function createCategories(arr) {
    return arr.map((category) => (
      <div
        key={category.id}
        role="button"
        onClick={() => onClick(category.id)}
        onKeyDown={() => onClick(category.id)}
        className={classNames(styles.navItem, {
          [styles.active]: category.id === section.eventKey,
        })}>
        {category.icon}
      </div>
    ));
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.content} ref={containerRef} onScroll={handleScroll}>
        {createCategories(categories.top)}
        <DragDropContext onDragEnd={({source, destination}) => handleReorder(source.index, destination.index)}>
          <Droppable droppableId="droppable" type="list" direction="vertical">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {middleCategories.map((category, index) => (
                  <Draggable key={category.id} draggableId={category.id} index={index}>
                    {renderDraggable((providedItem, snapshotItem) => (
                      <div
                        role="button"
                        ref={providedItem.innerRef}
                        {...providedItem.draggableProps}
                        {...providedItem.dragHandleProps}
                        style={providedItem.draggableProps.style}
                        onClick={() => onClick(category.id)}
                        onKeyDown={() => onClick(category.id)}
                        className={classNames(styles.navItem, {
                          [styles.dragging]: snapshotItem.isDragging,
                          [styles.active]: category.id === section.eventKey,
                        })}>
                        {category.icon}
                      </div>
                    ))}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {createCategories(categories.bottom)}
      </div>
      <div
        role="button"
        onMouseOver={() => setHovering(true)}
        onFocus={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => handleEmojiClick()}
        className={classNames(styles.emojiButton, {
          [styles.emojiButtonHidden]: emojiButtonHidden,
          [styles.emojiButtonVisible]: !emojiButtonHidden,
        })}>
        <Emote emote={hovering ? emojis.getEligibleEmote('\ud83d\udca9') : emojis.getEligibleEmote('\ud83d\ude03')} />
      </div>
    </div>
  );
}
