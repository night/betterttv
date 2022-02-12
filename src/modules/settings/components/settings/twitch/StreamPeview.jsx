import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function StreamPreview() {
  const [value, setValue] = useStorageState(SettingIds.STREAM_PREVIEW);

  return (
    <Panel header="Stream Hover Preview">
      <div className={styles.toggle}>
        <p className={styles.description}>Display a thumbnail of the stream above inside the hover tooltip.</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(StreamPreview, {
  settingId: SettingIds.STREAM_PREVIEW,
  name: 'Stream Hover Preview',
  category: CategoryTypes.DIRECTORY,
  keywords: ['hover', 'preview', 'thumbnail', 'sidebar'],
});
