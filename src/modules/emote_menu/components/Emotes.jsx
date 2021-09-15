import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import classNames from 'classnames';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';
import Icons from './Icons.jsx';
import {NavigationModeTypes, RowHeight, WindowHeight} from '../../../constants.js';
import useGridKeyboardNavigation from './GridKeyboardNavigation.jsx';

const Emotes = React.forwardRef(
  ({onClick, section, onSection, setCoords, coords, setRowColumnCounts, rows, setSelected, navigationMode}, ref) => {
    useEffect(() => {
      const rowColumnCounts = [];

      for (const row of rows) {
        rowColumnCounts.push(!Array.isArray(row) ? 0 : row.length);
      }
      setRowColumnCounts(rowColumnCounts);
    }, [rows]);

    useEffect(() => setSelected(rows[coords.y][coords.x]), [coords]);

    useEffect(() => {
      for (const row of rows) {
        if (Array.isArray(row)) {
          setSelected(row[0]);
          break;
        }
      }
    }, []);

    const renderRow = useCallback(
      ({key, style, index: y, className}) => {
        const row = emoteStore.getRow(y);
        return emoteStore.headers.includes(y) ? (
          <div key={key} style={style} className={classNames(className, styles.header)}>
            <Icon className={styles.headerIcon}>{row.icon}</Icon>
            <div className={styles.headerText}>{row.displayName.toUpperCase()}</div>
          </div>
        ) : (
          <div key={key} style={style} className={classNames(className, styles.row)}>
            {row.map((emote, x) => (
              <Emote
                key={`${emote.provider.id}-${emote.id}`}
                active={y === coords.y && x === coords.x}
                emote={emote}
                onClick={onClick}
                onMouseOver={() => {
                  if (navigationMode === NavigationModeTypes.MOUSE) {
                    setCoords({x, y});
                  }
                }}
              />
            ))}
          </div>
        );
      },
      [coords, onClick, navigationMode]
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
        ref.current.scrollTo(0, index * RowHeight + 1); // + 1 to be inside the section
      }
    }, [section]);

    return (
      <VirtualizedList
        stickyRows={emoteStore.headers}
        rowHeight={RowHeight}
        windowHeight={WindowHeight}
        totalRows={emoteStore.rows.length}
        renderRow={renderRow}
        className={styles.emotesContainer}
        onHeaderChange={handleHeaderChange}
        ref={ref}
      />
    );
  }
);

const SearchedEmotes = React.forwardRef(
  ({search, onClick, coords, setCoords, setRowColumnCounts, setSelected, navigationMode}, ref) => {
    const emotes = useMemo(() => emoteStore.search(search), [search]);

    const handleMouseOver = useCallback(
      (newCoords) => {
        if (navigationMode === NavigationModeTypes.MOUSE) {
          setCoords(newCoords);
        }
      },
      [navigationMode]
    );

    useEffect(() => setSelected(emotes[coords.y][coords.x].item), [coords]);

    useEffect(() => {
      const rowColumnCounts = [];
      let foundFirstEmote = false;

      for (const [y, row] of emotes.entries()) {
        rowColumnCounts.push(!Array.isArray(row) ? 0 : row.length);

        if (Array.isArray(row) && !foundFirstEmote) {
          setCoords({y, x: 0});
          foundFirstEmote = true;
        }
      }
      setRowColumnCounts(rowColumnCounts);
    }, [emotes]);

    const renderRow = useCallback(
      ({key, style, index: y, className}) => {
        const row = emotes[y];
        if (row == null) return null;
        return (
          <div key={key} style={style} className={classNames(className, styles.row)}>
            {row.map(({item}, x) => (
              <Emote
                key={`${item.provider.id}${item.id}`}
                emote={item}
                onClick={onClick}
                onMouseOver={() => handleMouseOver({x, y})}
                active={x === coords.x && y === coords.y}
              />
            ))}
          </div>
        );
      },
      [emotes, coords, onClick]
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
        ref={ref}
        rowHeight={RowHeight}
        windowHeight={WindowHeight}
        totalRows={emotes.length}
        renderRow={renderRow}
        className={classNames(styles.emotesContainer, styles.searched)}
        stickyRows={[]}
      />
    );
  }
);

export default function renderEmotes(props) {
  const {search, setKeyPressCallback} = props;

  const [rowColumnCounts, setRowColumnCounts] = useState([]);
  const [navigationMode, setNavigationMode] = useState(NavigationModeTypes.MOUSE);
  const [coords, setCoords] = useGridKeyboardNavigation(
    setKeyPressCallback,
    rowColumnCounts,
    setNavigationMode,
    emoteStore.totalCols
  );

  const wrapperRef = useRef(null);

  const isSearch = search.length > 0;

  useEffect(() => {
    function callback() {
      setNavigationMode(NavigationModeTypes.MOUSE);
    }

    window.addEventListener('mousemove', callback);

    return () => {
      window.removeEventListener('mousemove', callback);
    };
  }, []);

  useEffect(() => {
    if (navigationMode !== NavigationModeTypes.ARROW_KEYS) {
      return;
    }

    const depth = coords.y * RowHeight;
    const {scrollTop} = wrapperRef.current;

    if (depth < scrollTop + RowHeight) {
      wrapperRef.current.scrollTo(0, isSearch ? depth : depth - RowHeight);
    }

    if (depth + RowHeight >= scrollTop + WindowHeight) {
      wrapperRef.current.scrollTo(0, depth + RowHeight - WindowHeight);
    }
  }, [coords]);

  return isSearch ? (
    <SearchedEmotes
      ref={wrapperRef}
      setRowColumnCounts={setRowColumnCounts}
      navigationMode={navigationMode}
      coords={coords}
      setCoords={setCoords}
      {...props}
    />
  ) : (
    <Emotes
      ref={wrapperRef}
      setRowColumnCounts={setRowColumnCounts}
      navigationMode={navigationMode}
      coords={coords}
      setCoords={setCoords}
      {...props}
    />
  );
}
