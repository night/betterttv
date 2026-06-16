import formatMessage from '@/i18n/index';
import chat from '@/modules/chat/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'localsub',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localsub" - Turns on local sub-only mode (only your chat is sub-only mode)',
  }),
  handler: () => {
    chat.subsOnly(true);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local sub-only mode enabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'localsuboff',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/localsuboff" - Turns off local sub-only mode'}),
  handler: () => {
    chat.subsOnly(false);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local sub-only mode disabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
