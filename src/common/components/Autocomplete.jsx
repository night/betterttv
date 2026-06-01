import React, {useEffect, useState, useCallback, useRef} from 'react';
import keyCodes from '../../utils/keycodes.js';
import styles from './Autocomplete.module.css';
import {useDisclosure} from '@mantine/hooks';
import {autoUpdate, offset as floatingOffset, size, useDismiss, useFloating} from '@floating-ui/react';
import {useInteractions} from '@floating-ui/react';
import classNames from 'classnames';
import useDomObserver from '../hooks/DomObserver.jsx';
import formatMessage from '../../i18n/index.js';
import Icon from './Icon.jsx';
import {faArrowDown, faArrowTurnDown, faArrowUp} from '@fortawesome/free-solid-svg-icons';
import {Kbd, Text} from '@mantine/core';
import Scrollbar from './Scrollbar.jsx';

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

const AutocompleteListRow = React.memo(function AutocompleteListRow({
  item,
  index,
  renderRow,
  isSelected,
  isActive,
  onCompleteItem,
  onHoverIndex,
}) {
  return renderRow({
    item,
    onClick: () => onCompleteItem(item),
    selected: isSelected,
    active: isActive,
    onMouseOver: () => onHoverIndex(index),
  });
});

function Autocomplete({
  chatInputQuerySelector,
  onComplete,
  getChatInputPartialInput,
  renderRow,
  computeItems,
  getItemKey,
  fullWidthOnSmallScreens = true,
  offset = 24,
  showKeyboardNavigationTips = true,
}) {
  const navigationMode = useRef(NavigationModeTypes.ARROW_KEYS);
  const [partialInput, setPartialInput] = useState('');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(0);
  const itemsRef = useRef(items);
  const selectedRef = useRef(selected);
  const [opened, {open, close}] = useDisclosure(false);
  const chatInputElement = useDomObserver(chatInputQuerySelector);
  const itemsBodyRef = useRef(null);
  const pendingComplete = useRef(null);
  const lastValueRef = useRef(null);
  const updateAutocompleteSuggestionsRef = useRef(null);
  const updateAutocompleteSuggestionsRequestId = useRef(0);
  const [pendingCompleteIndex, setPendingCompleteIndex] = useState(null);

  const handleMouseMove = useCallback(() => {
    navigationMode.current = NavigationModeTypes.MOUSE;
  }, []);

  const handleSelectedChange = useCallback((newSelected, forceScroll = false) => {
    setSelected(newSelected);

    selectedRef.current = newSelected;

    if (navigationMode.current === NavigationModeTypes.MOUSE && !forceScroll) {
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

  const handleOpen = useCallback(() => {
    open();
    navigationMode.current = NavigationModeTypes.ARROW_KEYS;
  }, [open]);

  const updateAutocompleteSuggestions = useCallback(async () => {
    const value = getChatInputPartialInput();

    if (value === lastValueRef.current) {
      return;
    }

    lastValueRef.current = value;

    const requestId = ++updateAutocompleteSuggestionsRequestId.current;

    if (value == null) {
      itemsRef.current = [];
      setPartialInput('');
    } else {
      setPartialInput(value);
      itemsRef.current = (await computeItems(value)).slice(0, MAX_ITEMS_SHOWN);
    }

    if (requestId !== updateAutocompleteSuggestionsRequestId.current) {
      return;
    }

    setItems(itemsRef.current);
    handleSelectedChange(0, true);

    itemsRef.current.length > 0 ? handleOpen() : close();
  }, [getChatInputPartialInput, computeItems, handleOpen, close, handleSelectedChange]);

  useEffect(() => {
    updateAutocompleteSuggestionsRef.current = updateAutocompleteSuggestions;
  }, [updateAutocompleteSuggestions]);

  const {refs, floatingStyles, context} = useFloating({
    strategy: 'fixed',
    open: opened,
    onOpenChange: (isOpen) => (isOpen ? open() : close()),
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
      onComplete(item);
      close();
    },
    [onComplete, close]
  );

  const onHoverIndex = useCallback(
    (index) => {
      if (navigationMode.current !== NavigationModeTypes.MOUSE) {
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
      if (!pendingComplete.current) {
        pendingPromise = await updateAutocompleteSuggestionsRef.current();
        return;
      }

      pendingComplete.current = false;
      setPendingCompleteIndex(null);
      handleComplete(itemsRef.current[selectedRef.current]);
    }

    async function keydownCallback(event) {
      if (pendingPromise != null) {
        await Promise.allSettled([pendingPromise]);
      }

      if (itemsRef.current.length === 0) {
        return;
      }

      navigationMode.current = NavigationModeTypes.ARROW_KEYS;

      switch (event.key) {
        case keyCodes.Enter:
        case keyCodes.Tab:
          event.preventDefault();
          event.stopPropagation();
          pendingComplete.current = true;
          setPendingCompleteIndex(selectedRef.current);
          break;
        case keyCodes.End:
          event.preventDefault();
          handleSelectedChange(itemsRef.current.length - 1);
          break;
        case keyCodes.Home:
          event.preventDefault();
          handleSelectedChange(0);
          break;
        case keyCodes.ArrowUp:
          event.preventDefault();
          event.stopPropagation();
          handleSelectedChange(travelUp(selectedRef.current, itemsRef.current.length));
          break;
        case keyCodes.ArrowDown:
          event.preventDefault();
          event.stopPropagation();
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
            index={index}
            renderRow={renderRow}
            isSelected={selected === index}
            isActive={pendingCompleteIndex === index}
            onCompleteItem={handleComplete}
            onHoverIndex={onHoverIndex}
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
