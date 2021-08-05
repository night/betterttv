import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';

const ROW_HEIGHT = 36;
const WINDOW_HEIGHT = 308;
const TOTAL_COLS = 7;

function Emotes({onClick, onHover, focus, onFocus}) {
  const wrapperRef = useRef(null);
  const [, setUpdated] = useState(false);

  const renderRow = useCallback(
    ({key, style, index}) => {
      const row = emoteStore.getRow(index);
      return emoteStore.isHeader(index) ? (
        <div key={key} style={style} className={styles.header}>
          <Icon>{row.icon()}</Icon>
          {row.displayName}
        </div>
      ) : (
        <div key={key} style={style} className={styles.row}>
          {row.map((emote) => (
            <Emote key={emote.code} emote={emote} onClick={() => onClick(emote)} onMouseOver={() => onHover(emote)} />
          ))}
        </div>
      );
    },
    [onHover, onClick]
  );

  const handleHeaderChange = useCallback((index) => {
    const header = emoteStore.getRow(index);
    if (header != null) {
      onFocus(header.id);
    }
  });

  useEffect(() => {
    function callback() {
      setUpdated((prev) => !prev);
    }
    emoteStore.on('updated', callback);

    return () => {
      emoteStore.off('updated', callback);
    };
  }, []);

  useEffect(() => {
    if (!focus.scrollTo) return;
    const index = emoteStore.getHeaderIndexById(focus.eventKey);
    if (index != null) {
      wrapperRef.current.scrollTo(0, index * ROW_HEIGHT);
    }
  }, [focus]);

  return (
    <VirtualizedList
      stickyRows={emoteStore.headers}
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={emoteStore.totalRows}
      renderRow={renderRow}
      className={styles.emotesContainer}
      onHeaderChange={handleHeaderChange}
      ref={wrapperRef}
    />
  );
}

function SearchedEmotes({search, onHover, onClick}) {
  const emotes = useMemo(() => emoteStore.search(search), [search]);

  const renderRow = useCallback(
    ({key, style, index}) => {
      const row = emotes.slice(index * TOTAL_COLS, (index + 1) * TOTAL_COLS);
      return (
        <div key={key} style={style} className={styles.row}>
          {row.map(({item}) => (
            <Emote key={item.code} emote={item} onClick={() => onClick(item)} onMouseOver={() => onHover(item)} />
          ))}
        </div>
      );
    },
    [onHover, onClick]
  );

  return (
    <VirtualizedList
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={Math.ceil(emotes.length / TOTAL_COLS)}
      renderRow={renderRow}
      className={styles.emotesContainer}
    />
  );
}

export default function renderEmotes({search, ...restProps}) {
  return search.length > 0 ? <SearchedEmotes search={search} {...restProps} /> : <Emotes {...restProps} />;
}
