import gql from 'graphql-tag';
import formatMessage from '../../../i18n/index.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import twitch from '../../../utils/twitch.js';
import commandStore, {PermissionLevels} from '../store.js';

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

commandStore.registerCommand({
  name: 'clip',
  commandArgs: [{name: 'title', required: false}],
  description: formatMessage({defaultMessage: 'Usage: "/clip [title]" - Create a clip of the current stream'}),
  handler: async (title) => {
    const channel = getCurrentChannel();
    const currentPlayer = twitch.getCurrentPlayer();

    const startOffset = currentPlayer?.state?.startOffset;
    const broadcastId = currentPlayer?.state?.sessionData?.['BROADCAST-ID'];

    if (channel == null || broadcastId == null || startOffset == null) {
      twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Error: Unable to create clip, try again later.'}));
      return;
    }

    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Creating clip, please wait...'}));

    try {
      const {data} = await twitch.graphqlMutation(createClipMutation, {
        input: {
          broadcastID: broadcastId,
          broadcasterID: channel.id,
          offsetSeconds: startOffset,
        },
      });

      if (title != null && title.length > 0) {
        await twitch.graphqlMutation(renameClipMutation, {input: {slug: data.createClip.clip.slug, title}});
      }

      twitch.sendChatMessage(data.createClip.clip.url);
    } catch (error) {
      twitch.sendChatAdminMessage('Error: Unable to create clip, try again later.');
    }
  },
  permissionLevel: PermissionLevels.VIEWER,
});
