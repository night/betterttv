import dayjs from 'dayjs';
import relativeTime from 'dayjs/esm/plugin/relativeTime/index.js';
import twitch from '../../utils/twitch.js';
import twitchAPI from '../../utils/twitch-api.js';
import chat from '../chat/index.js';
import anonChat from '../anon_chat/index.js';

dayjs.extend(relativeTime);

const CommandHelp = {
  b: 'Usage: "/b <login> [reason]" - Shortcut for /ban',
  chatters: 'Usage: "/chatters" - Retrieces the number of chatters in the chat',
  followed: 'Usage: "/followed" - Tells you for how long you have been following a channel',
  follows: 'Usage: "/follows" - Retrieves the number of followers for the channel',
  join: 'Usage: "/join" - Temporarily join a chat (anon chat)',
  localascii: 'Usage "/localascii" - Turns on local ascii-only mode (only your chat is ascii-only mode)',
  localasciioff: 'Usage "/localasciioff" - Turns off local ascii-only mode',
  localmod: 'Usage "/localmod" - Turns on local mod-only mode (only your chat is mod-only mode)',
  localmodoff: 'Usage "/localmodoff" - Turns off local mod-only mode',
  localsub: 'Usage "/localsub" - Turns on local sub-only mode (only your chat is sub-only mode)',
  localsuboff: 'Usage "/localsuboff" - Turns off local sub-only mode',
  massunban: 'Usage "/massunban" - Unbans all users in the channel (channel owner only)',
  p: 'Usage "/p <login> [reason]" - Shortcut for /purge',
  part: 'Usage: "/part" - Temporarily leave a chat (anon chat)',
  purge: 'Usage "/purge <login> [reason]" - Purges a user\'s chat',
  shrug: 'Usage "/shrug" - Appends your chat line with a shrug face',
  sub: 'Usage "/sub" - Shortcut for /subscribers',
  suboff: 'Usage "/suboff" - Shortcut for /subscribersoff',
  t: 'Usage "/t <login> [duration] [reason]" - Shortcut for /timeout',
  u: 'Usage "/u <login>" - Shortcut for /unban',
  uptime: 'Usage "/uptime" - Retrieves the amount of time the channel has been live',
  viewers: 'Usage "/viewers" - Retrieves the number of viewers watching the channel',
};

function secondsToLength(s) {
  const days = Math.floor(s / 86400);
  const hours = Math.floor(s / 3600) - days * 24;
  const minutes = Math.floor(s / 60) - days * 1440 - hours * 60;
  const seconds = s - days * 86400 - hours * 3600 - minutes * 60;

  return `${days > 0 ? `${days} day${days === 1 ? '' : 's'}, ` : ''} ${
    hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'}, ` : ''
  }  ${minutes > 0 ? `${minutes} minute${minutes === 1 ? '' : 's'}, ` : ''} ${seconds} seconds${
    seconds === 1 ? '' : 's'
  }`;
}

function massUnban() {
  const currentUser = twitch.getCurrentUser();
  const currentChannel = twitch.getCurrentChannel();
  if (!currentUser || currentUser.id !== currentChannel.id) {
    twitch.sendChatAdminMessage('You must be the channel owner to use this command.');
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
    twitch.sendChatAdminMessage('Fetching banned users...');

    const query = `
            query Settings_ChannelChat_BannedChatters {
                currentUser {
                    bannedUsers {
                        bannedUser {
                            login
                        }
                    }
                }
            }
        `;

    twitchAPI.graphqlQuery(query).then(
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
          twitch.sendChatAdminMessage('There was an error retrieving banned users.');
          return;
        }

        if (users.length === 0) {
          twitch.sendChatAdminMessage(`You have no banned users. Total Unbanned Users: ${unbanCount}`);
          return;
        }

        unbanCount += users.length;
        twitch.sendChatAdminMessage(`Starting purge of ${users.length} users in 5 seconds.`);
        twitch.sendChatAdminMessage(`This block of users will take ${(users.length / 3).toFixed(1)} seconds to unban.`);
        setTimeout(
          () =>
            unbanChatters(users, () => {
              twitch.sendChatAdminMessage('This block of users has been purged. Checking for more..');
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

  const channel = twitch.getCurrentChannel();

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
      const query = `
                query ChatViewers($name: String!) {
                    channel(name: $name) {
                        chatters {
                            count
                        }
                    }
                }
            `;

      twitchAPI
        .graphqlQuery(query, {name: channel.name})
        .then(
          ({
            data: {
              channel: {
                chatters: {count},
              },
            },
          }) => twitch.sendChatAdminMessage(`Current Chatters: ${count.toLocaleString()}`)
        )
        .catch(() => twitch.sendChatAdminMessage('Could not fetch chatter count.'));
      break;
    }
    case 'followed': {
      const currentUser = twitch.getCurrentUser();
      if (!currentUser) break;
      twitchAPI
        .get(`users/${currentUser.id}/follows/channels/${channel.id}`)
        .then(({created_at: createdAt}) => {
          const since = dayjs(createdAt);
          twitch.sendChatAdminMessage(
            `You followed ${channel.displayName} ${since.fromNow()} (${since.toDate().toLocaleString()})`
          );
        })
        .catch(() => twitch.sendChatAdminMessage(`You do not follow ${channel.displayName}.`));
      break;
    }
    case 'follows':
      twitchAPI
        .get(`channels/${channel.id}`)
        .then(({followers}) => twitch.sendChatAdminMessage(`Current Followers: ${followers.toLocaleString()}`))
        .catch(() => twitch.sendChatAdminMessage('Could not fetch follower count.'));
      break;
    case 'viewers':
      twitchAPI
        .get(`streams/${channel.id}`)
        .then(({stream}) => {
          const viewers = stream ? stream.viewers : 0;
          twitch.sendChatAdminMessage(`Current Viewers: ${viewers.toLocaleString()}`);
        })
        .catch(() => twitch.sendChatAdminMessage('Could not fetch stream.'));
      break;
    case 'uptime': {
      twitchAPI
        .get(`streams/${channel.id}`)
        .then(({stream}) => {
          const startedTime = stream ? new Date(stream.created_at) : null;
          if (!startedTime) {
            twitch.sendChatAdminMessage('Stream is not live');
            return;
          }

          const secondsSince = Math.round((Date.now() - startedTime.getTime()) / 1000);
          twitch.sendChatAdminMessage(`Current Uptime: ${secondsToLength(secondsSince)}`);
        })
        .catch(() => twitch.sendChatAdminMessage('Could not fetch stream.'));
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
          `BetterTTV Chat Commands: (Use "/help <command>" for more info on a command) /${commandNames.join(' /')}`
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

export default new ChatCommandsModule();
