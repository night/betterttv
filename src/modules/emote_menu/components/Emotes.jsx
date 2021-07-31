import React, {useCallback} from 'react';
import VirtualizedList from './VirtualizedList.jsx';
import grid from '../grid.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';

export default function EmotesComponent({onSelect, onFocus}) {
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

  return (
    <VirtualizedList
      stickyRows={Object.keys(grid.headers)}
      rowHeight={36}
      windowHeight={308}
      totalRows={grid.totalRows}
      renderRow={renderRow}
      className={styles.emotes}
      onHeaderChange={headerChange}
    />
  );
}
