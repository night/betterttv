import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';

commandStore.registerCommand({
  name: 'sub',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/sub" - Shortcut for /subscribers'}),
  handler: () => twitch.sendChatMessage(`/subscribers`),
  permissionLevel: PermissionLevels.MODERATOR,
});
