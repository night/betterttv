import {Text, Button} from '@mantine/core';
import {useInView} from 'framer-motion';
import React, {use, useCallback, useEffect, useMemo, useRef} from 'react';
import useScrollSpy from '@/common/hooks/ScrollSpy';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody, {PageScrollContext} from '@/modules/settings/components/PageScrollBody';
import Panel from '@/modules/settings/components/Panel';
import {orderSettingsByCategory} from '@/modules/settings/setting-categories';
import promotionStore from '@/modules/settings/stores/promotion-store';
import SettingStore from '@/modules/settings/stores/setting-store';
import useSettingsNavigationStore from '@/modules/settings/stores/settings-navigation';
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

function Settings({handleSettingRefCallback}) {
  const settings = useMemo(() => orderSettingsByCategory(SettingStore.getSupportedSettings()), []);
  const scrollRef = use(PageScrollContext);
  const setActivePanelId = useSettingsNavigationStore((state) => state.setActivePanelId);

  // Tag each panel with its id so the scroll spy can discover it and report which one is in view.
  const handleSettingRef = useCallback(
    (settingPanelId, element) => {
      if (element != null) {
        element.dataset.settingPanelId = settingPanelId;
      }
      handleSettingRefCallback(settingPanelId, element);
    },
    [handleSettingRefCallback]
  );

  // The page header is a (non-sticky) sibling above the scroll area, so the scroll area's own top
  // already sits clear of it. The detection line only accounts for the panels' scroll-margin, so a
  // panel activates once its top reaches the same offset scroll-into-view leaves it at.
  const getScrollOffset = useCallback(() => {
    const scroller = scrollRef?.current;
    if (scroller == null) {
      return 0;
    }
    return parseFloat(getComputedStyle(scroller).getPropertyValue('--page-scroll-margin-top')) || 0;
  }, [scrollRef]);

  useScrollSpy({
    scrollHost: scrollRef,
    selector: '[data-setting-panel-id]',
    getValue: (element) => element.dataset.settingPanelId,
    getOffset: getScrollOffset,
    onActive: setActivePanelId,
  });

  return (
    <PageScrollBody header={<PageHeader leftContent={formatMessage({defaultMessage: 'Settings'})} />}>
      <SettingsList settings={settings} handleSettingRefCallback={handleSettingRef} />
    </PageScrollBody>
  );
}

export default Settings;
