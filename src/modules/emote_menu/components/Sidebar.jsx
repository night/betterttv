/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import classNames from 'classnames';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {createPortal} from 'react-dom';
import {Divider} from 'rsuite';
import styles from './Sidebar.module.css';
import useAutoScroll from '../hooks/AutoScroll.jsx';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import {ITEM_HEIGHT, WindowHeight} from '../../../constants.js';
import emojis from '../../emotes/emojis.js';
import Emote from '../../../common/components/Emote.jsx';

// https://github.com/atlassian/react-beautiful-dnd/issues/128#issuecomment-669083882
function useDraggableInPortal() {
  const self = useRef({}).current;

  useEffect(() => {
    const div = document.createElement('div');
    div.classList.add(styles.portal);
    self.elt = div;
    document.body.appendChild(div);
    return () => {
      document.body.removeChild(div);
    };
  }, [self]);

  return (render) =>
    (provided, ...args) => {
      const element = render(provided, ...args);
      if (provided.draggableProps.style.position === 'fixed') {
        return createPortal(element, self.elt);
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
    () => (categories.top.length + middleCategories.length) * ITEM_HEIGHT,
    [categories.top, middleCategories]
  );

  const renderDraggable = useDraggableInPortal();
  useEffect(() => setMiddleCategories(categories.middle), [categories.middle]);

  useAutoScroll(
    section,
    containerRef,
    [...categories.top, ...middleCategories, ...categories.bottom],
    emojiButtonHidden ? WindowHeight + 49 : WindowHeight // 1px (divider) + 48px (emojiButton) = 49px
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

  useEffect(() => {
    function handleScroll() {
      const top = containerRef.current.scrollTop;

      const isHidden = top + WindowHeight > bottomDepth;
      if (isHidden === emojiButtonHidden) {
        return;
      }

      setEmojiButtonHidden(isHidden);
    }

    containerRef.current.addEventListener('scroll', handleScroll);

    return () => {
      containerRef.current.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, emojiButtonHidden, bottomDepth]);

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
      <div
        className={classNames(styles.content, {
          [styles.emojiButtonHidden]: emojiButtonHidden,
          [styles.emojiButtonVisible]: !emojiButtonHidden,
        })}
        ref={containerRef}>
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
      <Divider className={styles.divider} />
      <div
        role="button"
        onMouseEnter={() => setHovering(true)}
        className={classNames(styles.navItem, styles.emojiButton, {[styles.hidden]: hovering})}>
        <Emote emote={emojis.getEligibleEmote('\ud83d\ude03')} />
      </div>
      <div
        role="button"
        onClick={() => handleEmojiClick()}
        onMouseLeave={() => setHovering(false)}
        className={classNames(styles.navItem, styles.emojiButton, {[styles.hidden]: !hovering})}>
        <Emote emote={emojis.getEligibleEmote('\ud83d\udca9')} />
      </div>
    </div>
  );
}
