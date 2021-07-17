import React, {useState} from 'react';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import classNames from 'classnames';
import {Settings, Search} from '../components/Settings.jsx';
import {CategoryTypes} from '../../../constants.js';
import styles from '../styles/header.module.css';
import CloseButton from '../components/CloseButton.jsx';

function ChannelSettings({onHide}) {
  const [search, setSearch] = useState('');

  return (
    <>
      <PanelGroup className={classNames(styles.divider, styles.content)}>
        <Settings search={search} category={CategoryTypes.CHANNEL} />
      </PanelGroup>
      <div className={styles.header}>
        <div className={styles.flexHeader}>
          <Search
            value={search}
            placeholder="Search Channel Settings..."
            onChange={(newValue) => setSearch(newValue)}
          />
          <CloseButton onHide={onHide} />
        </div>
      </div>
    </>
  );
}

export default ChannelSettings;
