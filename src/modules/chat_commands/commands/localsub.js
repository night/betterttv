import formatMessage from '../../../i18n/index.js';
import twitch from '../../../utils/twitch.js';
import chat from '../../chat/index.js';
import commandStore, {PermissionLevels} from '../store.js';

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
