import gql from 'graphql-tag';
import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';
import {getCurrentChannel} from '../../../utils/channel.js';

commandStore.registerCommand({
  name: 'follows',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/follows" - Retrieves the number of followers for the channel'}),
  handler: () => {
    const channel = getCurrentChannel();
    const query = gql`
      query BTTVGetChannelFollowerCount($userId: ID!) {
        user(id: $userId) {
          id
          followers(first: 1) {
            totalCount
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
              followers: {totalCount},
            },
          },
        }) =>
          twitch.sendChatAdminMessage(
            formatMessage({defaultMessage: 'Current Followers: {totalCount, number}'}, {totalCount})
          )
      )
      .catch(() => twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Could not fetch follower count.'})));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
