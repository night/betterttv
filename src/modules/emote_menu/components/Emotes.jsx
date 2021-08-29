import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import classNames from 'classnames';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';
import Icons from './Icons.jsx';

const ROW_HEIGHT = 36;
const WINDOW_HEIGHT = 300;

function Emotes({onClick, section, onSection, arrows, setSelected, selected}) {
  const wrapperRef = useRef(null);
  const [cords, setCords] = useState({row: 0, col: 0});

  useEffect(() => {
    let {row, col} = cords;

    switch (true) {
      case arrows.top: {
        row = emoteStore.headers.includes(row - 1) ? row - 2 : row - 1;
        const newRow = emoteStore.getRow(row);
        if (newRow != null && col > newRow.length - 1) {
          col = newRow.length - 1;
        }
        break;
      }
      case arrows.down: {
        row = emoteStore.headers.includes(row + 1) ? row + 2 : row + 1;
        const newRow = emoteStore.getRow(row);
        if (newRow != null && col > newRow.length - 1) {
          col = newRow.length - 1;
        }
        break;
      }
      case arrows.left: {
        col -= 1;
        if (col < 0) {
          row = emoteStore.headers.includes(row - 1) ? row - 2 : row - 1;
          const newRow = emoteStore.getRow(row);
          col = newRow != null ? newRow.length - 1 : col;
        }
        break;
      }
      case arrows.right: {
        col += 1;
        if (col > emoteStore.getRow(row).length - 1) {
          row = emoteStore.headers.includes(row + 1) ? row + 2 : row + 1;
          const newRow = emoteStore.getRow(row);
          col = newRow != null ? 0 : col;
        }
        break;
      }
      default:
        return;
    }

    // Scroll if arrow keys go out of bounds

    if (row >= 0 && row < emoteStore.rows.length) {
      setCords({row, col});

      const depth = row * ROW_HEIGHT;
      const {scrollTop} = wrapperRef.current;

      if (depth <= scrollTop + ROW_HEIGHT) {
        wrapperRef.current.scrollTo(0, depth - ROW_HEIGHT);
      }

      if (depth + ROW_HEIGHT > scrollTop + WINDOW_HEIGHT) {
        wrapperRef.current.scrollTo(0, depth + ROW_HEIGHT - WINDOW_HEIGHT);
      }
    }
  }, [arrows]);

  useEffect(() => {
    const {row, col} = cords;
    const emote = emoteStore.getRow(row)[col];
    setSelected(emote);
  }, [cords]);

  const renderRow = useCallback(
    ({key, style, index, className}) => {
      const row = emoteStore.getRow(index);
      return emoteStore.headers.includes(index) ? (
        <div key={key} style={style} className={classNames(className, styles.header)}>
          <Icon>{row.icon}</Icon>
          <div className={styles.headerText}>{row.displayName.toUpperCase()}</div>
        </div>
      ) : (
        <div key={key} style={style} className={classNames(className, styles.row)}>
          {row.map((emote, col) => (
            <Emote
              active={selected != null && selected.id === emote.id}
              emote={emote}
              onClick={onClick}
              onMouseOver={() => setCords({row: index, col})}
            />
          ))}
        </div>
      );
    },
    [onClick, selected]
  );

  const handleHeaderChange = useCallback((row) => {
    const header = emoteStore.getRow(row?.current);
    if (header != null) {
      onSection(header.id);
    }
  });

  useEffect(() => {
    if (!section.scrollTo) return;
    const index = emoteStore.getProviderIndexById(section.eventKey);
    if (index != null) {
      wrapperRef.current.scrollTo(0, index * ROW_HEIGHT);
    }
  }, [section]);

  return (
    <VirtualizedList
      stickyRows={emoteStore.headers}
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={emoteStore.rows.length}
      renderRow={renderRow}
      className={styles.emotesContainer}
      onHeaderChange={handleHeaderChange}
      ref={wrapperRef}
    />
  );
}

function SearchedEmotes({search, onClick, setSelected, selected}) {
  const emotes = useMemo(() => emoteStore.search(search), [search]);

  useEffect(() => {
    if (emotes.length > 0) {
      setSelected(emotes[0].item);
    }
  }, [emotes]);

  const renderRow = useCallback(
    ({key, style, index, className}) => {
      const row = emotes.slice(index * emoteStore.totalCols, (index + 1) * emoteStore.totalCols);
      return (
        <div key={key} style={style} className={classNames(className, styles.row)}>
          {row.map(({item}) => (
            <Emote
              emote={item}
              onClick={onClick}
              onMouseOver={setSelected}
              active={selected != null && selected.id === item.id}
            />
          ))}
        </div>
      );
    },
    [emotes, selected]
  );

  if (emotes.length === 0) {
    return (
      <div className={styles.empty}>
        {Icons.HEART_BROKEN}
        <p>No results...</p>
      </div>
    );
  }

  return (
    <VirtualizedList
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={Math.ceil(emotes.length / emoteStore.totalCols)}
      renderRow={renderRow}
      className={classNames(styles.emotesContainer, styles.searched)}
    />
  );
}

export default function renderEmotes({search, ...restProps}) {
  return search.length > 0 ? <SearchedEmotes search={search} {...restProps} /> : <Emotes {...restProps} />;
}
