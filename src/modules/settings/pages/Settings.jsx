import {Text, Button} from '@mantine/core';
import {useInView} from 'framer-motion';
import React, {useCallback, useEffect, useRef} from 'react';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import Panel from '@/modules/settings/components/Panel';
import promotionStore from '@/modules/settings/stores/promotion-store';
import extension from '@/utils/extension';
import styles from './Settings.module.css';

const CHROME_VERSION = navigator.userAgentData?.brands?.find(({brand}) => brand === 'Chromium')?.version;
const IS_UNSUPPORTED_CHROME_INSTALL =
  CHROME_VERSION != null ? parseInt(CHROME_VERSION, 10) < 111 && extension.getExtension() != null : false;
const UNSUPPORTED_LEARN_MORE_URL = 'https://github.com/night/betterttv/issues/6860';

if (IS_UNSUPPORTED_CHROME_INSTALL) {
  console.error(
    `BTTV: Unsupported Chromium version (v${CHROME_VERSION}). Your browser's Chromium version is not supported. Please upgrade to a version of Chromium that is 111 or higher. Learn more at ${UNSUPPORTED_LEARN_MORE_URL}`
  );
}

function UnsupportedChromiumVersion() {
  return (
    <Panel title={formatMessage({defaultMessage: 'Unsupported Chromium Version'})}>
      <Text className={styles.unsupportedChromiumVersionText}>
        {formatMessage(
          {defaultMessage: "Your browser's Chromium version (v{CHROME_VERSION}) is not supported. "},
          {CHROME_VERSION}
        )}
      </Text>
      <Text c="dimmed" className={styles.unsupportedChromiumVersionText}>
        {formatMessage({defaultMessage: 'Please upgrade to a version of Chromium that is 111 or higher.'})}
      </Text>
      <Button href={UNSUPPORTED_LEARN_MORE_URL} appearance="primary" className={styles.unsupportedPanelButton}>
        {formatMessage({defaultMessage: 'Learn more'})}
      </Button>
    </Panel>
  );
}

// Renders one setting panel and clears its promotion dot once it scrolls into view, so a promoted
// setting is only advertised until the user has actually seen it. markSettingPanelPromotionSeen
// no-ops for panels without a promotion, so this is safe to run for every setting.
function SettingPanel({setting, onRef}) {
  const panelRef = useRef(null);
  const inView = useInView(panelRef, {once: true, amount: 0.5});

  useEffect(() => {
    if (inView) {
      promotionStore.markSettingPanelPromotionSeen(setting.settingPanelId);
    }
  }, [inView, setting.settingPanelId]);

  const handleRef = useCallback(
    (element) => {
      panelRef.current = element;
      onRef(setting.settingPanelId, element);
    },
    [onRef, setting.settingPanelId]
  );

  return setting.render({ref: handleRef});
}

// Memoized so a modal-level re-render (e.g. the mobile sidenav toggling) doesn't re-render every
// panel and re-thrash all their ref callbacks — props are stable, so this skips the work.
const SettingsList = React.memo(function SettingsList({settings, handleSettingRefCallback}) {
  if (IS_UNSUPPORTED_CHROME_INSTALL) {
    return <UnsupportedChromiumVersion />;
  }

  return settings.map((setting) => (
    <SettingPanel key={setting.settingPanelId} setting={setting} onRef={handleSettingRefCallback} />
  ));
});

function Settings({category, handleSettingRefCallback}) {
  return (
    <PageScrollBody header={<PageHeader leftContent={category.label} />}>
      <SettingsList settings={category.settings} handleSettingRefCallback={handleSettingRefCallback} />
    </PageScrollBody>
  );
}

export default Settings;
