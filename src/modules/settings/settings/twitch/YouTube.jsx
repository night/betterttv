import React, {useEffect} from 'react';
import SettingGroup from '../../components/SettingGroup.jsx';
import formatMessage from '../../../../i18n/index.js';
import extension from '../../../../utils/extension.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'YouTube (beta)'});
const browser = window.chrome || window.browser;

function sendExtensionCommand(commandData, callback = undefined) {
  const extensionId = extension.getExtension()?.id;
  if (!extensionId) {
    return;
  }

  if (browser?.runtime?.sendMessage != null) {
    browser.runtime.sendMessage(extensionId, commandData, callback);
    return;
  }

  if (callback != null) {
    const handleMessageEvent = (event) => {
      if (event.origin !== window.origin) {
        return;
      }

      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.extensionId !== extensionId || parsedData.type !== 'BETTERTTV_EXTENSION_COMMAND_RESPONSE') {
          return;
        }

        window.removeEventListener('message', handleMessageEvent);

        callback(parsedData.data);
      } catch (_) {}
    };
    window.addEventListener('message', handleMessageEvent, false);
  }

  window.postMessage(
    JSON.stringify({
      extensionId,
      type: 'BETTERTTV_EXTENSION_COMMAND',
      data: commandData,
    }),
    window.origin
  );
}

function checkYouTubePermission() {
  return new Promise((resolve) => {
    sendExtensionCommand({type: 'CHECK_YOUTUBE_PERMISSION'}, (granted) => resolve(granted));
  });
}

function requestYouTubePermission() {
  sendExtensionCommand({type: 'REQUEST_YOUTUBE_PERMISSION'});
}

function YouTube(props, ref) {
  const [loading, setLoading] = React.useState(true);
  const [value, setValue] = React.useState(false);

  useEffect(() => {
    checkYouTubePermission()
      .then((granted) => {
        setValue(granted);
        setLoading(false);
      })
      .catch(() => {});
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
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={SETTING_NAME}
        description={formatMessage({defaultMessage: 'Show BetterTTV emotes on YouTube Live Chat.'})}
        value={value}
        onChange={() => requestPermission()}
        disabled={loading || value}
      />
    </SettingGroup>
  );
}

function maybeRegisterComponent() {
  if (extension.getExtension() == null) {
    return null;
  }

  const YouTubeForwardRef = React.forwardRef(YouTube);

  SettingStore.registerSetting(YouTubeForwardRef, {
    settingPanelId: SettingPanelIds.YOUTUBE,
    name: SETTING_NAME,
    supportsStandaloneWindow: true,
    keywords: ['youtube'],
  });

  return YouTubeForwardRef;
}

export default maybeRegisterComponent();
