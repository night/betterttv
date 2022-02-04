/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {createPortal} from 'react-dom';
import {Divider} from 'rsuite';
import styles from './Sidebar.module.css';
import useAutoScroll from '../hooks/AutoScroll.jsx';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import {BOTTOM_FIXED_CATEGORIES, ITEM_HEIGHT, TOP_FIXED_CATEGORIES} from '../../../constants.js';
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

export default function Sidebar({section, onClick, categories: initialCategories}) {
  const containerRef = useRef(null);
  const [categories, setCategories] = useState(initialCategories);

  const renderDraggable = useDraggableInPortal();
  useEffect(() => setCategories(initialCategories), [initialCategories]);

  useAutoScroll(section, containerRef, categories);

  const [hovering, setHovering] = useState(false);

  const [topCategories, middleCategories, bottomCategories] = useMemo(() => {
    const top = [];
    const middle = [];
    const bottom = [];

    for (const category of categories) {
      if (TOP_FIXED_CATEGORIES.includes(category.id)) {
        top.push(category);
        continue;
      }

      if (BOTTOM_FIXED_CATEGORIES.includes(category.id)) {
        bottom.push(category);
        continue;
      }

      middle.push(category);
    }

    return [top, middle, bottom];
  }, [categories]);

  const handleEmojiClick = useCallback(() => {
    containerRef.current.scrollTo({
      top: (topCategories.length + middleCategories.length) * ITEM_HEIGHT,
      left: 0,
    });

    onClick(bottomCategories[0].id);
  }, [containerRef, topCategories, middleCategories, bottomCategories]);

  const handleReorder = useCallback(
    (oldDest, newDest) => {
      if (oldDest === newDest) {
        return;
      }

      const result = [...middleCategories];
      const [removed] = result.splice(oldDest, 1);
      result.splice(newDest, 0, removed);

      setCategories([...topCategories, ...result, ...bottomCategories]);
      emoteMenuViewStore.setCategoryOrder(result);
    },
    [categories]
  );

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
      <div className={styles.content} ref={containerRef}>
        {createCategories(topCategories)}
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
        {createCategories(bottomCategories)}
      </div>
      <Divider className={styles.divider} />
      <div
        role="button"
        onMouseEnter={() => setHovering(true)}
        className={classNames(styles.navItem, styles.emojiButton, {[styles.hidden]: hovering})}>
        <Emote emote={emojis.getEligibleEmote('😃')} />
      </div>
      <div
        role="button"
        onClick={() => handleEmojiClick()}
        onMouseLeave={() => setHovering(false)}
        className={classNames(styles.navItem, styles.emojiButton, {[styles.hidden]: !hovering})}>
        <Emote emote={emojis.getEligibleEmote('💩')} />
      </div>
    </div>
  );
}
