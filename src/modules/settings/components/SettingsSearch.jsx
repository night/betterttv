import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {Combobox, Text, TextInput, useCombobox} from '@mantine/core';
import React, {use, useCallback, useEffect, useMemo, useState} from 'react';
import Icon from '@/common/components/Icon';
import usePortalRef from '@/common/hooks/PortalRef';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import searchStore from '@/modules/settings/stores/search-store';
import keyCodes from '@/utils/keycodes';
import styles from './SettingsSearch.module.css';

const MAX_RESULTS = 6;

function SettingsSearch({onNavigate}) {
  const {handleGotoSettingPanel} = use(PageContext);
  const portalRef = usePortalRef();
  const combobox = useCombobox();
  const [search, setSearch] = useState('');
  const [pendingComplete, setPendingComplete] = useState(false);
  const query = search.trim();
  const results = useMemo(() => searchStore.search(query).slice(0, MAX_RESULTS), [query]);

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

      handleGotoSettingPanel(entry.settingPanelId);
      combobox.closeDropdown();
      setSearch('');
      onNavigate?.();
    },
    [results, handleGotoSettingPanel, combobox, onNavigate]
  );

  const handleChange = useCallback(
    (event) => {
      const {value} = event.currentTarget;
      setSearch(value);
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
          size="lg"
          radius="lg"
          value={search}
          placeholder={formatMessage({defaultMessage: 'Search settings...'})}
          aria-label={formatMessage({defaultMessage: 'Search settings'})}
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
              key={`${entry.settingPanelId}-${entry.name}-${entry.description}`}
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
