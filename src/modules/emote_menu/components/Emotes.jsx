import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import classNames from 'classnames';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore, {COLUMN_COUNT} from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';

const ROW_HEIGHT = 36;
const WINDOW_HEIGHT = 308;
const TOTAL_COLUMNS = 7;

function Emotes({onClick, onHover, section, onSection}) {
  const wrapperRef = useRef(null);
  const [, setUpdated] = useState(false);

  const renderRow = useCallback(
    ({key, style, index, className}) => {
      const row = emoteStore.getRow(index);
      return emoteStore.getHeaders().includes(index) ? (
        <div key={key} style={style} className={classNames(className, styles.header)}>
          <Icon>{row.icon}</Icon>
          <div className={styles.headerText}>{row.displayName.toUpperCase()}</div>
        </div>
      ) : (
        <div key={key} style={style} className={classNames(className, styles.row)}>
          {row.map((emote) => (
            <Emote emote={emote} onClick={onClick} onMouseOver={onHover} />
          ))}
        </div>
      );
    },
    [onHover, onClick]
  );

  const handleHeaderChange = useCallback((row) => {
    const header = emoteStore.getRow(row?.current);
    if (header != null) {
      onSection(header.id);
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
    if (!section.scrollTo) return;
    const index = emoteStore.getHeaderIndexById(section.eventKey);
    if (index != null) {
      wrapperRef.current.scrollTo(0, index * ROW_HEIGHT);
    }
  }, [section]);

  return (
    <VirtualizedList
      stickyRows={emoteStore.headers}
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={emoteStore.totalRows()}
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
    ({key, style, index, className}) => {
      const row = emotes.slice(index * COLUMN_COUNT, (index + 1) * COLUMN_COUNT);
      return (
        <div key={key} style={style} className={classNames(className, styles.row)}>
          {row.map(({item}) => (
            <Emote emote={item} onClick={onClick} onMouseOver={onHover} />
          ))}
        </div>
      );
    },
    [emotes]
  );

  if (emotes.length === 0) {
    return (
      <div className={styles.empty}>
        <p>We could not find any results...</p>
      </div>
    );
  }

  return (
    <VirtualizedList
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={Math.ceil(emotes.length / TOTAL_COLUMNS)}
      renderRow={renderRow}
      className={styles.emotesContainer}
    />
  );
}

export default function renderEmotes({search, ...restProps}) {
  return search.length > 0 ? <SearchedEmotes search={search} {...restProps} /> : <Emotes {...restProps} />;
}
