import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import throttle from 'lodash.throttle';
import formatMessage from '../../../i18n/index.js';
import extension from '../../../utils/extension.js';
import {Text, Button} from '@mantine/core';
import SettingStore from '../stores/SettingStore.jsx';
import styles from './Settings.module.css';
import Panel from '../components/Panel.jsx';
import Promotion from '../components/Promotion.jsx';
import PageScrollBody, {PageScrollContext} from '../components/PageScrollBody.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useSettingsNavigationStore from '../stores/settings-navigation.js';

const SCROLL_SPY_THROTTLE_MS = 100;

const CHROME_VERSION = navigator.userAgentData?.brands?.find(({brand}) => brand === 'Chromium')?.version;
const IS_UNSUPPORTED_CHROME_INSTALL =
  CHROME_VERSION != null ? parseInt(CHROME_VERSION, 10) < 111 && extension.getExtension() != null : false;
const UNSUPPORTED_LEARN_MORE_URL = 'https://github.com/night/betterttv/issues/6860';

if (IS_UNSUPPORTED_CHROME_INSTALL) {
  // eslint-disable-next-line no-console
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

function SettingsList({settings, handleSettingRefCallback}) {
  if (IS_UNSUPPORTED_CHROME_INSTALL) {
    return <UnsupportedChromiumVersion />;
  }

  return settings.map((setting) =>
    setting.render({ref: (ref) => handleSettingRefCallback(setting.settingPanelId, ref)})
  );
}

function Settings({handleSettingRefCallback}) {
  const settings = useMemo(() => SettingStore.getSupportedSettings().sort((a, b) => a.name.localeCompare(b.name)), []);
  const scrollRef = useContext(PageScrollContext);
  const settingElements = useRef({});
  const setActivePanelId = useSettingsNavigationStore((state) => state.setActivePanelId);

  const handleSettingRef = useCallback(
    (settingPanelId, element) => {
      if (element == null) {
        delete settingElements.current[settingPanelId];
      } else {
        settingElements.current[settingPanelId] = element;
      }
      handleSettingRefCallback(settingPanelId, element);
    },
    [handleSettingRefCallback]
  );

  // Highlight the side-nav entry for whichever setting is at the top of the scroll viewport.
  // Panels' offsetTop is relative to the page container (which includes the fixed header), so the
  // detection line is offset by the header height plus the panels' scroll-margin.
  const updateActivePanel = useCallback(() => {
    const scroller = scrollRef?.current;
    if (scroller == null) {
      return;
    }

    const header = scroller.parentElement?.querySelector('[data-page-header]');
    const scrollMargin = parseFloat(getComputedStyle(scroller).getPropertyValue('--page-scroll-margin-top')) || 0;
    const line = scroller.scrollTop + (header?.offsetHeight ?? 0) + scrollMargin;

    let activeId = null;
    let activeTop = -Infinity;
    let firstId = null;
    let firstTop = Infinity;
    for (const [id, element] of Object.entries(settingElements.current)) {
      if (element == null) {
        continue;
      }
      const {offsetTop} = element;
      if (offsetTop < firstTop) {
        firstTop = offsetTop;
        firstId = id;
      }
      if (offsetTop <= line && offsetTop > activeTop) {
        activeTop = offsetTop;
        activeId = id;
      }
    }

    setActivePanelId(activeId ?? firstId);
  }, [scrollRef, setActivePanelId]);

  // Throttle so scrolling doesn't read layout on every event (the project uses lodash throttling).
  const handleScroll = useMemo(() => throttle(updateActivePanel, SCROLL_SPY_THROTTLE_MS), [updateActivePanel]);

  // Set the initial highlight on mount; clear it and cancel pending work when leaving the page.
  useEffect(() => {
    updateActivePanel();
    return () => {
      handleScroll.cancel();
      setActivePanelId(null);
    };
  }, [updateActivePanel, handleScroll, setActivePanelId]);

  return (
    <PageScrollBody
      header={<PageHeader leftContent={formatMessage({defaultMessage: 'Settings'})} />}
      onScroll={handleScroll}>
      <Promotion />
      <SettingsList settings={settings} handleSettingRefCallback={handleSettingRef} />
    </PageScrollBody>
  );
}

export default Settings;
