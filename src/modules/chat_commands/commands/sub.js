import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'sub',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/sub" - Shortcut for /subscribers'}),
  handler: () => twitch.sendChatMessage(`/subscribers`),
  permissionLevel: PermissionLevels.MODERATOR,
});
