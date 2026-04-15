import {saveAs} from 'file-saver';
import React, {useRef, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import formatMessage from '../../../i18n/index.js';
import {SETTINGS_STORAGE_KEY} from '../../../settings.js';
import storage from '../../../storage.js';
import {loadLegacySettings} from '../../../utils/legacy-settings.js';
import Footer from '../components/Footer.jsx';
import SettingGroup from '../components/SettingGroup.jsx';
import SettingWrapper from '../components/SettingWrapper.jsx';
import {Button} from '@mantine/core';
import PageHeader from '../components/PageHeader.jsx';
import useAuthStore, {getCredentials, setCredentials} from '../../../stores/auth.js';
import {revokeAccessToken} from '../../../utils/oauth.js';
import {executeOAuth2SignInAndSetCredentials} from '../../../utils/auth.js';
import {openConfirmModal} from '../../../common/utils/modal.js';
import useCloudBackupSettings from '../../../common/hooks/CloudBackup.jsx';
import SettingSwitch from '../components/SettingSwitch.jsx';
import useProRequiredState from '../../../common/hooks/ProRequiredState.jsx';
import Promotion from '../components/Promotion.jsx';

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
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = ({target}) => resolve(target.result);
    const file = input.files[0];
    if (!file) {
      resolve(null);
      return;
    }
    reader.readAsText(file);
  });
}

function BackupSetting({description, disabled}) {
  function backupFile() {
    const rv = storage.getStorage();
    saveAs(new Blob([JSON.stringify(rv)], {type: 'application/json;charset=utf-8'}), 'bttv_settings.backup');
  }

  return (
    <SettingWrapper reverse name={formatMessage({defaultMessage: 'Backup Settings'})} description={description}>
      <Button size="lg" onClick={backupFile} disabled={disabled}>
        {formatMessage({defaultMessage: 'Backup'})}
      </Button>
    </SettingWrapper>
  );
}

function ImportSetting({description, disabled, importing, setImporting}) {
  const fileImportRef = useRef(null);

  async function importFile(target) {
    setImporting(true);
    const data = loadJSON(await getDataURLFromUpload(target));
    if (data == null) {
      setImporting(false);
      return;
    }
    let importLegacy = true;
    const sanitizedData = {};
    for (const key of Object.keys(data)) {
      const nonPrefixedKey = key.split('bttv_')[1];
      storage.set(nonPrefixedKey, data[key]);
      sanitizedData[nonPrefixedKey] = data[key];
      if (nonPrefixedKey === SETTINGS_STORAGE_KEY) {
        importLegacy = false;
      }
    }
    if (importLegacy) {
      storage.set(SETTINGS_STORAGE_KEY, loadLegacySettings(sanitizedData));
    }
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <SettingWrapper reverse name={formatMessage({defaultMessage: 'Import Settings'})} description={description}>
      <input type="file" hidden ref={fileImportRef} onChange={({target}) => importFile(target)} />
      <Button onClick={fileImportRef.current?.click} disabled={disabled} loading={importing} size="lg">
        {formatMessage({defaultMessage: 'Import'})}
      </Button>
    </SettingWrapper>
  );
}

function ResetSetting({description, disabled, setResetting}) {
  const [_, setCloudBackupSettings] = useCloudBackupSettings();

  async function resetDefault() {
    setResetting(true);
    setCloudBackupSettings({enabled: false});
    storage.set(SETTINGS_STORAGE_KEY, null);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.location.reload();
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
      <Button size="lg" color="red" disabled={disabled} onClick={handleReset}>
        {formatMessage({defaultMessage: 'Reset'})}
      </Button>
    </SettingWrapper>
  );
}

function CloudBackupSetting() {
  const [cloudBackupSettings, setCloudBackupSettings] = useCloudBackupSettings();

  const [normalizedCloudBackupSettings, setNormalizedCloudBackupSettings] = useProRequiredState({
    value: cloudBackupSettings,
    setValue: setCloudBackupSettings,
    defaultValue: {enabled: false},
  });

  return (
    <SettingSwitch
      showProBadge
      showBetaBadge
      name={formatMessage({defaultMessage: 'Cloud Backup'})}
      description={formatMessage({defaultMessage: 'Backup your settings to the cloud.'})}
      value={normalizedCloudBackupSettings.enabled}
      onChange={(enabled) => setNormalizedCloudBackupSettings({enabled})}
    />
  );
}

function SignInButton() {
  const user = useAuthStore(useShallow((state) => state.user));
  const [signingIn, setSigningIn] = useState(false);

  function signIn() {
    setSigningIn(true);
    // TODO: Handle errors, maybe show modal?
    executeOAuth2SignInAndSetCredentials().finally(() => setSigningIn(false));
  }

  async function signOut() {
    const {accessToken} = getCredentials();
    await revokeAccessToken(accessToken);
    setCredentials(null);
  }

  function handleSignOut() {
    openConfirmModal({
      title: formatMessage({defaultMessage: 'Sign Out'}),
      description: formatMessage({defaultMessage: 'Are you sure you want to sign out?'}),
      onConfirm: signOut,
      labels: {
        confirm: formatMessage({defaultMessage: 'Sign Out'}),
        cancel: formatMessage({defaultMessage: 'Cancel'}),
      },
      confirmProps: {color: 'red', size: 'lg', variant: 'elevated'},
    });
  }

  if (user == null) {
    return (
      <SettingWrapper
        reverse
        name={formatMessage({defaultMessage: 'Sign In to BetterTTV'})}
        description={formatMessage({defaultMessage: 'Authenticated users gain access to additional features.'})}>
        <Button size="lg" onClick={signIn} loading={signingIn}>
          {formatMessage({defaultMessage: 'Sign In'})}
        </Button>
      </SettingWrapper>
    );
  }

  return (
    <SettingWrapper
      reverse
      name={formatMessage({defaultMessage: 'Sign Out'})}
      description={formatMessage({defaultMessage: 'Unlink account from extension.'})}>
      <Button size="lg" color="red" onClick={handleSignOut}>
        {formatMessage({defaultMessage: 'Sign Out'})}
      </Button>
    </SettingWrapper>
  );
}

function UserSettings({onClose}) {
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <React.Fragment>
      <PageHeader leftContent={formatMessage({defaultMessage: 'User Settings'})} onClose={onClose} />
      <Promotion />
      <SettingGroup name={formatMessage({defaultMessage: 'Extension'})}>
        <CloudBackupSetting />
        <BackupSetting
          description={formatMessage({defaultMessage: 'Download a copy of your settings to a JSON file.'})}
          disabled={resetting}
        />
        <ImportSetting
          description={formatMessage({defaultMessage: 'Restore your settings from a backup file.'})}
          disabled={resetting}
          importing={importing}
          setImporting={setImporting}
        />
        <ResetSetting
          description={formatMessage({defaultMessage: 'Clear all settings and restore defaults.'})}
          disabled={importing}
          resetting={resetting}
          setResetting={setResetting}
        />
      </SettingGroup>
      <SettingGroup name={formatMessage({defaultMessage: 'Account'})}>
        <SignInButton />
      </SettingGroup>
      <Footer />
    </React.Fragment>
  );
}

export default UserSettings;
