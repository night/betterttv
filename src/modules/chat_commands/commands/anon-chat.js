import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import anonChat from '../../anon_chat/index.js';

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
