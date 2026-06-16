import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'b',
  commandArgs: [
    {name: 'username', isRequired: true},
    {name: 'reason', isRequired: false},
  ],
  description: formatMessage({defaultMessage: `Usage: "/b '<'login'>' [reason]" - Shortcut for /ban`}),
  handler: (username, reason) => twitch.sendChatMessage(`/ban ${username} ${reason ?? ''}`.trimEnd()),
  permissionLevel: PermissionLevels.MODERATOR,
});
