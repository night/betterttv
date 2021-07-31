import React, {useCallback, useEffect, useRef} from 'react';
import VirtualizedList from './VirtualizedList.jsx';
import grid from '../grid.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';

const ROW_HEIGHT = 36;
const WINDOW_HEIGHT = 308;

export default function EmotesComponent({onSelect, focus, onFocus}) {
  const wrapperRef = useRef(null);

  const renderRow = useCallback(
    ({key, style, index}) => {
      const row = grid.getRow(index);
      return grid.isHeader(index) ? (
        <div key={key} style={style} className={styles.header}>
          {row.displayName}
        </div>
      ) : (
        <div key={key} style={style} className={styles.row}>
          {row.map((emote) => (
            <Emote emote={emote} onMouseOver={() => onSelect(emote)} />
          ))}
        </div>
      );
    },
    [onSelect]
  );

  const headerChange = useCallback((index) => {
    const header = grid.headers[index];
    if (header) onFocus(header.id);
  });

  useEffect(() => {
    if (!focus.scrollTo) return;
    const index = Object.keys(grid.headers).find((key) => grid.headers[key].id === focus.eventKey);
    if (index) wrapperRef.current.scrollTo(0, index * ROW_HEIGHT);
  }, [focus]);

  return (
    <VirtualizedList
      stickyRows={Object.keys(grid.headers)}
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={grid.totalRows}
      renderRow={renderRow}
      className={styles.emotes}
      onHeaderChange={headerChange}
      ref={wrapperRef}
    />
  );
}
