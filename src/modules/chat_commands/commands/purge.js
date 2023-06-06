import formatMessage from '../../../i18n/index.js';
import twitch from '../../../utils/twitch.js';
import commandStore, {PermissionLevels} from '../store.js';

const command = {
  commandArgs: [
    {name: 'username', isRequired: true},
    {name: 'reason', isRequired: false},
  ],
  description: formatMessage({defaultMessage: `Usage: "/purge '<'login'>' [reason]" - Purges a user's chat`}),
  handler: async (username, reason) => twitch.sendChatMessage(`/timeout ${username} 1 ${reason}`),
  permissionLevel: PermissionLevels.MODERATOR,
};

commandStore.registerCommand({name: 'purge', ...command});
commandStore.registerCommand({name: 'p', ...command});
