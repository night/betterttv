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
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';
import useAuthStore from '@/stores/auth';

const SETTING_NAME = formatMessage({defaultMessage: 'Self Bot'});

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
        name={formatMessage({defaultMessage: 'Self Bot'})}
        description={formatMessage({defaultMessage: 'Automatically send and reply to messages on your own channel.'})}
        showNewBadge
        value={displayEnabled}
        onChange={handleEnabledChange}
      />
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Commands'})}
        reverse
        description={formatMessage({defaultMessage: 'Configure command triggers and responses.'})}>
        <Button size="lg" onClick={() => setPage(PageTypes.SELF_BOT_COMMANDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Timers'})}
        reverse
        showComingSoonBadge
        description={formatMessage({defaultMessage: 'Automatically send messages at specific times.'})}>
        <Button disabled size="lg">
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
    </SettingGroup>
  );
}

SettingStore.registerSetting(SelfBot, {
  settingPanelId: SettingPanelIds.SELF_BOT,
  settingCategoryId: SettingCategoryIds.BOTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default SelfBot;
