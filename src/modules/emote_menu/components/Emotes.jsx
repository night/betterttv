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
  ({onClick, section, onSection, setCords, cords, setRowColumnCounts, rows, setSelected, navigationMode}, ref) => {
    useEffect(() => {
      const rowColumnCounts = [];

      for (const row of rows) {
        rowColumnCounts.push(!Array.isArray(row) ? 0 : row.length);
      }
      setRowColumnCounts(rowColumnCounts);
    }, [rows]);

    useEffect(() => setSelected(rows[cords.y][cords.x]), [cords]);

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
                active={y === cords.y && x === cords.x}
                emote={emote}
                onClick={onClick}
                onMouseOver={() => {
                  if (navigationMode === NavigationModeTypes.MOUSE) {
                    setCords({x, y});
                  }
                }}
              />
            ))}
          </div>
        );
      },
      [cords, onClick, navigationMode]
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
  ({search, onClick, cords, setCords, setRowColumnCounts, setSelected, navigationMode}, ref) => {
    const emotes = useMemo(() => emoteStore.search(search), [search]);

    const handleMouseOver = useCallback(
      (newCords) => {
        if (navigationMode === NavigationModeTypes.MOUSE) {
          setCords(newCords);
        }
      },
      [navigationMode]
    );

    useEffect(() => {
      const rowColumnCounts = [];
      let foundFirstEmote = false;

      for (const row of emotes) {
        rowColumnCounts.push(!Array.isArray(row) ? 0 : row.length);

        if (Array.isArray(row) && !foundFirstEmote) {
          setSelected(row[0].item);
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
                active={x === cords.x && y === cords.y}
              />
            ))}
          </div>
        );
      },
      [emotes, cords, onClick]
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
  const [cords, setCords] = useGridKeyboardNavigation(
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

    const depth = cords.y * RowHeight;
    const {scrollTop} = wrapperRef.current;

    if (depth < scrollTop + RowHeight) {
      wrapperRef.current.scrollTo(0, isSearch ? depth : depth - RowHeight);
    }

    if (depth + RowHeight >= scrollTop + WindowHeight) {
      wrapperRef.current.scrollTo(0, depth + RowHeight - WindowHeight);
    }
  }, [cords]);

  return isSearch ? (
    <SearchedEmotes
      ref={wrapperRef}
      setRowColumnCounts={setRowColumnCounts}
      navigationMode={navigationMode}
      cords={cords}
      setCords={setCords}
      {...props}
    />
  ) : (
    <Emotes
      ref={wrapperRef}
      setRowColumnCounts={setRowColumnCounts}
      navigationMode={navigationMode}
      cords={cords}
      setCords={setCords}
      {...props}
    />
  );
}
