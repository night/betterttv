import {Anchor, Button} from '@mantine/core';
import {saveAs} from 'file-saver';
import React, {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import useCloudBackupSettings from '@/common/hooks/CloudBackup';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import {executeSignIn, openConfirmModal} from '@/common/utils/modal';
import {EXT_VER} from '@/constants';
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
    <SettingWrapper reverse name={formatMessage({defaultMessage: 'Download a backup'})} description={description}>
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
      name={formatMessage({defaultMessage: 'Back up to the cloud'})}
      description={formatMessage({defaultMessage: 'Stores your settings with your account.'})}
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
    executeSignIn().finally(() => setSigningIn(false));
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
      description={formatMessage({defaultMessage: 'Some features are unavailable until you sign in.'})}
      rightContent={
        <Anchor component="button" type="button" underline="always" c="inherit" onClick={signIn} disabled={signingIn}>
          {formatMessage({defaultMessage: 'Sign In'})}
        </Anchor>
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
        name={formatMessage({defaultMessage: 'Sign in to BetterTTV'})}
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
      name={formatMessage({defaultMessage: 'Sign out'})}
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
          description={formatMessage({defaultMessage: 'Saves your settings to a JSON file.'})}
          disabled={resetting}
        />
        <ImportSetting
          description={formatMessage({defaultMessage: 'Loads your settings from a JSON file.'})}
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
