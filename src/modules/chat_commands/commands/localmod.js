import formatMessage from '@/i18n/index';
import chat from '@/modules/chat/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'localmod',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localmod" - Turns on local mod-only mode (only your chat is mod-only mode)',
  }),
  handler: () => {
    chat.modsOnly(true);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local mods-only mode enabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'localmodoff',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/localmodoff" - Turns off local mod-only mode'}),
  handler: () => {
    chat.modsOnly(false);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local mods-only mode disabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
