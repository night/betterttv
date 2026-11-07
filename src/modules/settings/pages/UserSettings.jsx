import {Anchor, Button} from '@mantine/core';
import {saveAs} from 'file-saver';
import {UserCog} from 'lucide-react';
import React, {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {formatAccountMismatchMessage} from '@/common/components/AccountMismatch';
import useCloudBackupSettings from '@/common/hooks/CloudBackup';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import {executeSignIn, openConfirmModal} from '@/common/utils/modal';
import {EXT_VER, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import Alert from '@/modules/settings/components/Alert';
import Footer from '@/modules/settings/components/Footer';
import ImportSetting, {IMPORT_SETTING_NAME} from '@/modules/settings/components/ImportSetting';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import ResetSetting, {RESET_SETTING_NAME} from '@/modules/settings/components/ResetSetting';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import storage from '@/storage';
import useAuthStore, {getCredentials, setCredentials} from '@/stores/auth';
import {revokeAccessToken} from '@/utils/oauth';

const USER_SETTINGS_NAME = formatMessage({defaultMessage: 'User Settings'});
const CLOUD_BACKUP_NAME = formatMessage({defaultMessage: 'Cloud Backup'});
const CLOUD_BACKUP_DESCRIPTION = formatMessage({defaultMessage: 'Backup your settings to the cloud.'});
const SIGN_IN_NAME = formatMessage({defaultMessage: 'Sign In to BetterTTV'});
const BACKUP_SETTINGS_NAME = formatMessage({defaultMessage: 'Backup Settings'});
const BACKUP_SETTINGS_DESCRIPTION = formatMessage({defaultMessage: 'Download a copy of your settings to a JSON file.'});
const RESTORE_BACKUP_DESCRIPTION = formatMessage({defaultMessage: 'Restore your settings from a backup file.'});
const RESET_SETTINGS_DESCRIPTION = formatMessage({defaultMessage: 'Clear all settings and restore defaults.'});

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
    <SettingWrapper reverse name={BACKUP_SETTINGS_NAME} description={description}>
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
      name={CLOUD_BACKUP_NAME}
      description={CLOUD_BACKUP_DESCRIPTION}
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

function AccountMismatchAlert() {
  const accountMismatch = useAuthStore((state) => state.accountMismatch);
  const [signingIn, signIn] = useSignIn();

  if (!accountMismatch) {
    return null;
  }

  return (
    <Alert
      description={formatAccountMismatchMessage()}
      rightContent={
        <Anchor component="button" type="button" underline="always" c="inherit" onClick={signIn} disabled={signingIn}>
          {formatMessage({defaultMessage: 'Switch Account'})}
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
        name={SIGN_IN_NAME}
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

function openUserSettings({setPage}) {
  setPage(PageTypes.USER_SETTINGS);
}

function acceptSignIn(navigation) {
  openUserSettings(navigation);
  if (useAuthStore.getState().user == null) {
    executeSignIn();
  }
}

for (const entry of [
  {query: USER_SETTINGS_NAME, keywords: ['account', 'profile']},
  {
    query: CLOUD_BACKUP_NAME,
    description: CLOUD_BACKUP_DESCRIPTION,
    keywords: ['sync'],
  },
  {
    query: SIGN_IN_NAME,
    keywords: ['log in', 'login', 'log out', 'logout', 'sign out', 'account'],
    onAccept: acceptSignIn,
  },
  {
    query: BACKUP_SETTINGS_NAME,
    description: BACKUP_SETTINGS_DESCRIPTION,
    keywords: ['export', 'download'],
  },
  {
    query: IMPORT_SETTING_NAME,
    description: RESTORE_BACKUP_DESCRIPTION,
    keywords: ['import', 'upload'],
  },
  {
    query: RESET_SETTING_NAME,
    description: RESET_SETTINGS_DESCRIPTION,
    keywords: ['defaults', 'clear'],
  },
]) {
  registerSearchEntry({icon: UserCog, onAccept: openUserSettings, ...entry});
}

function UserSettings() {
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <PageScrollBody header={<PageHeader leftContent={USER_SETTINGS_NAME} />}>
      <AccountMismatchAlert />
      <SettingGroup name={formatMessage({defaultMessage: 'Extension'})}>
        <CloudBackupSetting />
        <BackupSetting description={BACKUP_SETTINGS_DESCRIPTION} disabled={resetting} />
        <ImportSetting
          description={RESTORE_BACKUP_DESCRIPTION}
          disabled={resetting}
          importing={importing}
          setImporting={setImporting}
        />
        <ResetSetting
          description={RESET_SETTINGS_DESCRIPTION}
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
