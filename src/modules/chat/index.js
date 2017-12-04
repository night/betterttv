const $ = require('jquery');
const watcher = require('../../watcher');
const colors = require('../../utils/colors');
const debug = require('../../utils/debug');
const twitch = require('../../utils/twitch');
const api = require('../../utils/api');
const cdn = require('../../utils/cdn');
const settings = require('../../settings');
const emotes = require('../emotes');
const nicknames = require('../chat_nicknames');
const channelEmotesTip = require('../channel_emotes_tip');
const legacySubscribers = require('../legacy_subscribers');

const EMOTE_STRIP_SYMBOLS_REGEX = /(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g;
const MIRROR_FLAG = 'Flip';
const MessagePartType = {
    TEXT: 0,
    MENTION: 1,
    LINK: 2,
    EMOTE: 3,
    CLIP: 4
};


const badgeTemplate = (url, description) => `
    <div class="tw-tooltip-wrapper inline">
        <img alt="Moderator" class="chat-badge bttv-chat-badge" src="${url}" alt="" srcset="" data-a-target="chat-badge">
        <div class="tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">${description}</div>
    </div>
`;

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

function replaceTwitchEmoticonTooltip(currentChannel, $emote) {
    const code = $emote.attr('alt');
    const id = ($emote.attr('src').split('emoticons/v1/')[1] || '').split('/')[0];
    const emote = channelEmotesTip.getEmote(id, code);
    if (!emote) return;
    $emote.parent().find('.tw-tooltip').css('text-align', 'center').html(emote.balloon);
    if (!currentChannel || emote.channel.name === currentChannel.name) return;
    $emote.on('click', () => window.open(emote.channel.url, '_blank'));
}

class ChatModule {
    constructor() {
        watcher.on('chat.message', ($element, message) => this.messageParser($element, message));
        watcher.on('channel.updated', ({bots}) => {
            channelBots = bots;
        });
        watcher.on('tmi.message', event => {
            if (event.type === twitch.TMIActionTypes.POST) {
                this.handleMessage(event);
            }
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
        return colors.calculateColor(color, settings.get('darkenedMode'));
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

    messageParser($element, messageObj) {
        const user = formatChatUser(messageObj);
        if (!user) return;

        if (
            (modsOnly === true && !user.mod) ||
            (subsOnly === true && !user.subscriber) ||
            (asciiOnly === true && hasNonASCII(messageObj.message))
        ) {
            $element.hide();
        }

        const color = this.calculateColor(user.color);
        const $from = $element.find('.chat-author__display-name,.chat-author__intl-login');
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

        const messageStyle = $element.attr('style');
        if (messageStyle && messageStyle.includes('color:')) {
            $element.css('color', color);
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

        this.messageReplacer($element, user, messageObj);
    }

    messageReplacer($element, user, messageObj) {
        const elements = Array.from($element.children()).slice(3);
        const { messageParts } = messageObj;

        if (messageParts.length !== elements.length) {
            debug.error('Html elements don\'t match messageParts object');
            return;
        }
        const currentChannel = twitch.getCurrentChannel();

        for (let i = 0; i < messageParts.length; i++) {
            const part = messageParts[i];
            const $el = $(elements[i]);

            if (part.type === MessagePartType.EMOTE && $el.find('img').length) {
                if (part.content._flip) {
                    $el.addClass('bttv-flip');
                }
                const $emote = $el.find('.chat-line__message--emote');
                if ($emote.length) {
                    replaceTwitchEmoticonTooltip(currentChannel, $emote);

                    const emote = part.content._emote ? part.content._emote : emotes.getEligibleEmote($emote.attr('alt'), user);
                    if (!emote) {
                        continue;
                    }
                    $el.addClass('bttv-emote');
                    $el.addClass(emote.providerClass());
                    $el.addClass(emote.idClass());

                    const $twitchTooltip = $el.find('.tw-tooltip');
                    $twitchTooltip.html(emote.balloon());
                }
            }
        }
    }

    handleMessage(messageObj) {
        const user = formatChatUser(messageObj);
        const { messageParts } = messageObj;

        const newMessageParts = [];
        messageObj.messageParts = newMessageParts;
        for (let i = 0; i < messageParts.length; i++) {
            const messagePart = messageParts[i];

            switch (messagePart.type) {
                case MessagePartType.TEXT:
                    newMessageParts.push(
                        ...this.parseText(user, messagePart.content.trim())
                    );
                    break;
                case MessagePartType.EMOTE:
                    // figure out if previous part is a text ending by the Mirror flag
                    const previousPart = newMessageParts[newMessageParts.length - 1];
                    if (previousPart && previousPart.type === MessagePartType.TEXT) {
                        const tokens = previousPart.content.trim().split(' ');
                        const lastToken = tokens.pop();
                        if (lastToken === MIRROR_FLAG) {
                            // flip current emote and remove mirror flag from previous text
                            messagePart.content._flip = true;
                            previousPart.content = ' ' + tokens.join(' ') + ' ';
                        }
                    }
                    newMessageParts.push(messagePart);
                    break;
                default:
                    newMessageParts.push(messagePart);
            }
        }
    }

    parseText(user, text) {
        const newText = [];
        const parts = text.split(' ');
        const newParts = [];

        let flipNextEmote = false;
        for (let j = 0; j < parts.length; j++) {
            const part = parts[j];
            const emote = emotes.getEligibleEmote(part, user)
                || emotes.getEligibleEmote(part.replace(EMOTE_STRIP_SYMBOLS_REGEX, ''), user);
            const flipCurrentEmote = flipNextEmote;
            flipNextEmote = part === MIRROR_FLAG;

            if (emote) {
                const newEmote = {
                    alt: emote.code,
                    images: {
                        sources: emote.images,
                        themed: false
                    },
                    _flip: flipCurrentEmote,
                    _emote: emote
                };
                if (newText.length) {
                    if (flipCurrentEmote) {
                        // the text part before the emote must be removed
                        newText.pop();
                    }
                    newParts.push({
                        type: MessagePartType.TEXT,
                        content: ' ' + newText.join(' ') + ' '
                    });
                    newText.length = 0;
                }
                newParts.push({
                    type: MessagePartType.EMOTE,
                    content: newEmote
                });
            } else {
                newText.push(part);
                if (j === parts.length - 1) {
                    newParts.push({
                        type: MessagePartType.TEXT,
                        content: ' ' + newText.join(' ') + ' '
                    });
                }
            }
        }

        return newParts;
    }
}

module.exports = new ChatModule();
