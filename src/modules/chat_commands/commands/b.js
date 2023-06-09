import formatMessage from '../../../i18n/index.js';
import twitch from '../../../utils/twitch.js';
import commandStore, {PermissionLevels} from '../store.js';

commandStore.registerCommand({
  name: 'b',
  commandArgs: [
    {name: 'username', isRequired: true},
    {name: 'reason', isRequired: false},
  ],
  description: formatMessage({defaultMessage: `Usage: "/b '<'login'>' [reason]" - Shortcut for /ban`}),
  handler: (username, reason) => twitch.sendChatMessage(`/ban ${username} ${reason}`),
  permissionLevel: PermissionLevels.MODERATOR,
});
