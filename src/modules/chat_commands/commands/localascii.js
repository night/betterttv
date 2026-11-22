import formatMessage from '@/i18n/index';
import chat from '@/modules/chat/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'localascii',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localascii" - Turns on local ASCII-only mode (for your chat only)',
  }),
  handler: () => {
    chat.asciiOnly(true);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local ASCII-only mode enabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'localasciioff',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localasciioff" - Turns off local ASCII-only mode',
  }),
  handler: () => {
    chat.asciiOnly(false);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local ASCII-only mode disabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
