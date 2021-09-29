import React, {useEffect, useRef} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Tooltip from 'rsuite/lib/Tooltip/index.js';
import classNames from 'classnames';
import {RowHeight, WindowHeight} from '../../../constants.js';
import styles from './Sidebar.module.css';

const ITEM_HEIGHT = 42;

export default function Sidebar({section, onChange, categories}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (section.eventKey == null) return;

    const top = containerRef.current.scrollTop;
    const index = categories.findIndex((category) => category.id === section.eventKey);
    const depth = index * ITEM_HEIGHT;

    let newTop;
    if (depth < top) {
      newTop = depth;
    }
    if (depth + ITEM_HEIGHT > top + WindowHeight) {
      newTop = depth - WindowHeight + RowHeight;
    }
    if (newTop == null) {
      return;
    }

    containerRef.current.scrollTo({
      top: newTop,
      left: 0,
      behavior: 'smooth',
    });
  }, [section]);

  return (
    <div className={styles.sidebar} ref={containerRef}>
      <Nav vertical appearance="subtle">
        {categories.map((category) => {
          const isActive = category.id === section.eventKey;

          return (
            <Whisper
              key={category.id}
              placement="left"
              trigger="hover"
              delay={200}
              speaker={<Tooltip>{category.displayName}</Tooltip>}
              onClick={() => onChange(category.id)}>
              <Nav.Item active={isActive} icon={category.icon} className={classNames({[styles.active]: isActive})} />
            </Whisper>
          );
        })}
      </Nav>
    </div>
  );
}
