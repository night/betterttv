import gql from 'graphql-tag';
import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';
import {getCurrentChannel} from '../../../utils/channel.js';

commandStore.registerCommand({
  name: 'chatters',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/chatters" - Retrieves the number of chatters in the chat'}),
  handler: () => {
    const channel = getCurrentChannel();
    const query = gql`
      query BTTVGetChannelChattersCount($name: String!) {
        channel(name: $name) {
          id
          chatters {
            count
          }
        }
      }
    `;

    twitch
      .graphqlQuery(query, {name: channel.name})
      .then(
        ({
          data: {
            channel: {
              chatters: {count},
            },
          },
        }) => twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Current Chatters: {count}'}, {count}))
      )
      .catch(() => twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Could not fetch chatter count.'})));
  },
  permissionLevel: PermissionLevels.VIEWER,
});
