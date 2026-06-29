import {autoUpdate, offset as floatingOffset, size, useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {faArrowDown, faArrowTurnDown, faArrowUp} from '@fortawesome/free-solid-svg-icons';
import {Kbd, Text} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import classNames from 'classnames';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import useDomObserver from '@/common/hooks/DomObserver';
import formatMessage from '@/i18n/index';
import keyCodes from '@/utils/keycodes';
import styles from './Autocomplete.module.css';
import Icon from './Icon';
import LogoIcon from './LogoIcon';
import Scrollbar from './Scrollbar';

const MAX_ITEMS_SHOWN = 8;
const MAX_WIDTH = 540;

const NavigationModeTypes = {
  MOUSE: 0,
  ARROW_KEYS: 1,
};

function travelUp(currentSelection, rowCount) {
  const newSelection = currentSelection - 1;

  if (newSelection <= -1) {
    return rowCount - 1;
  }

  return newSelection;
}

function travelDown(currentSelection, rowCount) {
  const newSelection = currentSelection + 1;

  if (newSelection > rowCount - 1) {
    return 0;
  }

  return newSelection;
}

// Returns the index of the whitespace-delimited word the caret sits in, where
// word 0 is the input itself (e.g. the command name). Callers that render
// arguments map argument N to word index N + 1.
function getFocusedWordIndex(value, caretPosition) {
  if (value == null || caretPosition == null) {
    return 0;
  }

  const beforeCaret = value.slice(0, caretPosition);
  return Math.max(0, beforeCaret.split(/\s+/).length - 1);
}

function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}

const AutocompleteListRow = React.memo(function AutocompleteListRow({
  item,
  renderRow,
  isSelected,
  isActive,
  focusedWordIndex,
  handleCompleteResultItem,
  onHover,
}) {
  return renderRow({
    item,
    onClick: () => handleCompleteResultItem(item),
    selected: isSelected,
    active: isActive,
    focusedWordIndex,
    onMouseOver: () => onHover(item),
  });
});

function Autocomplete({
  chatInputQuerySelector,
  handleCompleteResult,
  onComplete,
  getChatInputPartialInput,
  getChatInputCaretPosition,
  renderRow,
  computeItems,
  getItemKey,
  fullWidthOnSmallScreens = true,
  offset = 24,
  showKeyboardNavigationTips = true,
  getCompletionLength = null,
  onAppendSpace = null,
}) {
  const navigationModeRef = useRef(NavigationModeTypes.ARROW_KEYS);
  const [partialInput, setPartialInput] = useState('');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(0);
  const itemsRef = useRef(items);
  const selectedRef = useRef(selected);
  const [opened, {open, close}] = useDisclosure(false);
  const chatInputElement = useDomObserver(chatInputQuerySelector);
  const itemsBodyRef = useRef(null);
  const pendingCompleteRef = useRef(false);
  const lastValueRef = useRef(null);
  const openedRef = useRef(false);
  const updateAutocompleteSuggestionsRef = useRef(null);
  const updateAutocompleteSuggestionsRequestIdRef = useRef(0);
  const [pendingCompleteIndex, setPendingCompleteIndex] = useState(null);
  const [focusedWordIndex, setFocusedWordIndex] = useState(0);

  const handleMouseMove = useCallback(() => {
    navigationModeRef.current = NavigationModeTypes.MOUSE;
  }, []);

  const handleSelectedChange = useCallback((newSelected, forceScroll = false) => {
    setSelected(newSelected);

    selectedRef.current = newSelected;

    if (navigationModeRef.current === NavigationModeTypes.MOUSE && !forceScroll) {
      return;
    }

    if (itemsBodyRef.current == null || itemsRef.current.length === 0) {
      return;
    }

    const row = itemsBodyRef.current.children[newSelected];
    if (row == null) {
      return;
    }

    if (row instanceof HTMLElement) {
      row.scrollIntoView({block: 'nearest', inline: 'nearest'});
    }
  }, []);

  const handleClose = useCallback(() => {
    close();
    openedRef.current = false;
  }, [close]);

  const handleOpen = useCallback(() => {
    open();
    openedRef.current = true;
    navigationModeRef.current = NavigationModeTypes.ARROW_KEYS;
  }, [open]);

  const updateAutocompleteSuggestions = useCallback(
    async (newValue = null, newCaretPosition = null) => {
      const value = newValue ?? getChatInputPartialInput();
      const caretPosition = newCaretPosition ?? getChatInputCaretPosition?.();

      // Track which argument the caret sits in even when the text itself hasn't
      // changed (e.g. the user moved the caret between arguments), so the row can
      // highlight the focused argument. The expensive item recompute below is
      // still skipped when only the caret moved.
      setFocusedWordIndex(getFocusedWordIndex(value, caretPosition));

      if (value === lastValueRef.current) {
        return;
      }

      lastValueRef.current = value;

      const requestId = ++updateAutocompleteSuggestionsRequestIdRef.current;

      if (value == null) {
        itemsRef.current = [];
        setPartialInput('');
      } else {
        setPartialInput(value);
        itemsRef.current = (await computeItems(value)).slice(0, MAX_ITEMS_SHOWN);
      }

      if (requestId !== updateAutocompleteSuggestionsRequestIdRef.current) {
        return;
      }

      setItems(itemsRef.current);
      handleSelectedChange(0, true);

      itemsRef.current.length > 0 ? handleOpen() : handleClose();
    },
    [getChatInputPartialInput, getChatInputCaretPosition, computeItems, handleOpen, close, handleSelectedChange]
  );

  useEffect(() => {
    updateAutocompleteSuggestionsRef.current = updateAutocompleteSuggestions;
  }, [updateAutocompleteSuggestions]);

  const {refs, floatingStyles, context} = useFloating({
    strategy: 'fixed',
    open: opened,
    onOpenChange: (isOpen) => (isOpen ? handleOpen() : handleClose()),
    placement: 'top-start',
    middleware: [
      floatingOffset({mainAxis: offset}),
      size({
        apply({rects, elements}) {
          if (window.innerWidth < MAX_WIDTH && fullWidthOnSmallScreens) {
            elements.floating.style.width = `calc(100% - ${offset * 2}px)`;
          } else {
            const normalizedWidth = Math.min(rects.reference.width, MAX_WIDTH);
            elements.floating.style.width = `${normalizedWidth}px`;
          }
        },
      }),
      {
        name: 'forceLeft',
        fn: ({x, y}) => (window.innerWidth < MAX_WIDTH && fullWidthOnSmallScreens ? {x: offset, y} : {x, y}),
      },
    ],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const {getFloatingProps} = useInteractions([dismiss]);

  const handleComplete = useCallback(
    (item) => {
      const completeResult = (handleCompleteResult ?? onComplete)?.(item);

      // Completers may return {newValue, shouldClose}. When the completion still
      // leaves arguments to fill (shouldClose === false), recompute against the
      // new value so the menu stays open. A void return (legacy onComplete) or
      // shouldClose closes the menu, as before.
      if (completeResult?.shouldClose === false && completeResult.newValue != null) {
        updateAutocompleteSuggestionsRef.current(completeResult.newValue, completeResult.newValue.length);
        return;
      }

      lastValueRef.current = null;
      handleClose();
    },
    [handleCompleteResult, onComplete, handleClose]
  );

  const onHover = useCallback(
    (item) => {
      if (navigationModeRef.current !== NavigationModeTypes.MOUSE) {
        return;
      }

      const index = itemsRef.current.indexOf(item);
      if (index === -1) {
        return;
      }

      handleSelectedChange(index);
    },
    [handleSelectedChange]
  );

  useEffect(() => {
    if (chatInputElement == null) {
      return;
    }

    let pendingPromise = null;

    async function keyupCallback() {
      if (!pendingCompleteRef.current) {
        pendingPromise = await updateAutocompleteSuggestionsRef.current();
        return;
      }

      pendingCompleteRef.current = false;
      setPendingCompleteIndex(null);
      handleComplete(itemsRef.current[selectedRef.current]);
    }

    async function keydownCallback(event) {
      if (pendingPromise != null) {
        await Promise.allSettled([pendingPromise]);
      }

      if (!openedRef.current) {
        return;
      }

      navigationModeRef.current = NavigationModeTypes.ARROW_KEYS;

      switch (event.key) {
        case keyCodes.Enter:
        case keyCodes.Tab: {
          // Only capture Enter/Tab while the caret is within the command name
          // (which may be multiple words, e.g. "!commands add"). Past it the user
          // is typing an argument, so let Enter send and Tab add a space.
          const selectedItem = itemsRef.current[selectedRef.current];
          const completionLength = getCompletionLength?.(selectedItem);
          const caretPosition = getChatInputCaretPosition?.();
          const caretPastCommandName =
            completionLength != null && caretPosition != null && caretPosition > completionLength;

          if (caretPastCommandName && event.key === keyCodes.Enter) {
            handleClose();
            break;
          }

          if (caretPastCommandName && event.key === keyCodes.Tab) {
            stopEvent(event);
            onAppendSpace?.(selectedItem, caretPosition);
            break;
          }

          stopEvent(event);
          pendingCompleteRef.current = true;
          setPendingCompleteIndex(selectedRef.current);
          break;
        }
        case keyCodes.End:
          event.preventDefault();
          handleSelectedChange(itemsRef.current.length - 1);
          break;
        case keyCodes.Home:
          event.preventDefault();
          handleSelectedChange(0);
          break;
        case keyCodes.ArrowUp:
          stopEvent(event);
          handleSelectedChange(travelUp(selectedRef.current, itemsRef.current.length));
          break;
        case keyCodes.ArrowDown:
          stopEvent(event);
          handleSelectedChange(travelDown(selectedRef.current, itemsRef.current.length));
          break;
      }
    }

    refs.setPositionReference(chatInputElement);

    chatInputElement.addEventListener('keyup', keyupCallback, true);
    chatInputElement.addEventListener('keydown', keydownCallback, true);

    return () => {
      chatInputElement.removeEventListener('keydown', keydownCallback, true);
      chatInputElement.removeEventListener('keyup', keyupCallback, true);
    };
  }, [chatInputElement, refs]);

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className={classNames(styles.autocomplete, {[styles.autocompleteHidden]: !opened})}
      onMouseMove={handleMouseMove}
      {...getFloatingProps()}>
      <div className={styles.autocompleteHeader}>
        <LogoIcon className={styles.logoIcon} />
        <Text truncate>
          {formatMessage(
            {defaultMessage: 'Results for <bold>{query}</bold>'},
            {query: partialInput, bold: (chunks) => <b key="bold">{chunks}</b>}
          )}
        </Text>
        <Text className={styles.floatRight}>{formatMessage({defaultMessage: 'Close'})}</Text>
        <Kbd>Esc</Kbd>
      </div>
      <Scrollbar ref={itemsBodyRef} className={styles.autocompleteBody}>
        {items.map((item, index) => (
          <AutocompleteListRow
            key={getItemKey(item)}
            item={item}
            renderRow={renderRow}
            isSelected={selected === index}
            isActive={pendingCompleteIndex === index}
            focusedWordIndex={focusedWordIndex}
            handleCompleteResultItem={handleComplete}
            onHover={onHover}
          />
        ))}
      </Scrollbar>
      {showKeyboardNavigationTips ? (
        <div className={styles.autocompleteFooter}>
          <Kbd className={styles.kbd}>
            <Icon icon={faArrowUp} className={styles.kbdIcon} />
          </Kbd>
          <Kbd className={styles.kbd}>
            <Icon icon={faArrowDown} className={styles.kbdIcon} />
          </Kbd>
          <Text>{formatMessage({defaultMessage: 'Navigate'})}</Text>
          <Kbd className={classNames(styles.kbd, styles.floatRight)}>
            <Icon icon={faArrowTurnDown} className={classNames(styles.kbdIcon, styles.kbdIconTurn)} />
          </Kbd>
          <Text>{formatMessage({defaultMessage: 'Select'})}</Text>
        </div>
      ) : null}
    </div>
  );
}

export default Autocomplete;
