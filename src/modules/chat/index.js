const $ = require('jquery');
const watcher = require('../../watcher');
const colors = require('../../utils/colors');
const twitch = require('../../utils/twitch');
const api = require('../../utils/api');
const cdn = require('../../utils/cdn');
const html = require('../../utils/html');
const storage = require('../../storage');
const emotes = require('../emotes');
const nicknames = require('../chat_nicknames');
const channelEmotesTip = require('../channel_emotes_tip');
const legacySubscribers = require('../legacy_subscribers');

const EMOTE_STRIP_SYMBOLS_REGEX = /(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g;
const MENTION_REGEX = /^@([a-zA-Z\d_]+)$/;

const THEME_KEY = 'twilight.theme';

const badgeTemplate = (url, description) => `
    <div class="tw-tooltip-wrapper inline">
        <img alt="Moderator" class="chat-badge bttv-chat-badge" src="${url}" alt="" srcset="" data-a-target="chat-badge">
        <div class="tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">${description}</div>
    </div>
`;

const mentionTemplate = name => `<span class="mentioning">@${html.escape(name)}</span>`;

function formatChatUser({user, badges}) {
    return {
        id: user.userID,
        name: user.userLogin,
        displayName: user.userDisplayName,
        color: user.color,
        mod: badges.hasOwnProperty('moderator'),
        subscriber: badges.hasOwnProperty('subscriber'),
        badges
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
        watcher.on('channel.updated', ({bots}) => {
            channelBots = bots;
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
    }

    calculateColor(color) {
        return colors.calculateColor(color, !!storage.get(THEME_KEY, null));
    }

    customBadges($element, user) {
        if ((globalBots.includes(user.name) || channelBots.includes(user.name)) && user.mod) {
            $element.find('img.chat-badge[alt="Moderator"]')
                .addClass('bttv-chat-badge')
                .attr('srcset', '')
                .attr('src', cdn.url('tags/bot.png'));
        }

        const $badgesContainer = $element.find('.chat-badge').closest('span');

        const badge = staff.get(user.name);
        if (badge) {
            $badgesContainer.append(badgeTemplate(badge.svg, badge.description));
        }

        const currentChannel = twitch.getCurrentChannel();
        if (currentChannel && currentChannel.name === 'night' && legacySubscribers.hasSubscription(user.name)) {
            $badgesContainer.append(badgeTemplate(cdn.url('tags/subscriber.png'), 'Subscriber'));
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
            if (node.nodeType === window.Node.ELEMENT_NODE && node.classList.contains('chat-line__message--emote')) {
                const $emote = $(node);
                const code = $emote.attr('alt');
                const id = ($emote.attr('src').split('emoticons/v1/')[1] || '').split('/')[0];
                const emote = channelEmotesTip.getEmote(id, code);
                if (emote) {
                    $emote.parent().find('.tw-tooltip').css('text-align', 'center').html(emote.balloon);
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
                span.innerHTML = parts.join(' ');
                node.parentNode.replaceChild(span, node);
            }
        }
    }

    messageParser($element, messageObj) {
        const user = formatChatUser(messageObj);
        if (!user) return;

        const color = this.calculateColor(user.color);
        const $from = $element.find('.chat-line__message--username');
        $from.css('color', color);

        if (legacySubscribers.hasGlow(user.name) && !!storage.get(THEME_KEY, null)) {
            const rgbColor = colors.getRgb(color);
            $from.css('text-shadow', `0 0 20px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.8)`);
        }

        this.customBadges($element, user);

        const nickname = nicknames.get(user.name);
        if (nickname) {
            $from.text(nickname);
        }

        const messageStyle = $element.attr('style');
        if (messageStyle && messageStyle.includes('color:')) {
            $element.css('color', color);
        }

        const $message = $element.find('span[data-a-target="chat-message-text"],div.tw-tooltip-wrapper');

        if (
            (modsOnly === true && !user.mod) ||
            (subsOnly === true && !user.subscriber) ||
            (asciiOnly === true && hasNonASCII(messageObj.message))
        ) {
            $element.hide();
        }

        const $modIcons = $element.find('.chat-line__mod-icons');
        if ($modIcons.length) {
            const userIsOwner = twitch.getUserIsOwnerFromTagsBadges(user.badges);
            const userIsMod = twitch.getUserIsModeratorFromTagsBadges(user.badges);
            const currentUserIsOwner = twitch.getCurrentUserIsOwner();
            if ((userIsMod && !currentUserIsOwner) || userIsOwner) {
                $modIcons.remove();
            }
        }

        this.messageReplacer($message, user);
    }
}

module.exports = new ChatModule();
