import React from 'react';
import VirtualizedList from './VirtualizedList.jsx';
import EmotesGrid from '../grid.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';

const grid = new EmotesGrid();

export default function EmotesComponent({onChange, search, ...restProps}) {
  function renderRow({style, index}) {
    const row = grid.getRow(index);

    if (grid.isHeader(index)) {
      return (
        <div style={style} className={styles.header}>
          {row.displayName}
        </div>
      );
    }

    return (
      <div style={style}>
        {row.map(([code, emote]) => (
          <Emote data={emote} code={code} />
        ))}
      </div>
    );
  }

  return (
    <VirtualizedList
      stickyRows={grid.headers}
      rowHeight={30}
      windowHeight={308}
      totalRows={grid.totalRows}
      renderRow={renderRow}
      className={styles.emotes}
    />
  );
}
