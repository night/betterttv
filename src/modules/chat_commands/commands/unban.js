import gql from 'graphql-tag';
import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';
import {getCurrentUser} from '../../../utils/user.js';
import {getCurrentChannel} from '../../../utils/channel.js';

function massUnban() {
  const currentUser = getCurrentUser();
  const currentChannel = getCurrentChannel();
  if (!currentUser || currentUser.id !== currentChannel.id) {
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'You must be the channel owner to use this command.'}));
    return;
  }

  // some users can fail to be unbanned, so store unbanned names to prevent infinite loop
  const unbannedChatters = [];
  let unbanCount = 0;

  function unbanChatters(users, callback) {
    const interval = setInterval(() => {
      const user = users.shift();

      if (!user) {
        clearInterval(interval);
        callback();
        return;
      }
      unbannedChatters.push(user);
      twitch.sendChatMessage(`/unban ${user}`);
    }, 333);
  }

  function getBannedChatters() {
    twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'Fetching banned users...'}));

    const query = gql`
      query BTTVGetBannedChatters {
        currentUser {
          id
          bannedUsers {
            bannedUser {
              id
              login
            }
          }
        }
      }
    `;

    twitch.graphqlQuery(query).then(
      ({
        data: {
          currentUser: {bannedUsers},
        },
      }) => {
        let users = [];
        try {
          users = bannedUsers
            .filter(({bannedUser}) => bannedUser && bannedUser.login && !unbannedChatters.includes(bannedUser.login))
            .map(({bannedUser: {login}}) => login);
        } catch (_) {
          twitch.sendChatAdminMessage(formatMessage({defaultMessage: 'There was an error retrieving banned users.'}));
          return;
        }

        if (users.length === 0) {
          twitch.sendChatAdminMessage(
            formatMessage(
              {defaultMessage: 'You have no banned users. Total Unbanned Users: {unbanCount, number}'},
              {unbanCount}
            )
          );
          return;
        }

        unbanCount += users.length;
        twitch.sendChatAdminMessage(
          formatMessage(
            {defaultMessage: 'Starting purge of {userCount, number} users in 5 seconds.'},
            {userCount: users.length}
          )
        );
        twitch.sendChatAdminMessage(
          formatMessage(
            {
              defaultMessage: `This block of users will take {duration, number} seconds to unban.`,
            },
            {duration: Number((users.length / 3).toFixed(1))}
          )
        );
        setTimeout(
          () =>
            unbanChatters(users, () => {
              twitch.sendChatAdminMessage(
                formatMessage({defaultMessage: 'This block of users has been purged. Checking for more..'})
              );
              getBannedChatters();
            }),
          5000
        );
      }
    );
  }

  getBannedChatters();
}

const unbanCommand = {
  commandArgs: [{name: 'username', isRequired: true}],
  description: formatMessage({defaultMessage: `Usage: "/u '<'login'>'" - Shortcut for /unban`}),
  handler: (username) => (username === 'all' ? massUnban() : twitch.sendChatMessage(`/unban ${username}`)),
  permissionLevel: PermissionLevels.MODERATOR,
};

commandStore.registerCommand({name: 'unban', ...unbanCommand});
commandStore.registerCommand({name: 'u', ...unbanCommand});

const massUnbanCommand = {
  commandArgs: [],
  description: formatMessage({defaultMessage: `Usage: "/massunban" - Unbans all users in the channel`}),
  handler: () => massUnban(),
  permissionLevel: PermissionLevels.MODERATOR,
};

commandStore.registerCommand({name: 'massunban', ...massUnbanCommand});
commandStore.registerCommand({name: 'unbanall', ...massUnbanCommand});
