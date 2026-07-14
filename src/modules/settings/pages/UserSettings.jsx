import {Button} from '@mantine/core';
import {saveAs} from 'file-saver';
import React, {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import useCloudBackupSettings from '@/common/hooks/CloudBackup';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import {openConfirmModal} from '@/common/utils/modal';
import {EXT_VER, SettingsPrompts} from '@/constants';
import formatMessage from '@/i18n/index';
import Alert from '@/modules/settings/components/Alert';
import Footer from '@/modules/settings/components/Footer';
import ImportSetting from '@/modules/settings/components/ImportSetting';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import ResetSetting from '@/modules/settings/components/ResetSetting';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import storage from '@/storage';
import useAuthStore, {getCredentials, setCredentials} from '@/stores/auth';
import {executeOAuth2SignInAndSetCredentials} from '@/utils/auth';
import {revokeAccessToken} from '@/utils/oauth';

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
      showNewBadge
      name={formatMessage({defaultMessage: 'Cloud Backup'})}
      description={formatMessage({defaultMessage: 'Backup your settings to the cloud.'})}
      value={normalizedCloudBackupSettings.enabled}
      onChange={(enabled) => setNormalizedCloudBackupSettings({enabled})}
    />
  );
}

function useSignIn() {
  const [signingIn, setSigningIn] = useState(false);

  function signIn() {
    setSigningIn(true);
    // TODO: Handle errors, maybe show modal?
    executeOAuth2SignInAndSetCredentials().finally(() => setSigningIn(false));
  }

  return [signingIn, signIn];
}

function SignInAlert() {
  const user = useAuthStore(useShallow((state) => state.user));
  const [signingIn, signIn] = useSignIn();

  if (user != null) {
    return null;
  }

  return (
    <Alert
      message={formatMessage({defaultMessage: 'You are not signed in!'})}
      description={formatMessage({defaultMessage: 'Sign in to access additional features.'})}
      rightContent={
        <Button size="lg" variant="elevated" color="contrast" onClick={signIn} loading={signingIn}>
          {formatMessage({defaultMessage: 'Sign In'})}
        </Button>
      }
    />
  );
}

function SignInButton() {
  const user = useAuthStore(useShallow((state) => state.user));
  const [signingIn, signIn] = useSignIn();
  const [, setCloudBackupSettings] = useCloudBackupSettings();

  async function signOut() {
    const {accessToken} = getCredentials();
    await revokeAccessToken(accessToken);
    setCredentials(null);
    setCloudBackupSettings({enabled: false});
    // Re-arm the one-time settings sign-in prompt so the user is nudged again next time.
    storage.set(SettingsPrompts.SIGN_IN, false);
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
    });
  }

  if (user == null) {
    return (
      <SettingWrapper
        reverse
        name={formatMessage({defaultMessage: 'Sign In to BetterTTV'})}
        description={formatMessage({defaultMessage: 'Authenticated users gain access to additional features.'})}>
        <Button size="lg" variant="elevated" color="contrast" onClick={signIn} loading={signingIn}>
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
      <Button size="lg" onClick={handleSignOut}>
        {formatMessage({defaultMessage: 'Sign Out'})}
      </Button>
    </SettingWrapper>
  );
}

function UserSettings() {
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <PageScrollBody header={<PageHeader leftContent={formatMessage({defaultMessage: 'User Settings'})} />}>
      <SignInAlert />
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
