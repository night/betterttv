import {Kbd, Popover, TextInput} from '@mantine/core';
import classNames from 'classnames';
import {Search, SquareArrowOutUpRight} from 'lucide-react';
import React, {use, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import usePortalRef from '@/common/hooks/PortalRef';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {acceptSearchEntry, searchEntries} from '@/modules/settings/search-entries';
import SettingStore from '@/modules/settings/stores/setting-store';
import {isMac} from '@/utils/window';
import styles from './SettingsSearch.module.css';

const SIDEBAR_MIN_WIDTH = 800;
const MOD_KEY_LABEL = isMac() ? '⌘' : 'Ctrl';

// the return arrow, drawn at the letters' weight to match ⌘ and K
const RETURN_GLYPH = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M9.75 1.5v3.5a2 2 0 0 1-2 2H2.5M5 4.5 2.5 7 5 9.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const searchClassNames = {wrapper: styles.wrapper};
const searchHintClassNames = {wrapper: classNames(styles.wrapper, styles.wrapperHint)};

function getCategoryId({categoryId, settingPanelId}) {
  return categoryId ?? SettingStore.settings[settingPanelId]?.settingCategoryId ?? null;
}

// the matches as the list shows them: each category's row with its matches under it, and everything
// else on its own, ordered by the best match in each
function buildRows(results, categories) {
  const rows = [];
  const categoryRows = new Map();

  for (const result of results) {
    const categoryId = getCategoryId(result.entry);
    const category = categories.find(({id}) => id === categoryId);

    if (category == null) {
      rows.push([{...result, icon: result.entry.icon}]);
      continue;
    }

    let group = categoryRows.get(categoryId);
    if (group == null) {
      const {id, label, icon, onAccept} = category;
      group = [{entry: {id: `category-${id}`, query: label, onAccept}, icon, unmatched: true}];
      categoryRows.set(categoryId, group);
      rows.push(group);
    }

    if (result.entry.categoryId != null) {
      group[0] = {...result, icon: category.icon};
    } else {
      group.push({...result, icon: result.entry.icon, nested: true});
    }
  }

  return rows.flat();
}

function HighlightedText({text, ranges = []}) {
  const parts = [];
  let position = 0;

  for (const [start, end] of ranges) {
    parts.push(text.slice(position, start));
    parts.push(
      <mark key={start} className={styles.match}>
        {text.slice(start, end)}
      </mark>
    );
    position = end;
  }
  parts.push(text.slice(position));

  return parts;
}

function keepInputFocused(event) {
  event.preventDefault();
}

function scrollIntoView(element) {
  element?.scrollIntoView({block: 'nearest'});
}

const SearchRow = React.memo(function SearchRow({row, index, selected, onHover, onAccept}) {
  const {entry, icon: Icon, nested, queryRanges, descriptionRanges} = row;
  const handleHover = useCallback(() => onHover(index), [onHover, index]);
  const handleClick = useCallback(() => onAccept(entry), [onAccept, entry]);
  // a setting's description is noise until it's why the setting matched
  const showDescription = entry.description != null && (!nested || descriptionRanges?.length > 0);

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      ref={selected ? scrollIntoView : undefined}
      className={styles.row}
      data-selected={selected || undefined}
      onMouseDown={keepInputFocused}
      onMouseMove={handleHover}
      onClick={handleClick}>
      <span className={styles.rowIcon} data-empty={Icon == null || undefined}>
        {Icon != null ? <Icon size={18} /> : null}
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>
          <HighlightedText text={entry.query} ranges={queryRanges} />
        </span>
        {showDescription ? (
          <span className={styles.rowDescription}>
            <HighlightedText text={entry.description} ranges={descriptionRanges} />
          </span>
        ) : null}
      </span>
      {entry.href != null ? <SquareArrowOutUpRight size={14} className={styles.rowExternal} /> : null}
    </button>
  );
});

function SettingsSearch({onAccept}) {
  const {setPage, categories, handleGotoCategory, handleGotoSettingPanel} = use(PageContext);
  const portalRef = usePortalRef();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigation = useMemo(
    () => ({setPage, goToCategory: handleGotoCategory, goToSetting: handleGotoSettingPanel}),
    [setPage, handleGotoCategory, handleGotoSettingPanel]
  );
  const supportedPanelIds = useMemo(
    () => new Set(SettingStore.getSupportedSettings().map(({settingPanelId}) => settingPanelId)),
    []
  );

  const rows = useMemo(() => {
    function isAvailable({categoryId, settingPanelId}) {
      if (settingPanelId != null) {
        return supportedPanelIds.has(settingPanelId);
      }
      return categoryId == null || categories.some(({id}) => id === categoryId);
    }

    return buildRows(searchEntries(query, isAvailable), categories);
  }, [query, categories, supportedPanelIds]);

  // an unmatched category row only heads its matches, so Enter skips to the best of them
  const firstMatchIndex = Math.max(
    rows.findIndex(({unmatched}) => !unmatched),
    0
  );

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
    setSelectedIndex(-1);
  }, []);

  const handleChange = useCallback(({currentTarget}) => updateQuery(currentTarget.value), [updateQuery]);
  const activeIndex = selectedIndex === -1 ? firstMatchIndex : selectedIndex;

  const handleAccept = useCallback(
    (entry) => {
      updateQuery('');
      inputRef.current?.blur();
      acceptSearchEntry(entry, navigation);
      onAccept();
    },
    [updateQuery, navigation, onAccept]
  );

  function handleKeyDown(event) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    // while there's a search, Escape clears it rather than closing the settings around it
    if (event.key === 'Escape' && query !== '') {
      event.stopPropagation();
      updateQuery('');
      return;
    }

    if (rows.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setSelectedIndex((activeIndex + step + rows.length) % rows.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      handleAccept(rows[activeIndex].entry);
    }
  }

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  // the capture phase gets it ahead of twitch's own shortcuts, and of the modal stopping keys that
  // start inside it
  useEffect(() => {
    function handleShortcut(event) {
      if (event.key.toLowerCase() !== 'k' || !(isMac() ? event.metaKey : event.ctrlKey)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      inputRef.current?.focus();
      inputRef.current?.select();
    }

    window.addEventListener('keydown', handleShortcut, true);
    return () => window.removeEventListener('keydown', handleShortcut, true);
  }, []);

  const hasQuery = query.trim() !== '';
  const showShortcut = !focused && query === '';

  return (
    <Popover
      opened={focused && hasQuery}
      position="bottom-start"
      offset={8}
      radius="lg"
      shadow="lg"
      trapFocus={false}
      returnFocus={false}
      closeOnEscape={false}
      closeOnClickOutside={false}
      portalProps={{target: portalRef?.current}}>
      <Popover.Target>
        <div className={styles.root}>
          <TextInput
            ref={inputRef}
            // the modal's focus trap starts here; on a narrow screen the sidebar is closed
            data-autofocus={window.innerWidth >= SIDEBAR_MIN_WIDTH || undefined}
            size="lg"
            radius="lg"
            classNames={showShortcut ? searchHintClassNames : searchClassNames}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={formatMessage({defaultMessage: 'Search…'})}
            aria-label={formatMessage({defaultMessage: 'Search settings'})}
            leftSection={<Search size={18} />}
            rightSection={
              showShortcut ? (
                <span className={styles.hint} aria-hidden="true">
                  <Kbd className={styles.kbd}>{MOD_KEY_LABEL}</Kbd>
                  <Kbd className={styles.kbd}>K</Kbd>
                </span>
              ) : focused && rows.length > 0 ? (
                <Kbd className={classNames(styles.kbd, styles.kbdEnter)} aria-hidden="true">
                  {RETURN_GLYPH}
                </Kbd>
              ) : null
            }
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown className={styles.dropdown} role="listbox">
        {rows.map((row, index) => (
          <SearchRow
            key={row.entry.id}
            row={row}
            index={index}
            selected={index === activeIndex}
            onHover={setSelectedIndex}
            onAccept={handleAccept}
          />
        ))}
        {rows.length === 0 ? <div className={styles.empty}>{formatMessage({defaultMessage: 'No results'})}</div> : null}
      </Popover.Dropdown>
    </Popover>
  );
}

export default SettingsSearch;
