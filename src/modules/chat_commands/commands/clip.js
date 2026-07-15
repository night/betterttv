import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import {getCurrentChannel} from '@/utils/channel';
import twitch from '@/utils/twitch';

commandStore.registerCommand({
  name: 'clip',
  description: formatMessage({defaultMessage: 'Usage: "/clip" - Clip the current stream in the Twitch clip editor'}),
  handler: () => {
    const channel = getCurrentChannel();
    const currentPlayer = twitch.getCurrentPlayer();

    const offsetSeconds = currentPlayer != null ? currentPlayer.getStartOffset() + currentPlayer.getPosition() : null;
    const broadcastId = currentPlayer?.state?.sessionData?.['BROADCAST-ID'];

    if (channel == null || broadcastId == null || offsetSeconds == null) {
      twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to create clip, is the stream live?'}));
      return;
    }

    const clipUrl = new URL('https://clips.twitch.tv/create');
    clipUrl.searchParams.set('broadcastID', broadcastId);
    clipUrl.searchParams.set('broadcasterLogin', channel.name);
    clipUrl.searchParams.set('offsetSeconds', Math.floor(offsetSeconds));

    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Opening the clip editor...'}));
    window.open(clipUrl, '_blank');
  },
  permissionLevel: PermissionLevels.VIEWER,
});
