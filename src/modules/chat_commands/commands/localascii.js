import formatMessage from '@/i18n/index';
import chat from '@/modules/chat/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'localascii',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localascii" - Turns on local ascii-only mode (only your chat is ascii-only mode)',
  }),
  handler: () => {
    chat.asciiOnly(true);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local ascii-only mode enabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'localasciioff',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localasciioff" - Turns off local ascii-only mode',
  }),
  handler: () => {
    chat.asciiOnly(false);
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Local ascii-only mode disabled.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
