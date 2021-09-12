import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import classNames from 'classnames';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';
import Icons from './Icons.jsx';
import {NavigationModeTypes, RowHeight, WindowHeight} from '../../../constants.js';
import keycodes from '../../../utils/keycodes.js';

const MAX_COLUMN_COUNT = 6;

let navigationMode = NavigationModeTypes.MOUSE;

function travelUp(rowColumnCounts, {x, y}, numBlocks = 1) {
  let newY = Math.max(0, y - numBlocks);
  let newYColumnCount = rowColumnCounts[newY];

  // if we've reached a row without columns, we want to travel upwards again
  if (newYColumnCount === 0) {
    if (newY > 0) {
      return travelUp(rowColumnCounts, {x, y}, numBlocks + 1);
    }

    // if we've reached the top, we have nowhere else to go.. the existing Y must be the first
    newY = y;
    newYColumnCount = rowColumnCounts[y];
  }

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

function travelDown(rowColumnCounts, {x, y}, numBlocks = 1) {
  const maxY = rowColumnCounts.length - 1;
  let newY = Math.min(y + numBlocks, maxY);
  let newYColumnCount = rowColumnCounts[newY];

  // if we've reached a row without columns, we want to travel downwards again
  if (newYColumnCount === 0) {
    if (newY < maxY) {
      return travelDown(rowColumnCounts, {x, y}, numBlocks + 1);
    }

    // if we've reached the bottom, we have nowhere else to go.. the existing Y must be the last
    newY = y;
    newYColumnCount = rowColumnCounts[y];
  }

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

function travelLeft(rowColumnCounts, {x, y}) {
  // if it's the first in the row, we want to wrap around
  if (x === 0) {
    const {x: newX, y: newY} = travelUp(rowColumnCounts, {x: MAX_COLUMN_COUNT, y});
    // if y did not decrease, we must be at the start and this is the left-most
    if (newY >= y) {
      return {x, y};
    }
    return {x: newX, y: newY};
  }

  return {x: x - 1, y};
}

function travelRight(rowColumnCounts, {x, y}) {
  // if it's the last in the row, we want to wrap around
  if (x === rowColumnCounts[y] - 1) {
    const {x: newX, y: newY} = travelDown(rowColumnCounts, {x: 0, y});
    // if y did not increase, we must be at the end and this is the right-most
    if (newY <= y) {
      return {x, y};
    }
    return {x: newX, y: newY};
  }

  return {x: x + 1, y};
}

function travelBottom(rowColumnCounts, {x}) {
  const newY = rowColumnCounts.length - 1;
  const newYColumnCount = rowColumnCounts[newY];

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

function travelTop(rowColumnCounts, {x}) {
  let newY = 0;
  let newYColumnCount = rowColumnCounts[0];

  if (newYColumnCount === 0) {
    const {y} = travelDown(rowColumnCounts, {x, y: 0});
    newYColumnCount = rowColumnCounts[y];
    newY = y;
  }

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

const Emotes = React.forwardRef(
  ({onClick, section, onSection, setCords, cords, setRowColumnCounts, rows, setSelected}, ref) => {
    const handleMouseOver = useCallback((newCords) => {
      if (navigationMode === NavigationModeTypes.MOUSE) {
        setCords(newCords);
      }
    }, []);

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
                active={y === cords.y && x === cords.x}
                emote={emote}
                onClick={onClick}
                onMouseOver={() => handleMouseOver({x, y})}
              />
            ))}
          </div>
        );
      },
      [cords, onClick]
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

const SearchedEmotes = React.forwardRef(({search, onClick, cords, setCords, setRowColumnCounts, setSelected}, ref) => {
  const emotes = useMemo(() => emoteStore.search(search), [search]);

  const handleMouseOver = useCallback((newCords) => {
    if (navigationMode === NavigationModeTypes.MOUSE) {
      setCords(newCords);
    }
  }, []);

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
});

function useGridKeyboardNavigation(setKeyPressCallback, rowColumnCounts) {
  const [cords, setCords] = useState({x: 0, y: 0});

  const handleKeyPress = useCallback(
    (event) => {
      navigationMode = NavigationModeTypes.ARROW_KEYS;

      let newCords = null;

      switch (event.keyCode) {
        case keycodes['8numpad']:
        case keycodes.UpArrow:
          newCords = travelUp(rowColumnCounts, cords);
          event.preventDefault();
          break;
        case keycodes['2numpad']:
        case keycodes.DownArrow:
          newCords = travelDown(rowColumnCounts, cords);
          event.preventDefault();
          break;
        case keycodes['6numpad']:
        case keycodes.RightArrow:
          newCords = travelRight(rowColumnCounts, cords);
          event.preventDefault();
          break;
        case keycodes['4numpad']:
        case keycodes.LeftArrow:
          newCords = travelLeft(rowColumnCounts, cords);
          event.preventDefault();
          break;
        case keycodes.End:
          newCords = travelBottom(rowColumnCounts, cords);
          event.preventDefault();
          break;
        case keycodes.Home:
          newCords = travelTop(rowColumnCounts, cords);
          event.preventDefault();
          break;
        default:
          return;
      }

      setCords(newCords);
    },
    [cords, rowColumnCounts]
  );

  useEffect(() => setKeyPressCallback(handleKeyPress), [handleKeyPress]);

  return [cords, setCords];
}

export default function renderEmotes(props) {
  const {search, setKeyPressCallback} = props;

  const [rowColumnCounts, setRowColumnCounts] = useState([]);
  const [cords, setCords] = useGridKeyboardNavigation(setKeyPressCallback, rowColumnCounts);

  const wrapperRef = useRef(null);

  const isSearch = search.length > 0;

  useEffect(() => {
    function callback() {
      navigationMode = NavigationModeTypes.MOUSE;
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
      cords={cords}
      setCords={setCords}
      {...props}
    />
  ) : (
    <Emotes ref={wrapperRef} setRowColumnCounts={setRowColumnCounts} cords={cords} setCords={setCords} {...props} />
  );
}
