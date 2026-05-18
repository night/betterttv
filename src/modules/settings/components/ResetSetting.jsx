import React from 'react';
import {Button} from '@mantine/core';
import {useShallow} from 'zustand/react/shallow';
import formatMessage from '../../../i18n/index.js';
import {SETTINGS_STORAGE_KEY} from '../../../settings.js';
import storage from '../../../storage.js';
import {EXT_VER, SettingDefaultValues} from '../../../constants.js';
import SettingWrapper from './SettingWrapper.jsx';
import useCloudBackupSettings from '../../../common/hooks/CloudBackup.jsx';
import {openConfirmModal} from '../../../common/utils/modal.js';
import cloudBackup from '../../cloud_backup/index.js';
import {isUserPro} from '../../../utils/pro.js';
import useAuthStore from '../../../stores/auth.js';

function ResetSetting({description, disabled, resetting, setResetting}) {
  const [cloudBackupSettings, setCloudBackupSettings] = useCloudBackupSettings();
  const currentUser = useAuthStore(useShallow((state) => state.user));

  function resetDefault() {
    setResetting(true);
    storage.set(SETTINGS_STORAGE_KEY, null);

    if (!cloudBackupSettings.enabled || !isUserPro(currentUser)) {
      setTimeout(() => window.location.reload(), 500);
      return;
    }

    openConfirmModal({
      title: formatMessage({defaultMessage: 'Reset Cloud Backup?'}),
      description: formatMessage({
        defaultMessage:
          'Your local settings have been reset to default. Would you like to reset your cloud backup to default as well?',
      }),
      onConfirm: () => cloudBackup._handleInternalSettingsChange(SettingDefaultValues, true),
      onCancel: () => setCloudBackupSettings({enabled: false}),
      onClose: () => setTimeout(() => window.location.reload(), 500),
      labels: {
        confirm: formatMessage({defaultMessage: 'Reset'}),
        cancel: formatMessage({defaultMessage: 'Disable Cloud Backup'}),
      },
      confirmProps: {color: 'red', size: 'lg', variant: 'elevated'},
    });
  }

  function handleReset() {
    openConfirmModal({
      title: formatMessage({defaultMessage: 'Reset to Default'}),
      description: formatMessage({
        defaultMessage: 'Are you sure you want to reset your settings to default? This cannot be reversed.',
      }),
      onConfirm: resetDefault,
      labels: {
        confirm: formatMessage({defaultMessage: 'Reset'}),
        cancel: formatMessage({defaultMessage: 'Cancel'}),
      },
      confirmProps: {color: 'red', size: 'lg', variant: 'elevated'},
    });
  }

  return (
    <SettingWrapper reverse name={formatMessage({defaultMessage: 'Reset to Default'})} description={description}>
      <Button size="lg" color="red" disabled={disabled} loading={resetting} onClick={handleReset}>
        {formatMessage({defaultMessage: 'Reset'})}
      </Button>
    </SettingWrapper>
  );
}

export default ResetSetting;
