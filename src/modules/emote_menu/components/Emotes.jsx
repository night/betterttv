import React from 'react';
import VirtualizedList from './VirtualizedList.jsx';
import EmotesGrid from '../grid.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';

const grid = new EmotesGrid();

export default function EmotesComponent({onChange}) {
  function renderRow({key, style, index}) {
    const row = grid.getRow(index);

    if (grid.isHeader(index)) {
      return (
        <div key={key} style={style} className={styles.header}>
          {row.displayName}
        </div>
      );
    }

    return (
      <div key={key} style={style} className={styles.row}>
        {row.map((emote) => (
          <Emote emote={emote} onMouseOver={() => onChange(emote)} />
        ))}
      </div>
    );
  }

  return (
    <VirtualizedList
      stickyRows={grid.headers}
      rowHeight={36}
      windowHeight={308}
      totalRows={grid.totalRows}
      renderRow={renderRow}
      className={styles.emotes}
    />
  );
}
