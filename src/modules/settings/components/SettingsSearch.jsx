import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {Combobox, Text, TextInput, useCombobox} from '@mantine/core';
import {useFocusTrap} from '@mantine/hooks';
import React, {use, useCallback, useEffect, useMemo, useState} from 'react';
import Icon from '@/common/components/Icon';
import usePortalRef from '@/common/hooks/PortalRef';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import searchStore from '@/modules/settings/stores/search-store';
import keyCodes from '@/utils/keycodes';
import styles from './SettingsSearch.module.css';

const MAX_RESULTS = 4;

function SettingsSearch({onNavigate}) {
  const {isInteractive} = use(PageContext);
  const focusRef = useFocusTrap(isInteractive);
  const portalRef = usePortalRef();
  const combobox = useCombobox();
  const [search, setSearch] = useState('');
  // True while Enter/Tab is held; the selected option darkens and submits on release,
  // matching the autocomplete's pending-complete behavior.
  const [pendingComplete, setPendingComplete] = useState(false);

  const query = search.trim();
  const results = useMemo(() => (query.length > 0 ? searchStore.search(query).slice(0, MAX_RESULTS) : []), [query]);

  // Keep the best match selected as the user types, so Enter/Tab picks it immediately.
  useEffect(() => {
    combobox.selectFirstOption();
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- combobox store is stable
  }, [search]);

  const handleOptionSubmit = useCallback(
    (value) => {
      const entry = results[Number(value)];
      if (entry == null) {
        return;
      }

      entry.goto();
      combobox.closeDropdown();
      setSearch('');
      onNavigate?.();
    },
    [results, combobox, onNavigate]
  );

  const handleChange = useCallback(
    (event) => {
      const {value} = event.currentTarget;
      setSearch(value);
      // Only show the dropdown once there's a query to match against.
      if (value.trim().length > 0) {
        combobox.openDropdown();
      } else {
        combobox.closeDropdown();
      }
    },
    [combobox]
  );

  const handleFocus = useCallback(() => {
    if (query.length > 0) {
      combobox.openDropdown();
    }
  }, [combobox, query]);

  const handleBlur = useCallback(() => {
    setPendingComplete(false);
    combobox.closeDropdown();
  }, [combobox]);

  // Keyboard navigation is handled here (withKeyboardNavigation is off) so Enter/Tab can mark the
  // selected option as pending on keydown and only submit on keyup, like the autocomplete.
  const handleKeyDown = useCallback(
    (event) => {
      if (!combobox.dropdownOpened || results.length === 0) {
        return;
      }

      switch (event.key) {
        case keyCodes.ArrowDown:
          event.preventDefault();
          combobox.selectNextOption();
          break;
        case keyCodes.ArrowUp:
          event.preventDefault();
          combobox.selectPreviousOption();
          break;
        case keyCodes.Escape:
          combobox.closeDropdown();
          break;
        case keyCodes.Enter:
        case keyCodes.Tab:
          event.preventDefault();
          setPendingComplete(true);
          break;
        default:
          break;
      }
    },
    [combobox, results.length]
  );

  const handleKeyUp = useCallback(
    (event) => {
      if ((event.key !== keyCodes.Enter && event.key !== keyCodes.Tab) || !pendingComplete) {
        return;
      }

      setPendingComplete(false);
      combobox.clickSelectedOption();
    },
    [combobox, pendingComplete]
  );

  // Selection follows the mouse, like the autocomplete's hover behavior.
  const handleOptionMouseOver = useCallback(
    (event) => {
      combobox.selectOption(Number(event.currentTarget.dataset.index));
    },
    [combobox]
  );

  return (
    <Combobox
      store={combobox}
      withinPortal
      portalProps={{target: portalRef.current}}
      position="bottom-start"
      offset={4}
      width={400}
      radius="lg"
      shadow="md"
      onOptionSubmit={handleOptionSubmit}>
      <Combobox.Target withKeyboardNavigation={false}>
        <TextInput
          ref={focusRef}
          size="lg"
          radius="lg"
          value={search}
          placeholder={formatMessage({defaultMessage: 'Search'})}
          leftSection={<Icon icon={faMagnifyingGlass} className={styles.searchIcon} />}
          className={styles.searchInputRoot}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
      </Combobox.Target>
      <Combobox.Dropdown hidden={results.length === 0} className={styles.dropdown}>
        <Combobox.Options data-pending-complete={pendingComplete || undefined}>
          {results.map((entry, index) => (
            <Combobox.Option
              value={String(index)}
              key={`${entry.name}-${entry.description}`}
              className={styles.option}
              data-index={index}
              onMouseOver={handleOptionMouseOver}>
              <Text size="md" className={styles.optionName}>
                {entry.name}
              </Text>
              {entry.description != null ? (
                <Text size="md" c="dimmed" truncate className={styles.optionDescription}>
                  {entry.description}
                </Text>
              ) : null}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default SettingsSearch;
