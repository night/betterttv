import React, {useCallback, useContext} from 'react';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {PageTypes, SettingIds} from '../../../constants.js';
import formatMessage from '../../../i18n/index.js';
import SettingEmoteAliases from '../components/SettingEmoteAliases.jsx';
import PageHeader from '../components/PageHeader.jsx';
import {PageContext} from '../contexts/PageContext.jsx';
import {Button, Title} from '@mantine/core';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import styles from './EmoteAliases.module.css';
import Icon from '../../../common/components/Icon.jsx';

function EmoteAliases({onClose}) {
  const {setPage} = useContext(PageContext);
  const [value, setValue] = useStorageState(SettingIds.EMOTE_ALIASES);

  const handleBackPage = useCallback(() => {
    setPage(PageTypes.SETTINGS);
  }, [setPage]);

  return (
    <React.Fragment>
      <PageHeader
        leftContent={
          <Button
            radius="lg"
            size="xl"
            leftSection={<Icon className={styles.arrowLeftIcon} icon={faArrowLeft} />}
            color="gray"
            variant="subtle"
            className={styles.backButton}
            onClick={handleBackPage}>
            <Title order={2}>{formatMessage({defaultMessage: 'Settings'})}</Title>
          </Button>
        }
        onClose={onClose}
      />
      <SettingEmoteAliases
        value={value}
        setValue={setValue}
        title={formatMessage({defaultMessage: 'Emote Aliases'})}
      />
    </React.Fragment>
  );
}

export default EmoteAliases;
