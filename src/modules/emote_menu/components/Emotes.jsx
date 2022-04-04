import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import chunk from 'lodash.chunk';
import VirtualizedList from './VirtualizedList.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import styles from './Emotes.module.css';
import EmoteButton from './EmoteButton.jsx';
import Icons from './Icons.jsx';
import {NavigationModeTypes, EMOTE_MENU_GRID_ROW_HEIGHT, EMOTE_MENU_GRID_HEIGHT} from '../../../constants.js';
import useGridKeyboardNavigation from '../hooks/GridKeyboardNavigation.jsx';

const BrowseEmotes = React.forwardRef(
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
        const row = emoteMenuViewStore.getRow(y);
        return emoteMenuViewStore.headers.includes(y) ? (
          <div key={key} style={style} className={classNames(className, styles.header)}>
            <div className={styles.headerIcon}>{row.icon}</div>
            <div className={styles.headerText}>{row.displayName.toUpperCase()}</div>
          </div>
        ) : (
          <div key={key} style={style} className={classNames(className, styles.row)}>
            {row.map((emote, x) => (
              <EmoteButton
                key={`${emote.category.id}-${emote.id}`}
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
      const header = emoteMenuViewStore.getRow(rowIndex);
      if (header != null) {
        onSection(header.id);
      }
    });

    useEffect(() => {
      const currentRef = ref.current;
      if (!section.scrollTo || currentRef == null) {
        return;
      }
      const index = emoteMenuViewStore.getCategoryIndexById(section.eventKey);
      if (index != null) {
        currentRef.scrollTo(0, index * EMOTE_MENU_GRID_ROW_HEIGHT + 1); // + 1 to be inside the section
      }
    }, [section]);

    return (
      <VirtualizedList
        stickyRows={emoteMenuViewStore.headers}
        rowHeight={EMOTE_MENU_GRID_ROW_HEIGHT}
        windowHeight={EMOTE_MENU_GRID_HEIGHT}
        totalRows={emoteMenuViewStore.rows.length}
        renderRow={renderRow}
        className={styles.emotesContainer}
        onHeaderChange={handleHeaderChange}
        ref={ref}
      />
    );
  }
);

const SearchEmotes = React.forwardRef(
  ({search, onClick, coords, setCoords, setRowColumnCounts, setSelected, navigationMode}, ref) => {
    const emotes = useMemo(
      () => chunk(emoteMenuViewStore.search(search), emoteMenuViewStore.totalCols),
      [search, emoteMenuViewStore.totalCols]
    );

    const handleMouseOver = useCallback(
      (newCoords) => {
        if (navigationMode === NavigationModeTypes.MOUSE) {
          setCoords(newCoords);
        }
      },
      [navigationMode]
    );

    useEffect(() => {
      const item = emotes?.[coords.y]?.[coords.x]?.item;
      if (item == null) {
        return;
      }
      setSelected(item);
    }, [coords]);

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
              <EmoteButton
                key={`${item.category.id}${item.id}`}
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
        rowHeight={EMOTE_MENU_GRID_ROW_HEIGHT}
        windowHeight={EMOTE_MENU_GRID_HEIGHT}
        totalRows={emotes.length}
        renderRow={renderRow}
        className={classNames(styles.emotesContainer, styles.searched)}
        stickyRows={[]}
      />
    );
  }
);

export default function Emotes(props) {
  const {search, setKeyPressCallback} = props;

  const [rowColumnCounts, setRowColumnCounts] = useState([]);
  const [navigationMode, setNavigationMode] = useState(NavigationModeTypes.MOUSE);
  const [coords, setCoords] = useGridKeyboardNavigation(
    setKeyPressCallback,
    rowColumnCounts,
    setNavigationMode,
    emoteMenuViewStore.totalCols
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
    const currentRef = wrapperRef.current;
    if (navigationMode !== NavigationModeTypes.ARROW_KEYS || currentRef == null) {
      return;
    }

    const depth = coords.y * EMOTE_MENU_GRID_ROW_HEIGHT;
    const {scrollTop} = currentRef;

    if (depth < scrollTop + EMOTE_MENU_GRID_ROW_HEIGHT) {
      currentRef.scrollTo(0, isSearch ? depth : depth - EMOTE_MENU_GRID_ROW_HEIGHT);
    }

    if (depth + EMOTE_MENU_GRID_ROW_HEIGHT >= scrollTop + EMOTE_MENU_GRID_HEIGHT) {
      currentRef.scrollTo(0, depth + EMOTE_MENU_GRID_ROW_HEIGHT - EMOTE_MENU_GRID_HEIGHT);
    }
  }, [coords]);

  return isSearch ? (
    <SearchEmotes
      ref={wrapperRef}
      setRowColumnCounts={setRowColumnCounts}
      navigationMode={navigationMode}
      coords={coords}
      setCoords={setCoords}
      {...props}
    />
  ) : (
    <BrowseEmotes
      ref={wrapperRef}
      setRowColumnCounts={setRowColumnCounts}
      navigationMode={navigationMode}
      coords={coords}
      setCoords={setCoords}
      {...props}
    />
  );
}
