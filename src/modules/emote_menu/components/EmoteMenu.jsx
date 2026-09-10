import {autoUpdate, offset, useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {useDisclosure, useFocusTrap} from '@mantine/hooks';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollbarSizeTargetContext} from '@/common/components/Scrollbar';
import useEmoteMenuViewStoreUpdated from '@/common/hooks/EmoteMenuViewStore';
import emoteMenuViewStore, {CategoryPositions} from '@/common/stores/emote-menu-view-store';
import {EMOTE_MENU_GRID_ROW_HEIGHT, EmoteMenuModes, EmoteMenuTips, NavigationModeTypes} from '@/constants';
import useHorizontalResize from '@/modules/emote_menu/hooks/HorizontalResize';
import useGifPickerStore, {fetchGifPickerContext, updateGifResults} from '@/modules/emote_menu/stores/gif-picker-store';
import {
  getCoordsOfSelected,
  getFirstCoords,
  getFirstCoordsInCategory,
  getSelectedAtCoords,
} from '@/modules/emote_menu/utils/emote-list-grid';
import keyCodes from '@/utils/keycodes';
import {isMac} from '@/utils/window';
import EmoteList from './EmoteList';
import styles from './EmoteMenu.module.css';
import GifPicker from './GifPicker';
import Header from './Header';
import Sidebar from './Sidebar';
import Tip, {markTipAsSeen} from './Tip';

const UPDATE_GIF_RESULTS_DEBOUNCE_MS = 300;

const updateGifResultsDebounced = debounce(updateGifResults, UPDATE_GIF_RESULTS_DEBOUNCE_MS);

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
  placement = 'top-end',
  setHandleOpen,
  appendToChat,
  boundingQuerySelector,
  offsetOptions = {},
  emoteMenuToggleButtonSelector,
}) {
  const handleRef = useRef(null);
  const emoteMenuContentRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const altPressedRef = useRef(false);
  const shiftPressedRef = useRef(false);
  const [section, setSection] = useState(null);
  const [opened, {close, open}] = useDisclosure(false);
  const [mode, setMode] = useState(EmoteMenuModes.EMOTES);
  const gifContext = useGifPickerStore((state) => state.gifContext);
  const width = useHorizontalResize({boundingQuerySelector, handleRef, open: opened, placement});
  const emoteListRef = useRef(null);
  const [emoteListCoords, setEmoteListCoords] = useState({x: 0, y: 0});
  const [navigationMode, setNavigationMode] = useState(NavigationModeTypes.ARROW_KEYS);
  const focusRef = useFocusTrap(opened && navigationMode === NavigationModeTypes.ARROW_KEYS);

  const [emoteListData, setEmoteListData] = useState(() => ({
    search: '',
    rows: [],
    totalCols: emoteMenuViewStore.totalCols,
    categories: getCategories(),
  }));

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
        setSection(selected.parentCategory?.id ?? selected.category.id);
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
    placement,
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
    fetchGifPickerContext();

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

  const handleClose = useCallback(() => {
    const listEl = emoteListRef.current;
    if (listEl != null) {
      listEl.scrollTo(0, 0);
    }

    close();
    updateGifResultsDebounced.cancel();
    setMode(EmoteMenuModes.EMOTES);
    setNavigationMode(NavigationModeTypes.ARROW_KEYS);
    updateEmoteListData('');
    setSection(null);
    handleCoordsChange(null);
  }, [updateEmoteListData, handleCoordsChange, setSection, close, setNavigationMode]);

  const toggle = useCallback(() => (opened ? handleClose() : handleOpen()), [opened, handleClose, handleOpen]);

  const handleEmoteMenuViewStoreUpdate = useCallback(() => {
    const currentSearch = emoteListDataRef.current.search;
    const parsedData = updateEmoteListData(currentSearch);

    let newCoords = getCoordsOfSelected(parsedData.rows, selected);
    if (newCoords == null) {
      newCoords = getFirstCoords(parsedData.rows);
    }

    handleCoordsChange(newCoords);
  }, [selected, handleCoordsChange, updateEmoteListData]);

  useEmoteMenuViewStoreUpdated(opened, handleEmoteMenuViewStoreUpdate);

  const handleToggleHotkey = useCallback(
    (event) => {
      const isPressed =
        (event.altKey && event.key === keyCodes.E) || (isMac() && event.ctrlKey && event.key === keyCodes.E);
      if (!isPressed) {
        return;
      }

      event.preventDefault();
      toggle();
      markTipAsSeen(EmoteMenuTips.EMOTE_MENU_HOTKEY);

      document.activeElement.blur();
    },
    [toggle]
  );

  useEffect(() => {
    setHandleOpen(toggle);
    document.addEventListener('keydown', handleToggleHotkey);
    return () => document.removeEventListener('keydown', handleToggleHotkey);
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- setHandleOpen prop is stable
  }, [handleToggleHotkey, toggle]);

  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  const handleClick = useCallback((emote) => {
    if (altPressedRef.current) {
      emoteMenuViewStore.toggleFavorite(emote);
      markTipAsSeen(EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE);
      return;
    }

    if (emote.metadata?.isLocked?.() ?? false) {
      return;
    }

    appendToChat(emote, !shiftPressedRef.current);
    emoteMenuViewStore.trackHistory(emote);

    if (shiftPressedRef.current) {
      markTipAsSeen(EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE);
      return;
    }

    handleCloseRef.current();
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- runs once on mount
  }, []);

  const handleKeyEvent = useCallback((event) => {
    altPressedRef.current = event.altKey;
    shiftPressedRef.current = event.shiftKey;
  }, []);

  const {onKeyDown, ...restProps} = getFloatingProps();

  const handleKeyDown = useCallback(
    (event) => {
      onKeyDown(event);
      handleKeyEvent(event);
      handleToggleHotkey(event);

      /* Events like keydown are sometimes prevented by twitch,
      likely because it can't locate the focused element inside the shadow dom.
      To prevent this we stop it from bubbling upstream */
      event.stopPropagation();

      if (mode === EmoteMenuModes.GIFS) {
        return;
      }

      if (event.key === keyCodes.Enter) {
        handleClick(selected);
        return;
      }

      keyPressCallback(event, shiftPressedRef.current);
    },
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- handler dependencies are stable for this callback
    [handleClick, keyPressCallback, selected, mode]
  );

  const handleSection = useCallback(
    (eventKey, shouldScroll = true) => {
      updateGifResultsDebounced.cancel();
      setMode(EmoteMenuModes.EMOTES);
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
      if (mode === EmoteMenuModes.GIFS) {
        // the emote grid isn't visible, so only track the search text and skip
        // recomputing the emote rows until the user switches back
        const newData = {...emoteListDataRef.current, search};
        setEmoteListData(newData);
        emoteListDataRef.current = newData;

        updateGifResultsDebounced.cancel();
        const trimmedSearch = search.trim();
        if (trimmedSearch.length === 0) {
          // clearing the search skips the debounce
          updateGifResults('');
        } else {
          updateGifResultsDebounced(trimmedSearch);
        }
      } else if (mode === EmoteMenuModes.EMOTES) {
        handleScrollToPendingRow(0);
        setNavigationMode(NavigationModeTypes.ARROW_KEYS);
        const parsedData = updateEmoteListData(search);
        handleCoordsChange(getFirstCoords(parsedData.rows));
      }
    },
    [updateEmoteListData, handleCoordsChange, handleScrollToPendingRow, mode]
  );

  const handleModeChange = useCallback(
    (newMode) => {
      setMode(newMode);

      if (newMode === EmoteMenuModes.GIFS) {
        updateGifResults(emoteListDataRef.current.search);
        return;
      }

      updateGifResultsDebounced.cancel();
      const parsedData = updateEmoteListData(emoteListDataRef.current.search);
      handleCoordsChange(getFirstCoords(parsedData.rows));
    },
    [updateEmoteListData, handleCoordsChange]
  );

  const handleGifSent = useCallback(() => {
    handleCloseRef.current();
  }, []);

  return (
    <div
      ref={refs.setFloating}
      className={classNames(styles.emoteMenu, {[styles.hidden]: !opened})}
      style={style}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyEvent}
      {...restProps}>
      <ScrollbarSizeTargetContext value={emoteMenuContentRef}>
        <div ref={emoteMenuContentRef} className={styles.emoteMenuContent}>
          <div
            ref={handleRef}
            className={classNames(styles.resizeHandle, {
              [styles.resizeHandleTopEnd]: placement === 'top-end',
              [styles.resizeHandleTopStart]: placement === 'top-start',
            })}
          />
          <Header
            focusRef={focusRef}
            opened={opened}
            className={styles.header}
            value={emoteListData.search}
            onChange={handleSearchChange}
            toggleWhisper={toggle}
            selected={selected}
            mode={mode}
            gifsAvailable={gifContext != null}
            onModeChange={handleModeChange}
          />
          <Sidebar
            className={styles.sidebar}
            section={mode === EmoteMenuModes.GIFS ? null : section}
            onClick={handleSection}
            categories={emoteListData.categories}
          />
          {mode === EmoteMenuModes.GIFS && gifContext != null ? (
            <GifPicker className={styles.emotes} gifContext={gifContext} onSend={handleGifSent} />
          ) : (
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
          )}
        </div>
      </ScrollbarSizeTargetContext>
      {opened ? <Tip className={styles.tip} onClose={handleClose} /> : null}
    </div>
  );
}

export default EmoteMenu;
