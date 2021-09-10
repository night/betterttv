import React, {useEffect, useRef} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import {RowHeight, WindowHeight} from '../../../constants.js';
import styles from '../styles/sidebar.module.css';

const ITEM_HEIGHT = 42;

let timer;

export default function Sidebar({section, onChange, providers}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (section.eventKey == null) return;

    clearTimeout(timer);

    timer = setTimeout(() => {
      const top = containerRef.current.scrollTop;
      const index = providers.findIndex((provider) => provider.id === section.eventKey);
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
        top: depth,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }, [section]);

  return (
    <div className={styles.sidebar} ref={containerRef}>
      <Nav vertical appearance="subtle" onSelect={onChange} activeKey={section.eventKey}>
        {providers.map((provider) => (
          <Nav.Item key={provider.id} eventKey={provider.id} icon={provider.icon} />
        ))}
      </Nav>
    </div>
  );
}
