import {Kbd, Popover, TextInput} from '@mantine/core';
import {useWindowEvent} from '@mantine/hooks';
import classNames from 'classnames';
import {Search, SquareArrowOutUpRight} from 'lucide-react';
import React, {use, useCallback, useId, useMemo, useRef, useState} from 'react';
import LogoIcon from '@/common/components/LogoIcon';
import usePortalRef from '@/common/hooks/PortalRef';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {acceptSearchEntry, searchEntries} from '@/modules/settings/search-entries';
import SettingStore from '@/modules/settings/stores/setting-store';
import {isMac} from '@/utils/window';
import styles from './SettingsSearch.module.css';

const SIDEBAR_MIN_WIDTH = 800;
const SHORTCUT_LABEL = isMac() ? '⌘K' : 'Ctrl K';

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

const MAX_CATEGORY_MATCHES = 3;
const NO_CATEGORY_IDS = new Set();

const searchClassNames = {wrapper: styles.wrapper};
const searchHintClassNames = {wrapper: classNames(styles.wrapper, styles.wrapperHint)};

// the matches as the list shows them: each category's row with its matches under it, and everything
// else on its own, ordered by the best match in each. A long category collapses into a row that
// expands it
function buildRows(results, categories, expandedCategoryIds) {
  const rows = [];
  const categoryRows = new Map();

  for (const result of results) {
    const categoryId = result.entry.categoryId ?? SettingStore.settings[result.entry.settingPanelId]?.settingCategoryId;
    const category = categories.find(({id}) => id === categoryId);

    if (category == null) {
      rows.push([{...result, icon: result.entry.icon}]);
      continue;
    }

    let group = categoryRows.get(categoryId);
    if (group == null) {
      const {id, label, icon} = category;
      group = [{entry: {id: `category-${id}`, query: label, categoryId: id}, icon, unmatched: true}];
      categoryRows.set(categoryId, group);
      rows.push(group);
    }

    if (result.entry.categoryId != null) {
      group[0] = {...result, icon: category.icon};
    } else {
      group.push({...result, icon: result.entry.icon, nested: true});
    }
  }

  for (const [categoryId, group] of categoryRows) {
    const hiddenCount = group.length - 1 - MAX_CATEGORY_MATCHES;
    // "+1 more" would take the same space as the row it hides
    if (hiddenCount > 1 && !expandedCategoryIds.has(categoryId)) {
      group.splice(MAX_CATEGORY_MATCHES + 1, hiddenCount, {
        entry: {
          id: `more-${categoryId}`,
          query: formatMessage({defaultMessage: '+{count} more'}, {count: hiddenCount}),
          expandCategoryId: categoryId,
        },
        more: true,
        nested: true,
        unmatched: true,
      });
    }
  }

  return rows.flat();
}

function HighlightedText({text, term}) {
  const start = term != null ? text.toLowerCase().indexOf(term) : -1;
  if (start === -1) {
    return text;
  }

  const end = start + term.length;
  return (
    <React.Fragment>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </React.Fragment>
  );
}

function keepInputFocused(event) {
  event.preventDefault();
}

function scrollIntoView(element) {
  element?.scrollIntoView({block: 'nearest'});
}

const SearchRow = React.memo(function SearchRow({id, row, index, selected, pressed, onHover, onAccept}) {
  const {entry, icon: Icon, more, nested, titleTerm, descriptionTerm, descriptionMatches} = row;
  const handleHover = useCallback(() => onHover(index), [onHover, index]);
  const handleClick = useCallback(() => onAccept(entry), [onAccept, entry]);
  // a setting's description is noise until it's why the setting matched
  const showDescription = entry.description != null && (!nested || descriptionMatches);

  return (
    <button
      type="button"
      id={id}
      role="option"
      aria-selected={selected}
      ref={selected ? scrollIntoView : undefined}
      className={classNames(styles.row, {[styles.rowMore]: more})}
      data-selected={selected || undefined}
      data-pressed={pressed || undefined}
      onMouseMove={handleHover}
      onClick={handleClick}>
      <span className={styles.rowIcon}>{Icon != null ? <Icon size={18} /> : null}</span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>
          <HighlightedText text={entry.query} term={titleTerm} />
        </span>
        {showDescription ? (
          <span className={styles.rowDescription}>
            <HighlightedText text={entry.description} term={descriptionTerm} />
          </span>
        ) : null}
      </span>
      {entry.href != null ? <SquareArrowOutUpRight size={14} className={styles.rowExternal} /> : null}
    </button>
  );
});

// The sidebar header's search. Until it's used it's a ghost field, with the logo in place of the search icon.
function SettingsSearch({onAccept}) {
  const {setPage, setSidenavOpen, categories, handleGotoCategory} = use(PageContext);
  const portalRef = usePortalRef();
  const listId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [enterHeld, setEnterHeld] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState(NO_CATEGORY_IDS);

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

    return buildRows(searchEntries(query, isAvailable), categories, expandedCategoryIds);
  }, [query, categories, supportedPanelIds, expandedCategoryIds]);

  // an unmatched category row only heads its matches, so Enter skips to the best of them
  const firstMatchIndex = Math.max(
    rows.findIndex(({unmatched}) => !unmatched),
    0
  );

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
    setSelectedIndex(-1);
    setEnterHeld(false);
    setExpandedCategoryIds(NO_CATEGORY_IDS);
  }, []);

  const handleChange = useCallback(({currentTarget}) => updateQuery(currentTarget.value), [updateQuery]);
  const activeIndex = selectedIndex === -1 ? firstMatchIndex : selectedIndex;

  const handleAccept = useCallback(
    (entry) => {
      if (entry.expandCategoryId != null) {
        setExpandedCategoryIds((categoryIds) => new Set(categoryIds).add(entry.expandCategoryId));
        return;
      }

      updateQuery('');
      inputRef.current?.blur();
      acceptSearchEntry(entry, {
        setPage,
        goToCategory: handleGotoCategory,
        goToSetting: (settingPanelId) =>
          handleGotoCategory(SettingStore.settings[settingPanelId]?.settingCategoryId ?? null),
      });
      onAccept();
    },
    [updateQuery, setPage, handleGotoCategory, onAccept]
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
      setEnterHeld(true);
    }
  }

  // like a click, Enter acts on release, so the row can show it's held
  function handleKeyUp(event) {
    if (event.key !== 'Enter' || !enterHeld) {
      return;
    }

    setEnterHeld(false);
    handleAccept(rows[activeIndex].entry);
  }

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => {
    setFocused(false);
    setEnterHeld(false);
  }, []);

  // the capture phase gets it ahead of twitch's own shortcuts, and of the shadow root stopping keys
  // that start inside it
  const handleShortcut = useCallback(
    (event) => {
      if (event.key.toLowerCase() !== 'k' || !(isMac() ? event.metaKey : event.ctrlKey)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      // the input is in the sidebar, which a narrow window keeps closed
      setSidenavOpen(true);
      inputRef.current?.focus();
      inputRef.current?.select();
    },
    [setSidenavOpen]
  );
  useWindowEvent('keydown', handleShortcut, true);

  const opened = focused && query.trim() !== '';
  const ghosted = !focused && query === '';
  const showEnter = focused && rows.length > 0;

  return (
    <div className={styles.root} data-ghost={ghosted || undefined}>
      {opened ? <div className={styles.dim} /> : null}
      <div className={styles.field}>
        <Popover
          id={listId}
          opened={opened}
          position="bottom-start"
          width="32rem"
          radius="lg"
          shadow="lg"
          portalProps={{target: portalRef?.current}}>
          <Popover.Target popupType="listbox">
            <TextInput
              ref={inputRef}
              // the modal's focus trap starts here; on a narrow screen the sidebar is closed
              data-autofocus={window.innerWidth >= SIDEBAR_MIN_WIDTH || undefined}
              size="lg"
              radius="lg"
              classNames={ghosted || showEnter ? searchHintClassNames : searchClassNames}
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={formatMessage({defaultMessage: 'Search…'})}
              aria-label={formatMessage({defaultMessage: 'Search settings'})}
              role="combobox"
              aria-autocomplete="list"
              aria-activedescendant={opened && rows.length > 0 ? `${listId}-${activeIndex}` : undefined}
              leftSection={
                ghosted ? (
                  <span className={styles.ghostLogo}>
                    <LogoIcon width={20} height={20} />
                  </span>
                ) : (
                  <Search size={18} />
                )
              }
              rightSection={
                ghosted ? (
                  <Kbd className={styles.kbd} aria-hidden="true">
                    {SHORTCUT_LABEL}
                  </Kbd>
                ) : showEnter ? (
                  <Kbd
                    className={classNames(styles.kbd, styles.kbdEnter)}
                    data-pressed={enterHeld || undefined}
                    aria-hidden="true">
                    {RETURN_GLYPH}
                  </Kbd>
                ) : null
              }
            />
          </Popover.Target>
          {/* unmounted rather than faded, or an emptied search shows No results on its way out */}
          {opened ? (
            <Popover.Dropdown className={styles.dropdown} role="listbox" onMouseDown={keepInputFocused}>
              {rows.map((row, index) => (
                <SearchRow
                  key={row.entry.id}
                  id={`${listId}-${index}`}
                  row={row}
                  index={index}
                  selected={index === activeIndex}
                  pressed={enterHeld && index === activeIndex}
                  onHover={setSelectedIndex}
                  onAccept={handleAccept}
                />
              ))}
              {rows.length === 0 ? (
                <div className={styles.empty}>{formatMessage({defaultMessage: 'No results'})}</div>
              ) : null}
            </Popover.Dropdown>
          ) : null}
        </Popover>
      </div>
    </div>
  );
}

export default SettingsSearch;
