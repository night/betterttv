import {Button} from '@mantine/core';
import React, {useCallback, use} from 'react';
import {useShallow} from 'zustand/react/shallow';
import useIsOnOwnChannel from '@/common/hooks/IsOnOwnChannel';
import useStorageState from '@/common/hooks/StorageState';
import {openSignInModal, openConfirmModal} from '@/common/utils/modal';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import useAuthStore from '@/stores/auth';

const SETTING_NAME = formatMessage({defaultMessage: 'Self Bot'});
const SETTING_DESCRIPTION = formatMessage({
  defaultMessage: 'Automatically send and reply to messages on your own channel.',
});

const COMMANDS_NAME = formatMessage({defaultMessage: 'Commands'});
const COMMANDS_DESCRIPTION = formatMessage({defaultMessage: 'Configure command triggers and responses.'});
const TIMERS_NAME = formatMessage({defaultMessage: 'Timers'});
const TIMERS_DESCRIPTION = formatMessage({defaultMessage: 'Automatically send messages at specific times.'});

function openEnableSelfBotModal(setEnabled) {
  openConfirmModal({
    title: formatMessage({defaultMessage: 'Enable Self Bot'}),
    description: formatMessage({
      defaultMessage: 'This setting is only available on your own channel, are you sure you want to enable it?',
    }),
    onConfirm: () => setEnabled(true),
    labels: {
      confirm: formatMessage({defaultMessage: 'Enable'}),
      cancel: formatMessage({defaultMessage: 'Cancel'}),
    },
    confirmProps: {color: 'red', size: 'lg', variant: 'elevated'},
  });
}

function SelfBot({ref, ...props}) {
  const {setPage} = use(PageContext);
  const isOnOwnChannel = useIsOnOwnChannel();
  const [enabled, setEnabled] = useStorageState(SettingIds.SELF_BOT);
  const bttvUser = useAuthStore(useShallow((state) => state.user));
  const displayEnabled = bttvUser != null && enabled;

  const handleEnabledChange = useCallback(
    (newEnabled) => {
      const {user} = useAuthStore.getState();

      if (newEnabled && user == null) {
        openSignInModal({}, () => handleEnabledChange(true));
        return;
      }

      if (!enabled && newEnabled && !isOnOwnChannel) {
        openEnableSelfBotModal(setEnabled);
        return;
      }

      setEnabled(newEnabled);
    },
    [isOnOwnChannel, setEnabled, enabled]
  );

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={SETTING_NAME}
        description={SETTING_DESCRIPTION}
        showBetaBadge
        value={displayEnabled}
        onChange={handleEnabledChange}
      />
      <SettingWrapper name={COMMANDS_NAME} reverse description={COMMANDS_DESCRIPTION}>
        <Button size="lg" onClick={() => setPage(PageTypes.SELF_BOT_COMMANDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingWrapper name={TIMERS_NAME} reverse showComingSoonBadge description={TIMERS_DESCRIPTION}>
        <Button disabled size="lg">
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
    </SettingGroup>
  );
}

SettingStore.registerSetting(SelfBot, {
  settingPanelId: SettingPanelIds.SELF_BOT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: SETTING_NAME, description: SETTING_DESCRIPTION},
  {name: COMMANDS_NAME, description: COMMANDS_DESCRIPTION},
  {name: TIMERS_NAME, description: TIMERS_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.SELF_BOT)});
}

export default SelfBot;
