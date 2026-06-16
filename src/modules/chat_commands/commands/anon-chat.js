import formatMessage from '@/i18n/index';
import anonChat from '@/modules/anon_chat/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';

commandStore.registerCommand({
  name: 'join',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/join" - Temporarily join a chat (anon chat)'}),
  handler: () => anonChat.join(),
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'part',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/part" - Temporarily leave a chat (anon chat)'}),
  handler: () => anonChat.part(),
  permissionLevel: PermissionLevels.VIEWER,
});
