import React, {useState, useEffect, useRef} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/sidebar.module.css';

const ITEM_HEIGHT = 42;
const SIDEBAR_HEIGHT = 300;

let timer;

export default function Sidebar({section, onChange}) {
  const containerRef = useRef(null);
  const [providers, setProviders] = useState(emoteStore.getProviders());

  useEffect(() => {
    function callback() {
      setProviders(emoteStore.getProviders());
    }

    emoteStore.on('updated', callback);

    return () => {
      emoteStore.off('updated', callback);
    };
  }, []);

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
