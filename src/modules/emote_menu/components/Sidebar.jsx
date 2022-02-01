import React, {useCallback, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import mergeRefs from 'react-merge-refs';
import {createPortal} from 'react-dom';
import styles from './Sidebar.module.css';
import useAutoScroll from '../hooks/AutoScroll.jsx';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import {EmoteCategories} from '../../../constants.js';

const DISABLED_DRAGGABLE_CATEGORIES = [EmoteCategories.FAVORITES, EmoteCategories.FRECENTS];

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

  function handleClick(category) {
    onClick(category.id);
  }

  const handleReorder = useCallback(
    (oldDest, newDest) => {
      if (oldDest === newDest) {
        return;
      }

      const result = [...categories];
      const [removed] = result.splice(oldDest, 1);
      result.splice(newDest, 0, removed);

      setCategories(result);

      emoteMenuViewStore.once('updated', () => onClick(section.eventKey));
      emoteMenuViewStore.setCategoryOrder(result);
    },
    [categories]
  );

  return (
    <DragDropContext onDragEnd={({source, destination}) => handleReorder(source.index, destination.index)}>
      <Droppable droppableId="droppable" type="list" direction="vertical">
        {(provided) => (
          <div
            className={styles.sidebar}
            {...provided.droppableProps}
            ref={mergeRefs([provided.innerRef, containerRef])}>
            {categories.map((category, index) => {
              const isActive = category.id === section.eventKey;
              return (
                <Draggable
                  key={category.id}
                  draggableId={category.id}
                  index={index}
                  isDragDisabled={DISABLED_DRAGGABLE_CATEGORIES.includes(category.id)}>
                  {renderDraggable((providedItem, snapshotItem) => (
                    <div
                      tabIndex={index}
                      role="button"
                      ref={providedItem.innerRef}
                      {...providedItem.draggableProps}
                      {...providedItem.dragHandleProps}
                      style={providedItem.draggableProps.style}
                      onClick={() => handleClick(category)}
                      onKeyDown={() => handleClick(category)}
                      className={classNames(styles.navItem, {
                        [styles.dragging]: snapshotItem.isDragging,
                        [styles.active]: isActive,
                      })}>
                      {category.icon}
                    </div>
                  ))}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
