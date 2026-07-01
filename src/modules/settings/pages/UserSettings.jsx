import {faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import {Avatar, Badge, Button, Tabs, Text, Title} from '@mantine/core';
import {saveAs} from 'file-saver';
import React, {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import useCloudBackupSettings from '@/common/hooks/CloudBackup';
import useCurrentUser from '@/common/hooks/CurrentUser';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import {openConfirmModal} from '@/common/utils/modal';
import {EXT_VER, SettingsPrompts} from '@/constants';
import formatMessage from '@/i18n/index';
import ImportSetting from '@/modules/settings/components/ImportSetting';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import Promotion from '@/modules/settings/components/Promotion';
import ResetSetting from '@/modules/settings/components/ResetSetting';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import storage from '@/storage';
import useAuthStore, {getCredentials, setCredentials} from '@/stores/auth';
import {executeOAuth2SignInAndSetCredentials} from '@/utils/auth';
import {revokeAccessToken} from '@/utils/oauth';
import {isUserPro} from '@/utils/pro';
import {getCurrentUserProfilePicture} from '@/utils/user';
import styles from './UserSettings.module.css';

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

function ProfileHeader() {
  const currentUser = useCurrentUser();
  const bttvUser = useAuthStore(useShallow((state) => state.user));
  const avatarSrc = bttvUser?.avatar ?? getCurrentUserProfilePicture();
  const [linking, setLinking] = useState(false);

  function linkAccount() {
    setLinking(true);
    // TODO: Handle errors, maybe show modal?
    executeOAuth2SignInAndSetCredentials().finally(() => setLinking(false));
  }

  return (
    <div className={styles.profile}>
      <Avatar src={avatarSrc} size={88} radius={1000} className={styles.profileAvatar} />
      <div className={styles.profileInfo}>
        <div className={styles.profileNameRow}>
          <Title order={2} className={styles.profileName}>
            {currentUser?.displayName ?? formatMessage({defaultMessage: 'Not signed in'})}
          </Title>
          {isUserPro(bttvUser) ? (
            <Badge color="indigo" variant="elevated" size="lg">
              {formatMessage({defaultMessage: 'Pro'})}
            </Badge>
          ) : null}
        </div>
        {currentUser?.name != null ? (
          <Text c="dimmed" className={styles.profileSubtitle}>
            @{currentUser.name}
          </Text>
        ) : null}
      </div>
      {bttvUser == null ? (
        <Button
          size="lg"
          onClick={linkAccount}
          loading={linking}
          className={styles.linkAccountButton}
          leftSection={<Icon icon={faTriangleExclamation} className={styles.linkAccountWarningIcon} />}>
          {formatMessage({defaultMessage: 'Link Account'})}
        </Button>
      ) : null}
    </div>
  );
}

function UserSettings() {
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <PageScrollBody header={<PageHeader leftContent={formatMessage({defaultMessage: 'User Settings'})} />}>
      <ProfileHeader />
      <Tabs defaultValue="extension" classNames={{list: styles.tabsList, tab: styles.tab}}>
        <Tabs.List>
          <Tabs.Tab value="extension">{formatMessage({defaultMessage: 'Extension'})}</Tabs.Tab>
          <Tabs.Tab value="account">{formatMessage({defaultMessage: 'Account'})}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="extension">
          <SettingGroup>
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
        </Tabs.Panel>
        <Tabs.Panel value="account">
          <SettingGroup>
            <SignInButton />
          </SettingGroup>
        </Tabs.Panel>
      </Tabs>
      <Promotion />
    </PageScrollBody>
  );
}

export default UserSettings;
