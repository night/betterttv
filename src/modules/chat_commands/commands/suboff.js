import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';

commandStore.registerCommand({
  name: 'suboff',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/suboff" - Shortcut for /subscribersoff'}),
  handler: () => twitch.sendChatMessage(`/subscribersoff`),
  permissionLevel: PermissionLevels.MODERATOR,
});
