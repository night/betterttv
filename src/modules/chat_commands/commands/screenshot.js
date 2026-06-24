import {DateTime} from 'luxon';
import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import {getCurrentChannel} from '@/utils/channel';
import twitch from '@/utils/twitch';

const VIDEO_PLAYER_SELECTOR = '.video-player__container';

commandStore.registerCommand({
  name: 'screenshot',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/screenshot" - Save a screenshot of the current stream frame as a PNG',
  }),
  handler: () => {
    const video = document.querySelector(VIDEO_PLAYER_SELECTOR)?.querySelector('video');

    if (video == null || !video.videoWidth || !video.videoHeight) {
      twitch.sendChatAdminMessage(
        formatMessage({defaultMessage: 'Error: Unable to take a screenshot, is the stream playing?'})
      );
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context == null) {
      twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to take a screenshot.'}));
      return;
    }

    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (_) {
      // drawImage throws a SecurityError if the video frame is cross-origin "tainted" (e.g. some ads)
      twitch.sendChatAdminMessage(
        formatMessage({defaultMessage: 'Error: Unable to take a screenshot of the current frame.'})
      );
      return;
    }

    canvas.toBlob((blob) => {
      if (blob == null) {
        twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to take a screenshot.'}));
        return;
      }

      const channel = getCurrentChannel();
      const channelName = channel?.name ?? 'twitch';
      const timestamp = DateTime.local().toFormat('yyyy-MM-dd_HH-mm-ss');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${channelName}_${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  },
  permissionLevel: PermissionLevels.VIEWER,
});
