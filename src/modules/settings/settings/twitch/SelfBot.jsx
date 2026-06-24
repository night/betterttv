import React, {useCallback, useContext} from 'react';
import {Button} from '@mantine/core';
import {useShallow} from 'zustand/react/shallow';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import useStorageState from '@/common/hooks/StorageState';
import useIsOnOwnChannel from '@/common/hooks/IsOnOwnChannel';
import {openSignInModal, openConfirmModal} from '@/common/utils/modal';
import useAuthStore from '@/stores/auth';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';

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

function SelfBot(props, ref) {
  const {setPage} = useContext(PageContext);
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
        value={displayEnabled}
        onChange={handleEnabledChange}
      />
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Commands'})}
        reverse
        showProBadge
        description={formatMessage({defaultMessage: 'Configure command triggers and responses.'})}>
        <Button size="lg" onClick={() => setPage(PageTypes.SELF_BOT_COMMANDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Timers'})}
        reverse
        showProBadge
        showComingSoonBadge
        description={formatMessage({defaultMessage: 'Automatically send messages at specific times.'})}>
        <Button disabled size="lg">
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(SelfBot), {
  settingPanelId: SettingPanelIds.SELF_BOT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['self', 'bot', 'commands', 'reply', 'automatic', 'timers'],
});

export default React.forwardRef(SelfBot);
