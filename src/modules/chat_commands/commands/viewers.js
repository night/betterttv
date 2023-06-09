import gql from 'graphql-tag';
import formatMessage from '../../../i18n/index.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import twitch from '../../../utils/twitch.js';
import commandStore, {PermissionLevels} from '../store.js';

commandStore.registerCommand({
  name: 'viewers',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/viewers" - Retrieves the number of viewers watching the channel',
  }),
  handler: () => {
    const channel = getCurrentChannel();
    const query = gql`
      query BTTVGetChannelStreamViewersCount($userId: ID!) {
        user(id: $userId) {
          id
          stream {
            id
            viewersCount
          }
        }
      }
    `;

    twitch
      .graphqlQuery(query, {userId: channel.id})
      .then(
        ({
          data: {
            user: {
              stream: {viewersCount},
            },
          },
        }) =>
          twitch.sendChatAdminMessage(
            formatMessage({defaultMessage: 'Current Viewers: {viewersCount, number}'}, {viewersCount})
          )
      )
      .catch(() => twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Could not fetch stream.'})));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
