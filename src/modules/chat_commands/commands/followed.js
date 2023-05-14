import gql from 'graphql-tag';
import {DateTime} from 'luxon';
import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import {getCurrentUser} from '../../../utils/user.js';

commandStore.registerCommand({
  name: 'followed',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/followed" - Tells you for how long you have been following a channel',
  }),
  handler: () => {
    const currentUser = getCurrentUser();
    const channel = getCurrentChannel();
    if (currentUser == null) {
      twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'You are not logged in.'}));
      return;
    }
    const query = gql`
      query BTTVGetFollowingChannel($userId: ID!) {
        user(id: $userId) {
          id
          self {
            follower {
              followedAt
            }
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
              self: {
                follower: {followedAt},
              },
            },
          },
        }) => {
          twitch.sendChatAdminMessage(
            formatMessage(
              {
                defaultMessage: 'You followed {name} {duration} ({date, date, medium})',
              },
              {
                name: channel.displayName,
                duration: DateTime.now()
                  .minus(DateTime.now().diff(DateTime.fromISO(followedAt)))
                  .toRelative(),
                date: new Date(followedAt),
              }
            )
          );
        }
      )
      .catch(() =>
        twitch.sendChatAdminMessage(
          formatMessage({defaultMessage: 'You do not follow {name}.'}, {name: channel.displayName})
        )
      );
  },
  permissionLevel: PermissionLevels.VIEWER,
});
