import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

const command = {
  commandArgs: [
    {name: 'username', isRequired: true},
    {name: 'reason', isRequired: false},
  ],
  description: formatMessage({defaultMessage: `Usage: "/purge '<'login'>' [reason]" - Purges a user's chat`}),
  handler: (username, reason) => twitch.sendChatMessage(`/timeout ${username} 1 ${reason ?? ''}`.trimEnd()),
  permissionLevel: PermissionLevels.MODERATOR,
};

commandStore.registerCommand({name: 'purge', ...command});
commandStore.registerCommand({name: 'p', ...command});
