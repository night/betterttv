import React, {useCallback, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import mergeRefs from 'react-merge-refs';
import styles from './Sidebar.module.css';
import useAutoScroll from '../hooks/AutoScroll.jsx';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

export default function Sidebar({section, categories: initialCategories}) {
  const containerRef = useRef(null);
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => setCategories(initialCategories), [initialCategories]);

  useAutoScroll(section, containerRef, categories);

  const handleReorder = useCallback(
    (oldDest, newDest) => {
      const result = [...categories];
      const [removed] = result.splice(oldDest, 1);
      result.splice(newDest, 0, removed);

      setCategories(result);
      emoteMenuViewStore.setCategoryOrder(result);
    },
    [categories]
  );

  return (
    <DragDropContext onDragEnd={({source, destination}) => handleReorder(source.index, destination.index)}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={mergeRefs([provided.innerRef, containerRef])}
            className={styles.sidebar}>
            {categories.map((category, index) => {
              const isActive = category.id === section.eventKey;
              return (
                <Draggable key={category.id} draggableId={category.id} index={index}>
                  {(providedItem, snapshotItem) => (
                    <div
                      ref={providedItem.innerRef}
                      {...providedItem.draggableProps}
                      {...providedItem.dragHandleProps}
                      style={providedItem.draggableProps.style}
                      className={classNames(styles.navItem, {
                        [styles.dragging]: snapshotItem.isDragging,
                        [styles.active]: isActive,
                      })}>
                      {category.icon}
                    </div>
                  )}
                </Draggable>
              );
            })}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
