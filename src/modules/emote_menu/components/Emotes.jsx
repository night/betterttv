import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import classNames from 'classnames';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';
import Icons from './Icons.jsx';
import {NavigationModeTypes} from '../../../constants.js';

const ROW_HEIGHT = 36;
const WINDOW_HEIGHT = 300;
const OFFSET = 4;

let navigationMode = NavigationModeTypes.MOUSE;

function Emotes({onClick, section, onSection, arrowKeys, setSelected, selected}) {
  const wrapperRef = useRef(null);
  const [cords, setCords] = useState({row: 0, col: 0});

  const handleMouseOver = useCallback((row, col) => {
    if (navigationMode === NavigationModeTypes.MOUSE) {
      setCords({row, col});
    }
  }, []);

  useEffect(() => {
    let {row, col} = cords;

    switch (true) {
      case arrowKeys.top: {
        row = emoteStore.headers.includes(row - 1) ? row - 2 : row - 1;
        const newRow = emoteStore.getRow(row);
        if (newRow != null && col > newRow.length - 1) {
          col = newRow.length - 1;
        }
        break;
      }
      case arrowKeys.down: {
        row = emoteStore.headers.includes(row + 1) ? row + 2 : row + 1;
        const newRow = emoteStore.getRow(row);
        if (newRow != null && col > newRow.length - 1) {
          col = newRow.length - 1;
        }
        break;
      }
      case arrowKeys.left: {
        col -= 1;
        if (col < 0) {
          row = emoteStore.headers.includes(row - 1) ? row - 2 : row - 1;
          const newRow = emoteStore.getRow(row);
          col = newRow != null ? newRow.length - 1 : col;
        }
        break;
      }
      case arrowKeys.right: {
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
        wrapperRef.current.scrollTo(0, depth + ROW_HEIGHT - WINDOW_HEIGHT + OFFSET);
      }
    }
  }, [arrowKeys]);

  useEffect(() => {
    const {row, col} = cords;
    const emote = emoteStore.getRow(row)[col];
    setSelected(emote);
  }, [cords]);

  useEffect(() => {
    if (selected != null) return;
    for (let i = 0; i < emoteStore.rows.length; i++) {
      if (emoteStore.headers.includes(i)) continue;
      setCords({row: i, col: 0});
      break;
    }
  }, [selected]);

  const renderRow = useCallback(
    ({key, style, index, className}) => {
      const row = emoteStore.getRow(index);
      return emoteStore.headers.includes(index) ? (
        <div key={key} style={style} className={classNames(className, styles.header)}>
          <Icon className={styles.headerIcon}>{row.icon}</Icon>
          <div className={styles.headerText}>{row.displayName.toUpperCase()}</div>
        </div>
      ) : (
        <div key={key} style={style} className={classNames(className, styles.row)}>
          {row.map((emote, col) => (
            <Emote
              active={index === cords.row && col === cords.col}
              emote={emote}
              onClick={onClick}
              onMouseOver={() => handleMouseOver(index, col)}
            />
          ))}
        </div>
      );
    },
    [cords]
  );

  const handleHeaderChange = useCallback((rowIndex) => {
    const header = emoteStore.getRow(rowIndex);
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

function SearchedEmotes({search, onClick, setSelected, arrowKeys}) {
  const wrapperRef = useRef(null);
  const emotes = useMemo(() => emoteStore.search(search), [search]);

  const [cords, setCords] = useState({row: 0, col: 0});

  const handleMouseOver = useCallback((row, col) => {
    if (navigationMode === NavigationModeTypes.MOUSE) {
      setCords({row, col});
    }
  }, []);

  useEffect(() => {
    if (emotes.length > 0) {
      setSelected(emotes[0][0]?.item);
    }
  }, [emotes]);

  useEffect(() => {
    const {row, col} = cords;
    const emote = emotes[row][col].item;
    setSelected(emote);
  }, [cords]);

  useEffect(() => {
    let {row, col} = cords;

    switch (true) {
      case arrowKeys.top: {
        row -= 1;
        const newRow = emotes[row];
        if (newRow != null && col > newRow.length - 1) {
          col = newRow.length - 1;
        }
        break;
      }
      case arrowKeys.down: {
        row += 1;
        const newRow = emotes[row];
        if (newRow != null && col > newRow.length - 1) {
          col = newRow.length - 1;
        }
        break;
      }
      case arrowKeys.left: {
        col -= 1;
        if (col < 0) {
          row -= 1;
          const newRow = emotes[row];
          col = newRow != null ? newRow.length - 1 : col;
        }
        break;
      }
      case arrowKeys.right: {
        col += 1;
        if (col > emotes[row].length - 1) {
          row += 1;
          const newRow = emotes[row];
          col = newRow != null ? 0 : col;
        }
        break;
      }
      default:
        return;
    }

    // Scroll if arrow keys go out of bounds

    if (row >= 0 && row < emotes.length) {
      setCords({row, col});

      const depth = row * ROW_HEIGHT;
      const {scrollTop} = wrapperRef.current;

      if (depth < scrollTop + ROW_HEIGHT) {
        wrapperRef.current.scrollTo(0, depth);
      }

      if (depth + ROW_HEIGHT > scrollTop + WINDOW_HEIGHT) {
        wrapperRef.current.scrollTo(0, depth + ROW_HEIGHT - WINDOW_HEIGHT + OFFSET);
      }
    }
  }, [arrowKeys]);

  const renderRow = useCallback(
    ({key, style, index, className}) => {
      const row = emotes[index];
      if (row == null) return null;
      return (
        <div key={key} style={style} className={classNames(className, styles.row)}>
          {row.map(({item}, col) => (
            <Emote
              emote={item}
              onClick={onClick}
              onMouseOver={() => handleMouseOver(index, col)}
              active={index === cords.row && col === cords.col}
            />
          ))}
        </div>
      );
    },
    [emotes, cords]
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
      ref={wrapperRef}
      rowHeight={ROW_HEIGHT}
      windowHeight={WINDOW_HEIGHT}
      totalRows={emotes.length}
      renderRow={renderRow}
      className={classNames(styles.emotesContainer, styles.searched)}
    />
  );
}

export default function renderEmotes(props) {
  const {search, arrowKeys} = props;

  useEffect(() => {
    navigationMode = NavigationModeTypes.ARROW_KEYS;
  }, [arrowKeys]);

  useEffect(() => {
    function callback() {
      navigationMode = NavigationModeTypes.MOUSE;
    }

    window.addEventListener('mousemove', callback);

    return () => {
      window.removeEventListener('mousemove', callback);
    };
  });

  return search.length > 0 ? <SearchedEmotes {...props} /> : <Emotes {...props} />;
}
