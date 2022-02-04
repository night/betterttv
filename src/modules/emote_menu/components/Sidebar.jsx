import React, {useCallback, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {createPortal} from 'react-dom';
import styles from './Sidebar.module.css';
import useAutoScroll from '../hooks/AutoScroll.jsx';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

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

export default function Sidebar({section, onClick, staticCategories, categories: initialCategories}) {
  const containerRef = useRef(null);
  const [categories, setCategories] = useState(initialCategories);

  const renderDraggable = useDraggableInPortal();
  useEffect(() => setCategories(initialCategories), [initialCategories]);
  useAutoScroll(section, containerRef, [...staticCategories, ...categories]);

  const handleReorder = useCallback(
    (oldDest, newDest) => {
      if (oldDest === newDest) {
        return;
      }

      const result = [...categories];
      const [removed] = result.splice(oldDest, 1);
      result.splice(newDest, 0, removed);

      setCategories(result);

      emoteMenuViewStore.once('updated', () => {
        onClick(removed.id);
      });

      emoteMenuViewStore.setCategoryOrder(result, oldDest, newDest);
    },
    [categories]
  );

  return (
    <div className={styles.sidebar} ref={containerRef}>
      {staticCategories.map((category, index) => (
        <div
          key={category.id}
          tabIndex={index}
          role="button"
          onClick={() => onClick(category.id)}
          onKeyDown={() => onClick(category.id)}
          className={classNames(styles.navItem, {
            [styles.active]: category.id === section.eventKey,
          })}>
          {category.icon}
        </div>
      ))}
      <DragDropContext onDragEnd={({source, destination}) => handleReorder(source.index, destination.index)}>
        <Droppable droppableId="droppable" type="list" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {categories.map((category, index) => (
                <Draggable key={category.id} draggableId={category.id} index={index}>
                  {renderDraggable((providedItem, snapshotItem) => (
                    <div
                      tabIndex={index + staticCategories.length}
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
    </div>
  );
}
