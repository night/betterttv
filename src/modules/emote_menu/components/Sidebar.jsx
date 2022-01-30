import React, {useEffect, useRef} from 'react';
import Nav from 'rsuite/Nav';
import Whisper from 'rsuite/Whisper';
import Tooltip from 'rsuite/Tooltip';
import classNames from 'classnames';
import {WindowHeight} from '../../../constants.js';
import styles from './Sidebar.module.css';

const ITEM_HEIGHT = 44;

export default function Sidebar({section, onChange, categories}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (section.eventKey == null || currentRef == null) return;

    const top = currentRef.scrollTop;
    const index = categories.findIndex((category) => category.id === section.eventKey);
    const depth = index * ITEM_HEIGHT;

    let newTop;
    if (depth < top) {
      newTop = depth;
    }
    if (depth + ITEM_HEIGHT > top + WindowHeight) {
      newTop = depth - WindowHeight + ITEM_HEIGHT;
    }
    if (newTop == null) {
      return;
    }

    currentRef.scrollTo({
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
              placement="right"
              trigger="hover"
              delay={200}
              speaker={<Tooltip>{category.displayName}</Tooltip>}
              onClick={() => onChange(category.id)}>
              <Nav.Item
                active={isActive}
                icon={<div className={styles.navItemContent}>{category.icon}</div>}
                className={classNames(styles.navItem, {[styles.active]: isActive})}
              />
            </Whisper>
          );
        })}
      </Nav>
    </div>
  );
}
