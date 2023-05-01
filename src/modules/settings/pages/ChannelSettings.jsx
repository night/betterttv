import React, {useState} from 'react';
import PanelGroup from 'rsuite/PanelGroup';
import classNames from 'classnames';
import {Settings, Search} from '../components/Settings.jsx';
import {CategoryTypes} from '../../../constants.js';
import styles from '../styles/header.module.css';
import CloseButton from '../components/CloseButton.jsx';
import formatMessage from '../../../i18n/index.js';

function ChannelSettings({onClose, defaultSearchInput}) {
  const [search, setSearch] = useState(defaultSearchInput ?? '');

  return (
    <>
      <PanelGroup className={classNames(styles.divider, styles.content)}>
        <Settings search={search} category={CategoryTypes.CHANNEL} />
      </PanelGroup>
      <div className={styles.header}>
        <div className={styles.flexHeader}>
          <Search
            value={search}
            placeholder={formatMessage({defaultMessage: 'Search Channel Settings...'})}
            onChange={(newValue) => setSearch(newValue)}
          />
          <CloseButton onClose={onClose} />
        </div>
      </div>
    </>
  );
}

export default ChannelSettings;
