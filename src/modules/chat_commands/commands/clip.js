import gql from 'graphql-tag';
import formatMessage from '@/i18n/index';
import commandStore, {PermissionLevels} from '@/modules/chat_commands/store';
import {getCurrentChannel} from '@/utils/channel';
import twitch from '@/utils/twitch';

const CLIP_POLL_INTERVAL_MS = 2000;
const CLIP_POLL_ATTEMPTS = 30;

const streamQuery = gql`
  query BTTVGetClipStream($userId: ID!) {
    user(id: $userId) {
      id
      stream {
        id
        createdAt
      }
    }
  }
`;

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

    try {
      const {data: streamData} = await twitch.graphqlQuery(streamQuery, {userId: channel?.id});
      const stream = streamData.user?.stream;

      if (stream == null) {
        twitch.sendChatAdminMessage(
          formatMessage({defaultMessage: 'Error: Unable to create clip, is the stream live?'})
        );
        return;
      }

      twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Creating clip, please wait...'}));

      const {data} = await twitch.graphqlMutation(createClipMutation, {
        input: {
          broadcastID: stream.id,
          broadcasterID: channel.id,
          // player offsets are frozen at page load and count ad time during ads
          offsetSeconds: Math.floor((Date.now() - new Date(stream.createdAt).getTime()) / 1000),
        },
      });

      const {slug, url} = data.createClip.clip;

      if (title != null && title.length > 0) {
        await twitch.graphqlMutation(renameClipMutation, {input: {slug, title}});
      }

      if (await waitForClip(slug)) {
        twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Clip created: {url}'}, {url}), true);
      } else {
        twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to create clip.'}));
      }
    } catch (error) {
      twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to create clip.'}));
    }
  },
  permissionLevel: PermissionLevels.VIEWER,
});
