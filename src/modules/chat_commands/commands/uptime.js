import gql from 'graphql-tag';
import formatMessage from '../../../i18n/index.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import twitch from '../../../utils/twitch.js';
import commandStore, {PermissionLevels} from '../store.js';

function secondsToLength(s) {
  const days = Math.floor(s / 86400);
  const hours = Math.floor(s / 3600) - days * 24;
  const minutes = Math.floor(s / 60) - days * 1440 - hours * 60;
  const seconds = s - days * 86400 - hours * 3600 - minutes * 60;

  return formatMessage(
    {
      defaultMessage:
        '{days, plural, =0 {} one {# day, } other {# days, }}{hours, plural, =0 {} one {# hour, } other {# hours, }}{minutes, plural, =0 {} one {# minute, } other {# minutes, }}{seconds, plural, one {# second} other {# seconds}}',
    },
    {days, hours, minutes, seconds}
  );
}

function handleUptime() {
  const channel = getCurrentChannel();
  const query = gql`
    query BTTVGetChannelStreamCreatedAt($userId: ID!) {
      user(id: $userId) {
        id
        stream {
          id
          createdAt
        }
      }
    }
  `;

  twitch
    .graphqlQuery(query, {userId: channel.id})
    .then(
      ({
        data: {
          user: {stream},
        },
      }) => {
        const startedTime = stream != null ? new Date(stream.createdAt) : null;
        if (!startedTime) {
          twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Stream is not live'}));
          return;
        }

        const secondsSince = Math.round((Date.now() - startedTime.getTime()) / 1000);
        twitch.sendChatAdminMessage(
          formatMessage({defaultMessage: 'Current Uptime: {duration}'}, {duration: secondsToLength(secondsSince)})
        );
      }
    )
    .catch(() => twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Could not fetch stream.'})));
}

commandStore.registerCommand({
  name: 'uptime',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/uptime" - Retrieves the amount of time the channel has been live',
  }),
  handler: handleUptime,
  permissionLevel: PermissionLevels.VIEWER,
});
