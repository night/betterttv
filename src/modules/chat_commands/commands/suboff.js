import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'suboff',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/suboff" - Shortcut for /subscribersoff'}),
  handler: () => twitch.sendChatMessage(`/subscribersoff`),
  permissionLevel: PermissionLevels.MODERATOR,
});
