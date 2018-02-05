const $ = require('jquery');
const watcher = require('../../watcher');
const colors = require('../../utils/colors');
const twitch = require('../../utils/twitch');
const api = require('../../utils/api');
const cdn = require('../../utils/cdn');
const html = require('../../utils/html');
const settings = require('../../settings');
const emotes = require('../emotes');
const nicknames = require('../chat_nicknames');
const channelEmotesTip = require('../channel_emotes_tip');
const legacySubscribers = require('../legacy_subscribers');

const EMOTE_STRIP_SYMBOLS_REGEX = /(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g;
const MENTION_REGEX = /^@([a-zA-Z\d_]+)$/;

const badgeTemplate = (url, description) => `
    <span class="balloon-wrapper float-left">
        <img src="${url}" alt="${description}" class="badge">
        <div class="balloon balloon--tooltip balloon--up">${description}</div>
    </span>
`;

const mentionTemplate = name => `<span class="mentioning">@${html.escape(name)}</span>`;

function formatChatUser({from, color, tags}) {
    if (!tags || from === 'jtv') return null;

    if (from && typeof from !== 'string') {
        return {
            id: from.get('id'),
            name: from.get('username'),
            displayName: from.get('displayName'),
            color: from.get('color')
        };
    }

    const badges = tags.badges || {};

    return {
        id: tags['user-id'],
        name: tags.login || from,
        displayName: tags['display-name'],
        color: tags.color || color,
        mod: tags.mod || badges.hasOwnProperty('moderator'),
        subscriber: tags.subscriber || badges.hasOwnProperty('subscriber'),
        badges: badges
    };
}

const staff = new Map();
const globalBots = ['nightbot', 'moobot'];
let channelBots = [];
let asciiOnly = false;
let subsOnly = false;
let modsOnly = false;

function hasNonASCII(message) {
    for (let i = 0; i < message.length; i++) {
        if (message.charCodeAt(i) > 128) return true;
    }
    return false;
}

class ChatModule {
    constructor() {
        watcher.on('chat.message', ($element, message) => this.messageParser($element, message));
        watcher.on('conversation.message', ($element, message) => this.messageParser($element, message, false));
        watcher.on('channel.updated', ({bots}) => {
            channelBots = bots;
        });
        watcher.on('load.chat', () => {
            const controller = twitch.getChatController();
            if (!controller) return;
            controller.set('showList', false);
        });
        watcher.on('load.dashboard', () => {
            const currentChannel = twitch.getCurrentChannel();
            if (!currentChannel) return;
            $('.js-dashboard-chat-module').html(`<iframe src="https://www.twitch.tv/popout/${currentChannel.name}/chat" width="100%" height="100%" scrolling="no"></iframe>`);
        });

        api.get('badges').then(({types, badges}) => {
            const staffBadges = {};
            types.forEach(({name, description, svg}) => {
                staffBadges[name] = {
                    description,
                    svg
                };
            });

            badges.forEach(({name, type}) => staff.set(name, staffBadges[type]));
        });

        // Twitch has message history natively, but it is not on for everyone
        try {
            window.Twitch.experiments.overrideExperimentValue('MESSAGE_HISTORY', 'on');
        } catch (e) {}
    }

    calculateColor(color) {
        return colors.calculateColor(color, settings.get('darkenedMode'));
    }

    customBadges($element, user) {
        if ((globalBots.includes(user.name) || channelBots.includes(user.name)) && user.mod) {
            $element.find('img.badge[alt="Moderator"]').attr('src', cdn.url('tags/bot.png')).attr('srcset', '');
        }

        const badge = staff.get(user.name);
        if (badge) {
            $element.find('.badges').append(badgeTemplate(badge.svg, badge.description));
        }

        const currentChannel = twitch.getCurrentChannel();
        if (currentChannel && currentChannel.name === 'night' && legacySubscribers.hasSubscription(user.name)) {
            $element.find('.badges').append(badgeTemplate(cdn.url('tags/subscriber.png'), 'Subscriber'));
        }
    }

    asciiOnly(enabled) {
        asciiOnly = enabled;
    }

    subsOnly(enabled) {
        subsOnly = enabled;
    }

    modsOnly(enabled) {
        modsOnly = enabled;
    }

    messageReplacer($message, user) {
        const currentChannel = twitch.getCurrentChannel();
        const tokens = $message.contents();
        for (let i = 0; i < tokens.length; i++) {
            const node = tokens[i];
            if (node.nodeType === window.Node.ELEMENT_NODE && (node.classList.contains('balloon-wrapper') || node.classList.contains('tw-tooltip-wrapper'))) {
                const $emote = $(node);
                const $image = $emote.find('img');
                if (!$image.length) continue;
                const code = $image.attr('alt');
                const id = ($image.attr('src').split('emoticons/v1/')[1] || '').split('/')[0];
                const emote = channelEmotesTip.getEmote(id, code);
                if (emote) {
                    $emote.find('.balloon,.tw-tooltip').css('text-align', 'center').html(emote.balloon);
                    if (!currentChannel || emote.channel.name === currentChannel.name) continue;
                    $emote.on('click', () => window.open(emote.channel.url, '_blank'));
                }
                continue;
            }
            let data;
            if (node.nodeType === window.Node.ELEMENT_NODE && node.nodeName === 'SPAN') {
                data = $(node).text();
            } else if (node.nodeType === window.Node.TEXT_NODE) {
                data = node.data;
            } else {
                continue;
            }

            const parts = data.split(' ');
            let modified = false;
            for (let j = 0; j < parts.length; j++) {
                const part = parts[j];
                if (!part || typeof part !== 'string') {
                    continue;
                }

                const mention = part.match(MENTION_REGEX);
                if (part.length > 2 && part.charAt(0) === '@' && mention && mention[1]) {
                    parts[j] = mentionTemplate(mention[1]);
                    modified = true;
                    continue;
                }

                const emote = emotes.getEligibleEmote(part, user) || emotes.getEligibleEmote(part.replace(EMOTE_STRIP_SYMBOLS_REGEX, ''), user);
                if (emote) {
                    parts[j] = emote.toHTML();
                    modified = true;
                    continue;
                }

                // escape all non-emotes since html strings would be rendered as html
                parts[j] = html.escape(parts[j]);
            }

            if (modified) {
                // TODO: find a better way to do this (this seems most performant tho, only a single mutation vs multiple)
                const span = document.createElement('span');
                span.className = 'bttv-parsed';
                span.innerHTML = parts.join(' ');
                node.parentNode.replaceChild(span, node);
            }
        }
    }

    messageParser($element, messageObj, channelChat = true) {
        const user = formatChatUser(messageObj);
        if (!user) return;

        const color = this.calculateColor(user.color);
        const $from = $element.find('.from');
        $from.css('color', color);

        if (legacySubscribers.hasGlow(user.name) && settings.get('darkenedMode') === true) {
            const rgbColor = colors.getRgb(color);
            $from.css('text-shadow', `0 0 20px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.8)`);
        }

        this.customBadges($element, user);

        const nickname = nicknames.get(user.name);
        if (nickname) {
            $from.text(nickname);
        }

        const $message = $element.find('.message');
        const messageStyle = $message.attr('style');
        if (messageStyle && messageStyle.includes('color:')) {
            $message.css('color', color);
        }

        if (channelChat && ($element.hasClass('whisper-line') || $element.hasClass('admin'))) {
            channelChat = false;
        }
        if (
            channelChat && (
                (modsOnly === true && !user.mod) ||
                (subsOnly === true && !user.subscriber) ||
                (asciiOnly === true && hasNonASCII(messageObj.message))
            )
        ) {
            $element.hide();
        }

        const $modIcons = $element.find('.mod-icons');
        if ($modIcons.length) {
            const userIsOwner = twitch.getUserIsOwnerFromTagsBadges(user.badges);
            const userIsMod = twitch.getUserIsModeratorFromTagsBadges(user.badges);
            const currentUserIsOwner = twitch.getCurrentUserIsOwner();
            if ((userIsMod && !currentUserIsOwner) || userIsOwner) {
                $modIcons.hide();
            }
        }

        this.messageReplacer($message, user);
    }

    dismissPinnedCheer() {
        try {
            const service = window.App.__container__.lookup('service:bits-pinned-cheers');
            if (service.topPinnedCheer || service.recentPinnedCheer) service.dismissLocalMessage();
        } catch (dismissError) {
            debug.log('Failed to dismiss cheer:', dismissError);
        }
    }
}

module.exports = new ChatModule();
