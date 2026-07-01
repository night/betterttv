import {Text, Button} from '@mantine/core';
import React, {use, useCallback, useEffect, useMemo} from 'react';
import useScrollSpy from '@/common/hooks/ScrollSpy';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody, {PageScrollContext} from '@/modules/settings/components/PageScrollBody';
import Panel from '@/modules/settings/components/Panel';
import Promotion from '@/modules/settings/components/Promotion';
import {orderSettingsByCategory} from '@/modules/settings/setting-categories';
import useSettingsNavigationStore from '@/modules/settings/stores/settings-navigation';
import SettingStore from '@/modules/settings/stores/SettingStore';
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

// Memoized so a scroll-spy active-panel change (which re-renders Settings) doesn't re-render every
// panel and re-thrash all their ref callbacks — props are stable, so this skips the work on scroll.
const SettingsList = React.memo(function SettingsList({settings, handleSettingRefCallback}) {
  if (IS_UNSUPPORTED_CHROME_INSTALL) {
    return <UnsupportedChromiumVersion />;
  }

  return settings.map((setting) =>
    setting.render({ref: (ref) => handleSettingRefCallback(setting.settingPanelId, ref)})
  );
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

  // The sticky page header overlaps the top of the scroll area, so the detection line sits below it
  // (header height plus the panels' scroll-margin).
  const getScrollOffset = useCallback(() => {
    const scroller = scrollRef?.current;
    if (scroller == null) {
      return 0;
    }
    const header = scroller.parentElement?.querySelector('[data-page-header]');
    const scrollMargin = parseFloat(getComputedStyle(scroller).getPropertyValue('--page-scroll-margin-top')) || 0;
    return (header?.offsetHeight ?? 0) + scrollMargin;
  }, [scrollRef]);

  const {active, data} = useScrollSpy({
    scrollHost: scrollRef,
    selector: '[data-setting-panel-id]',
    getValue: (element) => element.dataset.settingPanelId,
    offset: getScrollOffset,
  });

  useEffect(() => {
    setActivePanelId(data[active]?.value ?? null);
  }, [active, data, setActivePanelId]);

  return (
    <PageScrollBody header={<PageHeader leftContent={formatMessage({defaultMessage: 'Settings'})} />}>
      <Promotion />
      <SettingsList settings={settings} handleSettingRefCallback={handleSettingRef} />
    </PageScrollBody>
  );
}

export default Settings;
