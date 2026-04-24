import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import emoteMenuViewStore, {CategoryPositions} from '../../../common/stores/emote-menu-view-store.js';
import {EMOTE_MENU_GRID_ROW_HEIGHT, EmoteMenuTips, NavigationModeTypes} from '../../../constants.js';
import useHorizontalResize from '../hooks/HorizontalResize.jsx';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Tip, {markTipAsSeen} from './Tip.jsx';
import styles from './EmoteMenu.module.css';
import EmoteList from './EmoteList.jsx';
import keyCodes from '../../../utils/keycodes.js';
import {useDisclosure, useFocusTrap} from '@mantine/hooks';
import {autoUpdate, offset, useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {isMac} from '../../../utils/window.js';
import useEmoteMenuViewStoreUpdated from '../../../common/hooks/EmoteMenuViewStore.jsx';
import {
  getCoordsOfSelected,
  getFirstCoords,
  getFirstCoordsInCategory,
  getSelectedAtCoords,
} from '../utils/emote-list-grid.js';
import classNames from 'classnames';

let keyPressCallback;
function setKeyPressCallback(newKeyPressCallback) {
  keyPressCallback = newKeyPressCallback;
}

function getCategories() {
  return {
    top: emoteMenuViewStore.getCategories(CategoryPositions.TOP),
    middle: emoteMenuViewStore.getCategories(CategoryPositions.MIDDLE),
    bottom: emoteMenuViewStore.getCategories(CategoryPositions.BOTTOM),
  };
}

function EmoteMenu({
  setHandleOpen,
  appendToChat,
  boundingQuerySelector,
  offsetOptions = {},
  emoteMenuToggleButtonSelector,
}) {
  const handleRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const altPressed = useRef(false);
  const shiftPressed = useRef(false);
  const [section, setSection] = useState(null);
  const [opened, {close, open}] = useDisclosure(false);
  const width = useHorizontalResize({boundingQuerySelector, handleRef, open: opened});
  const emoteListRef = useRef(null);
  const [emoteListCoords, setEmoteListCoords] = useState({x: 0, y: 0});
  const [navigationMode, setNavigationMode] = useState(NavigationModeTypes.ARROW_KEYS);
  const focusRef = useFocusTrap(opened && navigationMode === NavigationModeTypes.ARROW_KEYS);

  const [emoteListData, setEmoteListData] = useState({
    search: '',
    rows: [],
    totalCols: emoteMenuViewStore.totalCols,
    categories: getCategories(),
  });

  const emoteListDataRef = useRef(emoteListData);

  const handleCoordsChange = useCallback(
    (newCoords) => {
      const currentEmoteListData = emoteListDataRef.current;
      if (currentEmoteListData.rows.length === 0) {
        return;
      }

      if (newCoords == null) {
        newCoords = getFirstCoords(currentEmoteListData.rows);
      }

      const selected = getSelectedAtCoords(currentEmoteListData.rows, newCoords);
      if (section == null && selected != null) {
        setSection(selected.category.id);
      }

      setSelected(selected);
      setEmoteListCoords(newCoords);
    },
    [setSelected, setEmoteListCoords, section]
  );

  const {refs, floatingStyles, context} = useFloating({
    strategy: 'fixed',
    open: opened,
    onOpenChange: (isOpen) => (isOpen ? handleOpen() : handleClose()),
    placement: 'top-end',
    middleware: [offset(offsetOptions)],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context, {
    outsidePress(event) {
      if (emoteMenuToggleButtonSelector == null || emoteMenuToggleButtonSelector.length === 0) {
        return true;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return true;
      }

      return target.closest(emoteMenuToggleButtonSelector) == null;
    },
  });

  const {getFloatingProps} = useInteractions([dismiss]);

  const handleOpen = useCallback(() => {
    open();

    const chatTextArea = document.querySelector(boundingQuerySelector);
    refs.setPositionReference(chatTextArea);
  }, [open, boundingQuerySelector, refs]);

  const handleScrollToPendingRow = useCallback((pendingScrollRowIndex) => {
    const listEl = emoteListRef.current;
    if (listEl == null) {
      return;
    }

    const currentEmoteListData = emoteListDataRef.current;
    if (currentEmoteListData.rows.length === 0) {
      return;
    }

    const scrollTop = pendingScrollRowIndex * EMOTE_MENU_GRID_ROW_HEIGHT + 1;
    listEl.scrollTo(0, scrollTop);
  }, []);

  const handleClose = useCallback(() => {
    close();

    const currentEmoteListData = emoteListDataRef.current;
    if (currentEmoteListData.rows.length === 0) {
      return;
    }

    const firstCoords = getFirstCoords(currentEmoteListData.rows);
    if (firstCoords != null) {
      handleCoordsChange(firstCoords);
    }

    handleScrollToPendingRow(0);
    setNavigationMode(NavigationModeTypes.ARROW_KEYS);
  }, [close, handleCoordsChange, handleScrollToPendingRow]);

  const toggle = useCallback(() => (opened ? handleClose() : handleOpen()), [opened, handleClose, handleOpen]);

  const updateEmoteListData = useCallback((currentSearch = '') => {
    let rows = emoteMenuViewStore.rows;

    if (currentSearch.length > 0) {
      rows = emoteMenuViewStore.search(currentSearch);
    }

    const newData = {
      rows,
      search: currentSearch,
      totalCols: emoteMenuViewStore.totalCols,
      categories: getCategories(),
    };

    setEmoteListData(newData);
    emoteListDataRef.current = newData;

    return newData;
  }, []);

  const handleEmoteMenuViewStoreUpdate = useCallback(
    (newData) => {
      const parsedData = updateEmoteListData(newData);

      let newCoords = getCoordsOfSelected(parsedData.rows, selected);
      if (newCoords == null) {
        newCoords = getFirstCoords(parsedData.rows);
      }

      handleCoordsChange(newCoords);
    },
    [selected, handleCoordsChange, updateEmoteListData]
  );

  useEmoteMenuViewStoreUpdated(opened, handleEmoteMenuViewStoreUpdate);

  useEffect(() => {
    function handleKeyDown(event) {
      const isPressed =
        (event.altKey && event.key === keyCodes.E) || (isMac() && event.ctrlKey && event.key === keyCodes.E);
      if (!isPressed) {
        return;
      }

      event.preventDefault();
      toggle();
      markTipAsSeen(EmoteMenuTips.EMOTE_MENU_HOTKEY);
    }

    setHandleOpen(toggle);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggle]);

  const handleClick = useCallback(
    (emote) => {
      if (altPressed.current) {
        emoteMenuViewStore.toggleFavorite(emote);
        markTipAsSeen(EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE);
        return;
      }

      if (emote.metadata?.isLocked?.() ?? false) {
        return;
      }

      appendToChat(emote, !shiftPressed.current);
      emoteMenuViewStore.trackHistory(emote);

      if (shiftPressed.current) {
        markTipAsSeen(EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE);
        return;
      }

      handleClose();
    },
    [handleClose]
  );

  const handleKeyEvent = useCallback((event) => {
    altPressed.current = event.altKey;
    shiftPressed.current = event.shiftKey;
  }, []);

  const {onKeyDown, ...restProps} = getFloatingProps();

  const handleKeyDown = useCallback(
    (event) => {
      onKeyDown(event);
      handleKeyEvent(event);

      /* Events like keydown are sometimes prevented by twitch,
      likely because it can't locate the focused element inside the shadow dom.
      To prevent this we stop it from bubbling upstream */
      event.stopPropagation();

      if (event.key === keyCodes.Enter) {
        handleClick(selected);
        return;
      }

      keyPressCallback(event, shiftPressed.current);
    },
    [handleClick, keyPressCallback, selected]
  );

  const handleSection = useCallback(
    (eventKey, shouldScroll = true) => {
      const parsedData = updateEmoteListData('');
      setSection(eventKey);

      const index = emoteMenuViewStore.getCategoryIndexById(eventKey);
      if (index == null || !shouldScroll) {
        return;
      }

      const firstInCategory = getFirstCoordsInCategory(parsedData.rows, eventKey);
      if (firstInCategory != null) {
        handleCoordsChange(firstInCategory);
      }

      handleScrollToPendingRow(index);
    },
    [updateEmoteListData, handleScrollToPendingRow, handleCoordsChange]
  );

  const onSection = useCallback((eventKey) => handleSection(eventKey, false), [handleSection]);
  const style = useMemo(() => ({...floatingStyles, width}), [floatingStyles, width]);

  const handleSearchChange = useCallback(
    (search) => {
      handleScrollToPendingRow(0);
      setNavigationMode(NavigationModeTypes.ARROW_KEYS);
      const parsedData = updateEmoteListData(search);
      handleCoordsChange(getFirstCoords(parsedData.rows));
    },
    [updateEmoteListData, handleCoordsChange, handleScrollToPendingRow]
  );

  return (
    <div
      ref={refs.setFloating}
      className={classNames(styles.emoteMenu, {[styles.hidden]: !opened})}
      style={style}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyEvent}
      {...restProps}>
      <div className={styles.emoteMenuContent}>
        <div ref={handleRef} className={styles.resizeHandle} />
        <Header
          focusRef={focusRef}
          opened={opened}
          className={styles.header}
          value={emoteListData.search}
          onChange={handleSearchChange}
          toggleWhisper={toggle}
          selected={selected}
        />
        <Sidebar
          className={styles.sidebar}
          section={section}
          onClick={handleSection}
          categories={emoteListData.categories}
        />
        <EmoteList
          data={emoteListData}
          ref={emoteListRef}
          selected={selected}
          className={styles.emotes}
          section={section}
          onClick={handleClick}
          setKeyPressCallback={setKeyPressCallback}
          onSection={onSection}
          navigationMode={navigationMode}
          setNavigationMode={setNavigationMode}
          coords={emoteListCoords}
          setCoords={handleCoordsChange}
        />
      </div>
      {opened ? <Tip className={styles.tip} onClose={handleClose} /> : null}
    </div>
  );
}

export default EmoteMenu;
