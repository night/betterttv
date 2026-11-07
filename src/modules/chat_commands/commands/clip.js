import gql from 'graphql-tag';
import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import {getCurrentChannel} from '@/utils/channel';
import twitch from '@/utils/twitch';

const CLIP_POLL_INTERVAL_MS = 2000;
const CLIP_POLL_ATTEMPTS = 30;

const clipThumbnailQuery = gql`
  query BTTVGetClipThumbnail($slug: ID!) {
    clip(slug: $slug) {
      id
      thumbnailURL
    }
  }
`;

const createClipMutation = gql`
  mutation BTTVCreateClip($input: CreateClipInput!) {
    createClip(input: $input) {
      clip {
        url
        slug
      }
    }
  }
`;

const renameClipMutation = gql`
  mutation BTTVRenameClip($input: UpdateClipInput!) {
    updateClip(input: $input) {
      clip {
        slug
      }
    }
  }
`;

// createClip returns before the clip is processed, the thumbnail is the last thing to appear
async function waitForClip(slug) {
  for (let attempt = 0; attempt < CLIP_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, CLIP_POLL_INTERVAL_MS));
    const {data} = await twitch.graphqlQuery(clipThumbnailQuery, {slug});
    if (data.clip?.thumbnailURL) {
      return true;
    }
  }

  return false;
}

commandStore.registerCommand({
  name: 'clip',
  commandArgs: [{name: 'title', required: false}],
  description: formatMessage({defaultMessage: 'Usage: "/clip [title]" - Create a clip of the current stream'}),
  handler: async (title) => {
    const channel = getCurrentChannel();
    const currentPlayer = twitch.getCurrentPlayer();

    const startOffset = currentPlayer?.state?.startOffset;
    const position = currentPlayer?.state?.position;
    const broadcastId = currentPlayer?.state?.sessionData?.['BROADCAST-ID'];

    if (channel == null || broadcastId == null || startOffset == null || position == null) {
      twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to create clip, is the stream live?'}));
      return;
    }

    // opened now because browsers only allow new tabs straight after the keypress
    const clipWindow = window.open('', '_blank');
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Creating clip, please wait...'}));

    try {
      const {data} = await twitch.graphqlMutation(createClipMutation, {
        input: {
          broadcastID: broadcastId,
          broadcasterID: channel.id,
          // startOffset is frozen at page load, position is the time played since
          offsetSeconds: Math.floor(startOffset + position),
        },
      });

      const {slug, url} = data.createClip.clip;

      if (title != null && title.length > 0) {
        await twitch.graphqlMutation(renameClipMutation, {input: {slug, title}});
      }

      if (await waitForClip(slug)) {
        clipWindow?.location.assign(url);
        twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Clip created: {url}'}, {url}));
        return;
      }
    } catch (_) {}

    clipWindow?.close();
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to create clip.'}));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
