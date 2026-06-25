import React from 'react';
import {Anchor, Kbd, Text} from '@mantine/core';
import useStorageState from '@/common/hooks/StorageState';
import {openModal} from '@/common/utils/modal';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import commandStore from '@/modules/chat_commands/store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import styles from './SlashCommands.module.css';

const SETTING_NAME = formatMessage({defaultMessage: 'Slash Commands'});

function SlashCommandsModalBody() {
  const commands = commandStore.getVisibleCommands();

  return (
    <div className={styles.commandsModalBody}>
      <Text size="md" className={styles.commandsModalDescription}>
        {formatMessage({
          defaultMessage:
            'BetterTTV adds the following slash commands to Twitch chat. Type them into the chat input to use them.',
        })}
      </Text>
      <div className={styles.commandsList}>
        {commands.map((command) => (
          <div key={command.name} className={styles.command}>
            <Kbd size="lg" className={styles.commandName}>
              /{command.name}
            </Kbd>
            <Text size="md" className={styles.commandDescription}>
              {command.description}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

function openSlashCommandsModal() {
  return openModal({
    title: formatMessage({defaultMessage: 'Slash Commands'}),
    children: <SlashCommandsModalBody />,
  });
}

function SlashCommands(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.TWITCH_SLASH_COMMANDS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={SETTING_NAME}
        value={value}
        onChange={setValue}
        description={formatMessage(
          {
            defaultMessage:
              'Adds extra <link>slash commands</link> to Twitch chat, such as /viewers, /uptime, and /localmod.',
          },
          {
            link: (string) => (
              <Anchor key="slashCommandsLink" component="button" onClick={openSlashCommandsModal}>
                {string}
              </Anchor>
            ),
          }
        )}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(SlashCommands), {
  settingPanelId: SettingPanelIds.SLASH_COMMANDS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['slash', 'commands', 'chat', 'viewers', 'uptime', 'localmod', 'shrug'],
});

export default React.forwardRef(SlashCommands);
