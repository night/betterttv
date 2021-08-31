import React, {useEffect, useRef} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import styles from '../styles/sidebar.module.css';

const ITEM_HEIGHT = 42;
const SIDEBAR_HEIGHT = 300;

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

      if (depth < top) {
        containerRef.current.scrollTo({
          top: depth,
          left: 0,
          behavior: 'smooth',
        });

        return;
      }

      if (depth + ITEM_HEIGHT > top + SIDEBAR_HEIGHT) {
        containerRef.current.scrollTo({
          top: depth - SIDEBAR_HEIGHT + 36,
          left: 0,
          behavior: 'smooth',
        });
      }
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
