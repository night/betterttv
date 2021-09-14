import React, {useEffect, useRef} from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Tooltip from 'rsuite/lib/Tooltip/index.js';
import classNames from 'classnames';
import {RowHeight, WindowHeight} from '../../../constants.js';
import styles from '../styles/sidebar.module.css';

const ITEM_HEIGHT = 42;

export default function Sidebar({section, onChange, providers}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (section.eventKey == null) return;

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
      top: newTop,
      left: 0,
      behavior: 'smooth',
    });
  }, [section]);

  return (
    <div className={styles.sidebar} ref={containerRef}>
      <Nav vertical appearance="subtle">
        {providers.map((provider) => {
          const isActive = provider.id === section.eventKey;

          return (
            <Whisper
              key={provider.id}
              placement="left"
              trigger="hover"
              delay={200}
              speaker={<Tooltip>{provider.displayName}</Tooltip>}
              onClick={() => onChange(provider.id)}
            >
              <Nav.Item active={isActive} icon={provider.icon} className={classNames({[styles.active]: isActive})} />
            </Whisper>
          );
        })}
      </Nav>
    </div>
  );
}
