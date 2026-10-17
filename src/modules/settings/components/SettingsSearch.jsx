import {faMagnifyingGlass, faXmark} from '@fortawesome/free-solid-svg-icons';
import {ActionIcon, TextInput} from '@mantine/core';
import React, {use, useCallback, useEffect} from 'react';
import Icon from '@/common/components/Icon';
import {PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import useSettingsSearchStore from '@/modules/settings/stores/settings-search';
import styles from './SettingsSearch.module.css';

function SettingsSearch() {
  const {page, setPage} = use(PageContext);
  const query = useSettingsSearchStore((state) => state.query);
  const setQuery = useSettingsSearchStore((state) => state.setQuery);

  useEffect(() => () => setQuery(''), [setQuery]);

  const handleChange = useCallback(
    (event) => {
      setQuery(event.currentTarget.value);
      if (page !== PageTypes.SETTINGS) {
        setPage(PageTypes.SETTINGS);
      }
    },
    [page, setPage, setQuery]
  );

  const clear = useCallback(() => setQuery(''), [setQuery]);

  return (
    <TextInput
      size="lg"
      radius="lg"
      value={query}
      placeholder={formatMessage({defaultMessage: 'Search settings...'})}
      aria-label={formatMessage({defaultMessage: 'Search settings'})}
      leftSection={<Icon icon={faMagnifyingGlass} className={styles.icon} />}
      rightSection={
        query.length > 0 ? (
          <ActionIcon
            variant="transparent"
            size="sm"
            onClick={clear}
            aria-label={formatMessage({defaultMessage: 'Clear search'})}>
            <Icon icon={faXmark} className={styles.icon} />
          </ActionIcon>
        ) : null
      }
      className={styles.root}
      onChange={handleChange}
    />
  );
}

export default SettingsSearch;
