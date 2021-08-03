import React, {useCallback, useEffect, useRef} from 'react';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';
import EmoteSearch from '../search.js';

const ROW_HEIGHT = 36;
const WINDOW_HEIGHT = 308;
const TOTAL_COLS = 7;

function Emotes({onClick, onSelect, focus, onFocus}) {
  const wrapperRef = useRef(null);

  const renderRow = useCallback(
    ({key, style, index}) => {
      const row = emoteStore.getRow(index);
      return emoteStore.isHeader(index) ? (
        <div key={key} style={style} className={styles.header}>
          {row.displayName}
        </div>
      ) : (
        <div key={key} style={style} className={styles.row}>
          {row.map((emote) => (
            <Emote emote={emote} onClick={() => onClick(emote)} onMouseOver={() => onSelect(emote)} />
          ))}
        </div>
      );
    },
    [onSelect, onClick]
  );

  const headerChange = useCallback((index) => {
    const header = emoteStore.headers[index];
    if (header) onFocus(header.id);
  });

  useEffect(() => {
    if (!focus.scrollTo) return;
    const index = Object.keys(emoteStore.headers).find((key) => emoteStore.headers[key].id === focus.eventKey);
    if (index) wrapperRef.current.scrollTo(0, index * ROW_HEIGHT);
  }, [focus]);

  return (
    <VirtualizedList
      stickyRows={Object.keys(emoteStore.headers)}
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={emoteStore.totalRows}
      renderRow={renderRow}
      className={styles.emotes}
      onHeaderChange={headerChange}
      ref={wrapperRef}
    />
  );
}

function SearchedEmotes({search, onSelect, onClick}) {
  const emotes = EmoteSearch.search.search(search);

  const renderRow = useCallback(
    ({key, style, index}) => {
      const row = emotes.slice(index * TOTAL_COLS, (index + 1) * TOTAL_COLS).map(({item}) => [item.code, item]);

      return (
        <div key={key} style={style} className={styles.row}>
          {row.map((emote) => (
            <Emote emote={emote} onClick={() => onClick(emote)} onFocus={() => onSelect(emote)} />
          ))}
        </div>
      );
    },
    [onSelect, onClick]
  );

  return (
    <VirtualizedList
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={Math.ceil(emotes.length / emoteStore.totalCols)}
      renderRow={renderRow}
      className={styles.emotes}
    />
  );
}

export default function renderEmotes({search, ...restProps}) {
  return search.length > 0 ? <SearchedEmotes search={search} {...restProps} /> : <Emotes {...restProps} />;
}
