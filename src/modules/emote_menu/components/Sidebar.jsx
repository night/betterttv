import React, {useRef} from 'react';
import classNames from 'classnames';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import mergeRefs from 'react-merge-refs';
import styles from './Sidebar.module.css';
import useAutoScroll from '../hooks/AutoScroll.jsx';

export default function Sidebar({section, onChange, categories}) {
  const containerRef = useRef(null);
  useAutoScroll(section, containerRef, categories);

  return (
    <DragDropContext onDragEnd={() => console.log('stopped dragging')}>
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
                  {(providedItem) => (
                    <div
                      ref={providedItem.innerRef}
                      {...providedItem.draggableProps}
                      {...providedItem.dragHandleProps}
                      style={providedItem.draggableProps.style}
                      className={classNames(styles.navItem, {[styles.active]: isActive})}>
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
