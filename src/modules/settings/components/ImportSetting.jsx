import React, {useRef} from 'react';
import {Button} from '@mantine/core';
import formatMessage from '../../../i18n/index.js';
import {SETTINGS_STORAGE_KEY} from '../../../settings.js';
import storage from '../../../storage.js';
import {loadLegacySettings} from '../../../utils/legacy-settings.js';
import {CLOUD_BACKUP_SETTINGS_STORAGE_KEY} from '../../../constants.js';
import SettingWrapper from './SettingWrapper.jsx';
import useCloudBackupSettings from '../../../common/hooks/CloudBackup.jsx';
import {openConfirmModal} from '../../../common/utils/modal.js';
import cloudBackup from '../../cloud_backup/index.js';
import {isUserPro} from '../../../utils/pro.js';
import useAuthStore from '../../../stores/auth.js';
import {useShallow} from 'zustand/react/shallow';

function loadJSON(string) {
  let json = null;

  try {
    json = JSON.parse(string);
  } catch (e) {
    json = null;
  }

  return json;
}

function getDataURLFromUpload(input) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', ({target}) => resolve(target.result), {once: true});

    if (input.files.length === 0) {
      reject(new Error('No file selected'));
    }

    const [file] = input.files;

    reader.readAsText(file);
  });
}

async function importSettingsFromFile(target) {
  const dataUrl = await getDataURLFromUpload(target);
  let data = loadJSON(dataUrl);

  if (data == null) {
    return;
  }

  let importLegacy = true;
  const sanitizedData = {};

  for (const key of Object.keys(data)) {
    const nonPrefixedKey = key.split('bttv_')[1];
    let value = data[key];

    if (nonPrefixedKey === SETTINGS_STORAGE_KEY) {
      importLegacy = false;
    }

    storage.set(nonPrefixedKey, value);
    sanitizedData[nonPrefixedKey] = value;
  }

  if (importLegacy) {
    const migratedSettings = loadLegacySettings(sanitizedData);
    storage.set(SETTINGS_STORAGE_KEY, migratedSettings);
  }

  return sanitizedData;
}

function ImportSetting({description, disabled, importing, setImporting}) {
  const fileImportRef = useRef(null);
  const [cloudBackupSettings, setCloudBackupSettings] = useCloudBackupSettings();
  const currentUser = useAuthStore(useShallow((state) => state.user));

  async function importFile(target) {
    const sanitizedData = await importSettingsFromFile(target);

    let cloudBackupEnabled = cloudBackupSettings.enabled;

    if (typeof sanitizedData[CLOUD_BACKUP_SETTINGS_STORAGE_KEY] !== 'undefined') {
      cloudBackupEnabled = sanitizedData[CLOUD_BACKUP_SETTINGS_STORAGE_KEY]?.enabled === true;
    }

    if (!cloudBackupEnabled || !isUserPro(currentUser)) {
      window.location.reload();
      return;
    }

    openConfirmModal({
      title: formatMessage({defaultMessage: 'Sync to Cloud Backup?'}),
      description: formatMessage({
        defaultMessage: 'Your settings were imported successfully, Would you like to sync them to the cloud?',
      }),
      onConfirm: () => cloudBackup._handleInternalSettingsChange(sanitizedData, true),
      onCancel: () => setCloudBackupSettings({enabled: false}),
      onClose: () => setTimeout(() => window.location.reload(), 500),
      labels: {
        confirm: formatMessage({defaultMessage: 'Sync to Cloud'}),
        cancel: formatMessage({defaultMessage: 'Disable Cloud Backup'}),
      },
      confirmProps: {color: 'red', size: 'lg', variant: 'elevated'},
    });
  }

  return (
    <SettingWrapper reverse name={formatMessage({defaultMessage: 'Import Settings'})} description={description}>
      <input
        type="file"
        hidden
        ref={fileImportRef}
        accept=".backup,.json"
        onChange={({target}) => importFile(target)}
      />
      <Button onClick={() => fileImportRef.current?.click()} disabled={disabled} loading={importing} size="lg">
        {formatMessage({defaultMessage: 'Import'})}
      </Button>
    </SettingWrapper>
  );
}

export default ImportSetting;
