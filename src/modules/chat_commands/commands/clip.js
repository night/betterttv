import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import twitch from '../../../utils/twitch.js';
import gql from 'graphql-tag';

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
      twitch.sendChatAdminMessage('Error: Unable to create clip, is the stream live?');
      return;
    }

    try {
      const {data} = await twitch.graphqlMutation(createClipMutation, {
        input: {
          broadcastID: broadcastId,
          broadcasterID: channel.id,
          offsetSeconds: startOffset,
        },
      });

      if (title != null) {
        await twitch.graphqlMutation(renameClipMutation, {input: {slug: data.createClip.clip.slug, title}});
      }

      twitch.sendChatMessage(data.createClip.clip.url);
    } catch (error) {
      console.error(error);
      twitch.sendChatAdminMessage('Error: Unable to create clip, please try again later.');
    }
  },
  permissionLevel: PermissionLevels.VIEWER,
});
