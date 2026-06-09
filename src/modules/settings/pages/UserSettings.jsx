import {saveAs} from 'file-saver';
import React, {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import formatMessage from '../../../i18n/index.js';
import storage from '../../../storage.js';
import Footer from '../components/Footer.jsx';
import PageScrollBody from '../components/PageScrollBody.jsx';
import SettingGroup from '../components/SettingGroup.jsx';
import SettingWrapper from '../components/SettingWrapper.jsx';
import ImportSetting from '../components/ImportSetting.jsx';
import ResetSetting from '../components/ResetSetting.jsx';
import {Button} from '@mantine/core';
import useAuthStore, {getCredentials, setCredentials} from '../../../stores/auth.js';
import {revokeAccessToken} from '../../../utils/oauth.js';
import {executeOAuth2SignInAndSetCredentials} from '../../../utils/auth.js';
import {openConfirmModal} from '../../../common/utils/modal.js';
import useCloudBackupSettings from '../../../common/hooks/CloudBackup.jsx';
import SettingSwitch from '../components/SettingSwitch.jsx';
import useProRequiredState from '../../../common/hooks/ProRequiredState.jsx';
import Promotion from '../components/Promotion.jsx';
import {EXT_VER} from '../../../constants.js';

function BackupSetting({description, disabled}) {
  function backupFile() {
    const rv = storage.getStorage();
    const version = `v${EXT_VER}`;
    const now = new Date();

    const date = [
      now.toLocaleDateString('en-US', {month: 'long'}),
      now.toLocaleDateString('en-US', {day: 'numeric'}),
      now.toLocaleDateString('en-US', {year: 'numeric'}),
    ].join(' ');

    const filename = formatMessage({defaultMessage: 'BetterTTV Settings Backup ({version}) {date}'}, {version, date});
    const filenameWithExtension = `${filename}.json`;
    const blob = new Blob([JSON.stringify(rv)], {type: 'application/json;charset=utf-8'});

    saveAs(blob, filenameWithExtension);
  }

  return (
    <SettingWrapper reverse name={formatMessage({defaultMessage: 'Backup Settings'})} description={description}>
      <Button size="lg" onClick={backupFile} disabled={disabled}>
        {formatMessage({defaultMessage: 'Backup'})}
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
  const [, setCloudBackupSettings] = useCloudBackupSettings();

  function signIn() {
    setSigningIn(true);
    // TODO: Handle errors, maybe show modal?
    executeOAuth2SignInAndSetCredentials().finally(() => setSigningIn(false));
  }

  async function signOut() {
    const {accessToken} = getCredentials();
    await revokeAccessToken(accessToken);
    setCredentials(null);
    setCloudBackupSettings({enabled: false});
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

function UserSettings() {
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <PageScrollBody>
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
    </PageScrollBody>
  );
}

export default UserSettings;
