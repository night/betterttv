const $ = require('jquery');
const twitch = require('../../utils/twitch');
const twitchAPI = require('../../utils/twitch-api');
const chat = require('../chat');
const anonChat = require('../anon_chat');

const HELP_TEXT = `BetterTTV Chat Commands:
/b — Shortcut for /ban
/chatters — Retrieves the number of chatters in the chat
/followed — Tells you for how long you have been following a channel
/follows — Retrieves the number of followers for the channel
/join & /part — Temporarily join/part chat (anon chat)
/localascii — Turns on local ascii-only mode (only your chat is ascii-only mode)
/localasciioff — Turns off local ascii-only mode
/localmod — Turns on local mod-only mode (only your chat is mod-only mode)
/localmodoff — Turns off local mod-only mode
/localunpin — Removes pinned cheer locally
/localsub — Turns on local sub-only mode (only your chat is sub-only mode)
/localsuboff — Turns off local sub-only mode
/massunban (or /unban all or /u all) — Unbans all users in the channel (channel owner only)
/purge (or /p) — Purges a user's chat
/shrug — Appends your chat line with a shrug face
/sub — Shortcut for /subscribers
/suboff — Shortcut for /subscribersoff
/t — Shortcut for /timeout
/u — Shortcut for /unban
/uptime — Retrieves the amount of time the channel has been live
/viewers — Retrieves the number of viewers watching the channel
Native Chat Commands:`;

function secondsToLength(s) {
    const days = Math.floor(s / 86400);
    const hours = Math.floor(s / 3600) - (days * 24);
    const minutes = Math.floor(s / 60) - (days * 1440) - (hours * 60);
    const seconds = s - (days * 86400) - (hours * 3600) - (minutes * 60);

    return (days > 0 ? days + ' day' + (days === 1 ? '' : 's') + ', ' : '') +
           (hours > 0 ? hours + ' hour' + (hours === 1 ? '' : 's') + ', ' : '') +
           (minutes > 0 ? minutes + ' minute' + (minutes === 1 ? '' : 's') + ', ' : '') +
           seconds + ' second' + (seconds === 1 ? '' : 's');
}

function massUnban() {
    const currentUser = twitch.getCurrentUser();
    const currentChannel = twitch.getCurrentChannel();
    if (!currentUser || currentUser.id !== currentChannel.id) {
        twitch.sendChatAdminMessage('You must be the channel owner to use this command.');
        return;
    }

    let unbanCount = 0;

    function unbanChatters(users, callback) {
        const interval = setInterval(() => {
            const user = users.shift();

            if (!user) {
                clearInterval(interval);
                callback();
                return;
            }

            twitch.sendChatMessage(`/unban ${user}`);
        }, 333);
    }

    function getBannedChatters() {
        twitch.sendChatAdminMessage('Fetching banned users...');

        $.get('/settings/channel').then(data => {
            const users = [];

            const $chatterList = $(data).find('#banned_chatter_list');
            if ($chatterList.length) {
                $chatterList.find('.ban .obj').each(function() {
                    const user = $(this).text().trim();
                    if (users.indexOf(user) === -1) users.push(user);
                });
            }

            if (users.length === 0) {
                twitch.sendChatAdminMessage(`You have no more banned users. Total Unbanned Users: ${unbanCount}`);
                return;
            }

            unbanCount += users.length;

            twitch.sendChatAdminMessage('Starting purge process in 5 seconds.');
            twitch.sendChatAdminMessage(`This block of users will take ${(users.length / 3).toFixed(1)} seconds to unban.`);

            if (users.length > 70) {
                twitch.sendChatAdminMessage('Twitch only provides up to 100 users at a time (some repeat), but this script will cycle through all of the blocks of users.');
            }

            setTimeout(() => (
                unbanChatters(users, () => {
                    twitch.sendChatAdminMessage('This block of users has been purged. Checking for more..');
                    getBannedChatters();
                })
            ), 5000);
        });
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
        case 'unban':
            const user = messageParts.shift();
            if (user !== 'all') {
                return `/unban ${user}`;
            }
        case 'massunban': // eslint-disable-line no-fallthrough
        case 'unbanall':
            massUnban();
            break;

        // filtering
        case 'localascii':
        case 'localasciioff':
            const asciiOnly = !command.endsWith('off');
            chat.asciiOnly(asciiOnly);
            twitch.sendChatAdminMessage(`Local ascii-only mode ${asciiOnly ? 'enabled' : 'disabled'}.`);
            break;
        case 'localmod':
        case 'localmodoff':
            const modsOnly = !command.endsWith('off');
            chat.modsOnly(modsOnly);
            twitch.sendChatAdminMessage(`Local mods-only mode ${modsOnly ? 'enabled' : 'disabled'}.`);
            break;
        case 'localsub':
        case 'localsuboff':
            const subsOnly = !command.endsWith('off');
            chat.subsOnly(subsOnly);
            twitch.sendChatAdminMessage(`Local subs-only mode ${subsOnly ? 'enabled' : 'disabled'}.`);
            break;

        // fun
        case 'shrug':
            return `${messageParts.join(' ')} ¯\\_(ツ)_/¯`;
        case 'squishy':
            return 'notsquishY WHEN YOU NEED HIM notsquishY IN A JIFFY notsquishY USE THIS EMOTE notsquishY TO SUMMON SQUISHY notsquishY';

        // misc
        case 'join':
        case 'part':
            command === 'join' ? anonChat.join() : anonChat.part();
            break;

        // info
        case 'chatters':
            twitch.getCurrentTMISession()
                ._tmiApi
                .get(`/group/user/${channel.name}`)
                .then(({chatter_count}) => twitch.sendChatAdminMessage(`Current Chatters: ${chatter_count.toLocaleString()}`));
            break;
        case 'followed':
            const currentUser = twitch.getCurrentUser();
            if (!currentUser) break;
            twitchAPI.get(`users/${currentUser.id}/follows/channels/${channel.id}`)
                .then(({created_at}) => {
                    const since = window.moment(created_at);
                    twitch.sendChatAdminMessage(`You followed ${channel.displayName} ${since.fromNow()} (${since.format('LLL')})`);
                })
                .catch(() => twitch.sendChatAdminMessage(`You do not follow ${channel.displayName}.`));
            break;
        case 'follows':
            twitchAPI.get(`channels/${channel.id}`)
                .then(({followers}) => twitch.sendChatAdminMessage(`Current Followers: ${followers.toLocaleString()}`))
                .catch(() => twitch.sendChatAdminMessage('Could not fetch follower count.'));
            break;
        case 'viewers':
            twitchAPI.get(`streams/${channel.id}`)
                .then(({stream}) => {
                    const viewers = stream ? stream.viewers : 0;
                    twitch.sendChatAdminMessage(`Current Viewers: ${viewers.toLocaleString()}`);
                })
                .catch(() => twitch.sendChatAdminMessage('Could not fetch stream.'));
            break;
        case 'uptime':
            twitchAPI.get(`streams/${channel.id}`)
                .then(({stream}) => {
                    if (!stream) {
                        twitch.sendChatAdminMessage('Stream is not live');
                        return;
                    }

                    const startedTime = new Date(stream.created_at);
                    const secondsSince = Math.round((Date.now() - startedTime.getTime()) / 1000);
                    twitch.sendChatAdminMessage(`Current Uptime: ${secondsToLength(secondsSince)}`);
                })
                .catch(() => twitch.sendChatAdminMessage('Could not fetch stream.'));
            break;

        // misc
        case 'localunpin':
            chat.dismissPinnedCheer();
            break;

        case 'help':
            HELP_TEXT.split('\n').forEach(m => twitch.sendChatAdminMessage(m));
            return true;
        default:
            return true;
    }

    return false;
}

class ChatCommandsModule {
    constructor() {}

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

module.exports = new ChatCommandsModule();
