import dayjs from 'dayjs';
import gql from 'graphql-tag';
import relativeTime from 'dayjs/esm/plugin/relativeTime/index.js';
import twitch from '../../utils/twitch.js';
import chat from '../chat/index.js';
import anonChat from '../anon_chat/index.js';
import {getCurrentUser} from '../../utils/user.js';
import {getCurrentChannel} from '../../utils/channel.js';
import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import formatMessage from '../../i18n/index.js';

dayjs.extend(relativeTime);

const CommandHelp = {
  b: formatMessage({defaultMessage: `Usage: "/b '<'login'>' [reason]" - Shortcut for /ban`}),
  chatters: formatMessage({defaultMessage: 'Usage: "/chatters" - Retrieces the number of chatters in the chat'}),
  followed: formatMessage({
    defaultMessage: 'Usage: "/followed" - Tells you for how long you have been following a channel',
  }),
  follows: formatMessage({defaultMessage: 'Usage: "/follows" - Retrieves the number of followers for the channel'}),
  join: formatMessage({defaultMessage: 'Usage: "/join" - Temporarily join a chat (anon chat)'}),
  localascii: formatMessage({
    defaultMessage: 'Usage "/localascii" - Turns on local ascii-only mode (only your chat is ascii-only mode)',
  }),
  localasciioff: formatMessage({defaultMessage: 'Usage "/localasciioff" - Turns off local ascii-only mode'}),
  localmod: formatMessage({
    defaultMessage: 'Usage "/localmod" - Turns on local mod-only mode (only your chat is mod-only mode)',
  }),
  localmodoff: formatMessage({defaultMessage: 'Usage "/localmodoff" - Turns off local mod-only mode'}),
  localsub: formatMessage({
    defaultMessage: 'Usage "/localsub" - Turns on local sub-only mode (only your chat is sub-only mode)',
  }),
  localsuboff: formatMessage({defaultMessage: 'Usage "/localsuboff" - Turns off local sub-only mode'}),
  massunban: formatMessage({
    defaultMessage: 'Usage "/massunban" - Unbans all users in the channel (channel owner only)',
  }),
  p: formatMessage({defaultMessage: `Usage "/p '<'login'>' [reason]" - Shortcut for /purge`}),
  part: formatMessage({defaultMessage: 'Usage: "/part" - Temporarily leave a chat (anon chat)'}),
  purge: formatMessage({defaultMessage: `Usage "/purge '<'login'>' [reason]" - Purges a user's chat`}),
  shrug: formatMessage({defaultMessage: 'Usage "/shrug" - Appends your chat line with a shrug face'}),
  sub: formatMessage({defaultMessage: 'Usage "/sub" - Shortcut for /subscribers'}),
  suboff: formatMessage({defaultMessage: 'Usage "/suboff" - Shortcut for /subscribersoff'}),
  t: formatMessage({defaultMessage: `Usage "/t '<'login'>' [duration] [reason]" - Shortcut for /timeout`}),
  u: formatMessage({defaultMessage: `Usage "/u '<'login'>'" - Shortcut for /unban`}),
  uptime: formatMessage({defaultMessage: 'Usage "/uptime" - Retrieves the amount of time the channel has been live'}),
  viewers: formatMessage({defaultMessage: 'Usage "/viewers" - Retrieves the number of viewers watching the channel'}),
};

function secondsToLength(s) {
  const days = Math.floor(s / 86400);
  const hours = Math.floor(s / 3600) - days * 24;
  const minutes = Math.floor(s / 60) - days * 1440 - hours * 60;
  const seconds = s - days * 86400 - hours * 3600 - minutes * 60;

  return `${days > 0 ? `${days} day${days === 1 ? '' : 's'}, ` : ''} ${
    hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'}, ` : ''
  }  ${minutes > 0 ? `${minutes} minute${minutes === 1 ? '' : 's'}, ` : ''} ${seconds} second${
    seconds === 1 ? '' : 's'
  }`;
}

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

function handleCommands(message) {
  const messageParts = message.trim().split(' ');

  let command = messageParts.shift().toLowerCase();
  if (!command || command.charAt(0) !== '/') return true;
  command = command.slice(1);

  const channel = getCurrentChannel();

  switch (command) {
    // moderation command shortcuts
    case 'b':
      return `/ban ${messageParts.join(' ')}`;
    case 'p':
    case 'purge':
      return `/timeout ${messageParts.shift()} 1 ${messageParts.join(' ')}`;
    case 'sub':
      return '/subscribers';
    case 'suboff':
      return '/subscribersoff';
    case 't':
      return `/timeout ${messageParts.join(' ')}`;
    case 'u':
    case 'unban': {
      const user = messageParts.shift() || '';
      if (user !== 'all') {
        return `/unban ${user}`;
      }
    }
    case 'massunban': // eslint-disable-line no-fallthrough
    case 'unbanall':
      massUnban();
      break;

    // filtering
    case 'localascii':
    case 'localasciioff': {
      const asciiOnly = !command.endsWith('off');
      chat.asciiOnly(asciiOnly);
      twitch.sendChatAdminMessage(`Local ascii-only mode ${asciiOnly ? 'enabled' : 'disabled'}.`);
      break;
    }
    case 'localmod':
    case 'localmodoff': {
      const modsOnly = !command.endsWith('off');
      chat.modsOnly(modsOnly);
      twitch.sendChatAdminMessage(`Local mods-only mode ${modsOnly ? 'enabled' : 'disabled'}.`);
      break;
    }
    case 'localsub':
    case 'localsuboff': {
      const subsOnly = !command.endsWith('off');
      chat.subsOnly(subsOnly);
      twitch.sendChatAdminMessage(`Local subs-only mode ${subsOnly ? 'enabled' : 'disabled'}.`);
      break;
    }
    // fun
    case 'shrug':
      return `${messageParts.join(' ')} ¯\\_(ツ)_/¯`;
    case 'squishy':
      return 'notsquishY WHEN YOU NEED HIM notsquishY IN A JIFFY notsquishY USE THIS EMOTE notsquishY TO SUMMON SQUISHY notsquishY';

    // misc
    case 'join':
    case 'part':
      if (command === 'join') {
        anonChat.join();
      } else {
        anonChat.part();
      }
      break;

    case 'chatters': {
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
      break;
    }
    case 'followed': {
      const currentUser = getCurrentUser();
      if (!currentUser) break;
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
            const since = dayjs(followedAt);
            twitch.sendChatAdminMessage(
              formatMessage(
                {
                  defaultMessage: 'You followed {name} {duration} ({date, date, medium})',
                },
                {
                  name: channel.displayName,
                  duration: since.fromNow(), // TODO: localize this
                  date: since.toDate(),
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
      break;
    }
    case 'follows': {
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
      break;
    }
    case 'viewers': {
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
      break;
    }
    case 'uptime': {
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
      break;
    }

    case 'help': {
      const commandNames = Object.keys(CommandHelp);
      const subCommand = messageParts.length && messageParts[0].replace(/^\//, '').toLowerCase();
      if (subCommand && commandNames.includes(subCommand)) {
        twitch.sendChatAdminMessage(CommandHelp[subCommand]);
        return false;
      }
      if (!subCommand) {
        twitch.sendChatAdminMessage(
          formatMessage(
            {
              defaultMessage: `BetterTTV Chat Commands: (Use "/help '<'command'>'" for more info on a command) {commandNames}`,
            },
            {commandNames: `/${commandNames.join(' /')}`}
          )
        );
      }
      return true;
    }

    default:
      return true;
  }

  return false;
}

class ChatCommandsModule {
  onSendMessage(sendState) {
    const result = handleCommands(sendState.message);
    if (result === false) {
      sendState.preventDefault();
    }

    if (typeof result === 'string') {
      sendState.message = result;
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatCommandsModule()]);
