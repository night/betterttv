import formatMessage from '../../../i18n/index.js';
import twitch from '../../../utils/twitch.js';
import chat from '../../chat/index.js';
import commandStore, {PermissionLevels} from '../store.js';

commandStore.registerCommand({
  name: 'localascii',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/localasciioff" - Turns off local ascii-only mode'}),
  handler: () => {
    chat.asciiOnly(true);
    twitch.sendChatAdminMessage(`Local ascii-only mode enabled.`);
  },
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'localasciioff',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localmod" - Turns on local mod-only mode (only your chat is mod-only mode)',
  }),
  handler: () => {
    chat.asciiOnly(false);
    twitch.sendChatAdminMessage(`Local ascii-only mode disabled.`);
  },
  permissionLevel: PermissionLevels.VIEWER,
});
