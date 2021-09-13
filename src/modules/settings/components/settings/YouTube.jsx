import React, {useEffect} from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent} from '../Store.jsx';
import {CategoryTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import extension from '../../../../utils/extension';

const EXTENSION_URL = new URL(extension.url(''));
const HAS_LOCAL_EXTENSION_DATA = EXTENSION_URL.protocol.includes('extension');
const EXTENSION_ID = EXTENSION_URL.host;

function checkYouTubePermission() {
  return new Promise((resolve) => {
    window.chrome.runtime.sendMessage(EXTENSION_ID, {type: 'CHECK_YOUTUBE_PERMISSION'}, (granted) => resolve(granted));
  });
}

function requestYouTubePermission() {
  window.chrome.runtime.sendMessage(EXTENSION_ID, {type: 'REQUEST_YOUTUBE_PERMISSION'});
}

function YouTube() {
  const [loading, setLoading] = React.useState(true);
  const [value, setValue] = React.useState(false);

  useEffect(async () => {
    try {
      const granted = await checkYouTubePermission();
      setValue(granted);
      setLoading(false);
    } catch (_) {}
  }, []);

  function requestPermission() {
    setLoading(true);
    requestYouTubePermission();

    let timeout;
    const interval = setInterval(async () => {
      const granted = await checkYouTubePermission();
      if (!granted) {
        return;
      }
      clearInterval(interval);
      clearTimeout(timeout);
      setValue(granted);
      setLoading(false);
    }, 500);
    timeout = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
    }, 30000);
  }

  return (
    <Panel header="YouTube (beta)">
      <div className={styles.toggle}>
        <p className={styles.description}>Shows BetterTTV emotes on YouTube Live Chat</p>
        <Toggle disabled={loading || value} checked={value} onChange={() => requestPermission()} />
      </div>
    </Panel>
  );
}

function maybeRegisterComponent() {
  if (!HAS_LOCAL_EXTENSION_DATA) {
    return null;
  }

  return registerComponent(YouTube, {
    settingId: 'youtube',
    name: 'YouTube (beta)',
    category: CategoryTypes.CHAT,
    keywords: ['youtube'],
  });
}

export default maybeRegisterComponent();
