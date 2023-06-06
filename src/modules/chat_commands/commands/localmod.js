import formatMessage from '../../../i18n/index.js';
import twitch from '../../../utils/twitch.js';
import chat from '../../chat/index.js';
import commandStore, {PermissionLevels} from '../store.js';

commandStore.registerCommand({
  name: 'localmod',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/localmod" - Turns on local mod-only mode (only your chat is mod-only mode)',
  }),
  handler: () => {
    chat.modsOnly(true);
    twitch.sendChatAdminMessage(`Local mods-only mode enabled.`);
  },
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'localmodoff',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/localmodoff" - Turns off local mod-only mode'}),
  handler: () => {
    chat.modsOnly(false);
    twitch.sendChatAdminMessage(`Local mods-only mode disabled.`);
  },
  permissionLevel: PermissionLevels.VIEWER,
});
