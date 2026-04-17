import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import emoteMenuViewStore, {CategoryPositions} from '../../../common/stores/emote-menu-view-store.js';
import {EMOTE_MENU_GRID_ROW_HEIGHT, EmoteMenuTips} from '../../../constants.js';
import useHorizontalResize from '../hooks/HorizontalResize.jsx';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Tip, {markTipAsSeen} from './Tip.jsx';
import styles from './EmoteMenu.module.css';
import classNames from 'classnames';
import EmoteList from './EmoteList.jsx';
import keyCodes from '../../../utils/keycodes.js';
import {useDisclosure, useResizeObserver} from '@mantine/hooks';
import {autoUpdate, offset, useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {isMac} from '../../../utils/window.js';
import useEmoteMenuViewStoreUpdated from '../../../common/hooks/EmoteMenuViewStore.jsx';

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
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const altPressed = useRef(false);
  const shiftPressed = useRef(false);
  const [section, setSection] = useState(null);
  const [opened, {close, open, toggle}] = useDisclosure(false);
  const width = useHorizontalResize({boundingQuerySelector, handleRef});
  const [emoteListRef, emoteListRect] = useResizeObserver();
  const [pendingScrollRowIndex, setPendingScrollRowIndex] = useState(null);

  useLayoutEffect(() => {
    if (emoteListRef.current == null) {
      return;
    }

    const clientWidth = emoteListRef.current.clientWidth;
    emoteMenuViewStore.updateTotalColumns(clientWidth);
  }, [emoteListRect.width]);

  const [emoteListData, setEmoteListData] = useState({
    rows: [],
    totalCols: 0,
    categories: getCategories(),
  });

  const handleScrollToPendingRow = useCallback(
    (pendingScrollRowIndex) => {
      const listEl = emoteListRef.current;
      if (listEl == null) {
        return;
      }

      if (emoteListData.rows.length === 0) {
        return;
      }

      const scrollTop = pendingScrollRowIndex * EMOTE_MENU_GRID_ROW_HEIGHT + 1;
      listEl.scrollTo(0, scrollTop);
    },
    [emoteListData.rows]
  );

  const updateEmoteListData = useCallback((currentSearch = '') => {
    let rows = emoteMenuViewStore.rows;

    if (currentSearch.length > 0) {
      handleScrollToPendingRow(0);
      rows = emoteMenuViewStore.search(currentSearch);
    }

    setEmoteListData({
      rows,
      totalCols: emoteMenuViewStore.totalCols,
      categories: getCategories(),
    });

    setSearch(currentSearch);
  }, []);

  useEmoteMenuViewStoreUpdated(opened, updateEmoteListData);

  const {refs, floatingStyles, context} = useFloating({
    strategy: 'fixed',
    open: opened,
    onOpenChange: (isOpen) => (isOpen ? open() : close()),
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

  useLayoutEffect(() => {
    const listEl = emoteListRef.current;

    if (listEl != null && opened) {
      listEl.scrollTo(0, 0);
    }

    const chatTextArea = document.querySelector(boundingQuerySelector);
    refs.setPositionReference(chatTextArea);
  }, [opened]);

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

      close();
    },
    [close]
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
      updateEmoteListData('');
      setSection(eventKey);

      const index = emoteMenuViewStore.getCategoryIndexById(eventKey);
      if (index == null || !shouldScroll) {
        return;
      }

      handleScrollToPendingRow(index);
    },
    [updateEmoteListData, handleScrollToPendingRow]
  );

  const onSection = useCallback((eventKey) => handleSection(eventKey, false), [handleSection]);
  const style = useMemo(() => ({...floatingStyles, width}), [floatingStyles, width]);

  return (
    <div
      ref={refs.setFloating}
      className={classNames(styles.emoteMenu, {[styles.emoteMenuHidden]: !opened})}
      style={style}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyEvent}
      {...restProps}>
      <div className={styles.emoteMenuContent}>
        <div ref={handleRef} className={styles.resizeHandle} />
        <Header
          opened={opened}
          className={styles.header}
          value={search}
          onChange={updateEmoteListData}
          toggleWhisper={close}
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
          setSelected={setSelected}
          className={styles.emotes}
          section={section}
          onClick={handleClick}
          setKeyPressCallback={setKeyPressCallback}
          onSection={onSection}
        />
      </div>
      {opened ? <Tip className={styles.tip} onClose={close} /> : null}
    </div>
  );
}

export default EmoteMenu;
