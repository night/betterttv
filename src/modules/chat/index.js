import watcher from '../../watcher.js';
import colors from '../../utils/colors.js';
import twitch from '../../utils/twitch.js';
import api from '../../utils/api.js';
import cdn from '../../utils/cdn.js';
import settings from '../../settings.js';
import emotes from '../emotes/index.js';
import nicknames from '../chat_nicknames/index.js';
import subscribers from '../subscribers/index.js';
import splitChat from '../split_chat/index.js';
import {EmoteTypeFlags, SettingIds, UsernameFlags} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {getCurrentChannel} from '../../utils/channel.js';
import formatMessage from '../../i18n/index.js';

const EMOTE_STRIP_SYMBOLS_REGEX = /(^[~!@#$%^&*()]+|[~!@#$%^&*()]+$)/g;
const STEAM_LOBBY_JOIN_REGEX = /^steam:\/\/joinlobby\/\d+\/\d+\/\d+$/;
const EMOTES_TO_CAP = ['567b5b520e984428652809b6'];
const MAX_EMOTES_WHEN_CAPPED = 10;
const EMOTE_SELECTOR =
  '.bttv-animated-static-emote, .chat-line__message, .vod-message, .pinned-chat__message, .thread-message__message';
const EMOTE_HOVER_SELECTOR =
  '.bttv-animated-static-emote:hover, .chat-line__message:hover, .vod-message:hover, .pinned-chat__message:hover, .thread-message__message:hover';

const EMOTE_MODIFIERS = {
  'w!': 'bttv-emote-modifier-wide',
  'h!': 'bttv-emote-modifier-flip-horizontal',
  'v!': 'bttv-emote-modifier-flip-vertical',
  'z!': 'bttv-emote-modifier-zero-space',
};
const EMOTE_MODIFIERS_LIST = Object.keys(EMOTE_MODIFIERS);

const badgeTemplate = (url, description) => {
  const badgeContainer = document.createElement('div');
  badgeContainer.classList.add('bttv-tooltip-wrapper', 'bttv-chat-badge-container');

  const image = new Image();
  image.src = url;
  image.alt = description;
  image.classList.add('chat-badge', 'bttv-chat-badge');
  image.setAttribute('data-a-target', 'chat-badge');
  badgeContainer.appendChild(image);

  const tooltip = document.createElement('div');
  tooltip.classList.add('bttv-tooltip', 'bttv-tooltip--up');
  tooltip.style.marginBottom = '0.9rem';
  tooltip.innerText = description;
  badgeContainer.appendChild(tooltip);

  return badgeContainer;
};
const steamLobbyJoinTemplate = (joinLink) => {
  const anchor = document.createElement('a');
  anchor.href = joinLink;
  anchor.innerText = joinLink;
  return anchor;
};

function formatChatUser(message) {
  if (message == null) {
    return null;
  }

  const {user} = message;
  if (user == null) {
    return null;
  }

  let {badges} = message;
  if (badges == null) {
    badges = {};
  }

  return {
    id: user.userID,
    name: user.userLogin,
    displayName: user.userDisplayName,
    color: user.color,
    mod: Object.prototype.hasOwnProperty.call(badges, 'moderator'),
    subscriber:
      Object.prototype.hasOwnProperty.call(badges, 'subscriber') ||
      Object.prototype.hasOwnProperty.call(badges, 'founder'),
    badges,
  };
}

const staff = new Map();
const globalBots = ['nightbot', 'moobot'];
let channelBots = [];
let asciiOnly = false;
let subsOnly = false;
let modsOnly = false;
let currentMoveTarget = null;

function hasNonASCII(message) {
  for (let i = 0; i < message.length; i++) {
    if (message.charCodeAt(i) > 128) return true;
  }
  return false;
}

function getMessagePartsFromMessageElement(message) {
  return message.querySelectorAll('span[data-a-target="chat-message-text"]');
}

class ChatModule {
  constructor() {
    watcher.on('load', () => this.loadEmoteMouseHandler());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.loadEmoteMouseHandler());
    watcher.on('chat.message', (element, message) => this.messageParser(element, message));
    watcher.on('chat.notice_message', (element) => this.noticeMessageParser(element));
    watcher.on('chat.pinned_message', (element) => this.pinnedMessageParser(element));
    watcher.on('chat.status', (element, message) => {
      if (message?.renderBetterTTVEmotes !== true) {
        return;
      }
      this.messageReplacer(element, null, true);
    });
    watcher.on('channel.updated', ({bots}) => {
      channelBots = bots;
    });
    watcher.on('emotes.updated', (name) => {
      const messages = twitch.getChatMessages(name);

      for (const {message, element} of messages) {
        const user = formatChatUser(message);
        if (!user) {
          continue;
        }

        this.messageReplacer(getMessagePartsFromMessageElement(element), user);
      }
    });

    api.get('cached/badges').then((badges) => {
      badges.forEach(({name, badge}) => staff.set(name, badge));
    });
  }

  loadEmoteMouseHandler() {
    const emotesSettingValue = settings.get(SettingIds.EMOTES);
    const handleAnimatedEmotes =
      !hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES) ||
      !hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_EMOTES);

    if (handleAnimatedEmotes) {
      document.addEventListener('mousemove', this.handleEmoteMouseEvent);
    } else {
      document.removeEventListener('mousemove', this.handleEmoteMouseEvent);
    }
  }

  handleEmoteMouseEvent({target}) {
    const currentTargets = [];
    if (currentMoveTarget !== target) {
      const closestTarget = target.closest(EMOTE_SELECTOR);
      if (closestTarget != null) {
        currentTargets.push(closestTarget);
      }
      const closestCurrentMoveTarget = currentMoveTarget?.closest(EMOTE_SELECTOR);
      if (closestCurrentMoveTarget != null) {
        currentTargets.push(closestCurrentMoveTarget);
      }
    }
    currentMoveTarget = target;

    if (currentTargets.length === 0) {
      return;
    }

    for (const currentTarget of currentTargets) {
      const isHovering = currentTarget.matches(EMOTE_HOVER_SELECTOR);
      const messageEmotes = currentTarget.querySelectorAll('.bttv-animated-static-emote img');
      for (const emote of messageEmotes) {
        const staticSrc = emote.__bttvStaticSrc ?? emote.src;
        const staticSrcSet = emote.__bttvStaticSrcSet ?? emote.srcset;
        const animatedSrc = emote.__bttvAnimatedSrc;
        const animatedSrcSet = emote.__bttvAnimatedSrcSet;
        if (!animatedSrc || !animatedSrcSet) {
          return;
        }

        if (!isHovering) {
          emote.src = staticSrc;
          emote.srcset = staticSrcSet;
        } else {
          emote.src = animatedSrc;
          emote.srcset = animatedSrcSet;
        }
      }
    }
  }

  calculateColor(color) {
    if (!hasFlag(settings.get(SettingIds.USERNAMES), UsernameFlags.READABLE)) {
      return color;
    }

    return colors.calculateColor(color, settings.get(SettingIds.DARKENED_MODE));
  }

  customBadges(user) {
    const badges = [];

    const staffBadge = staff.get(user.name);
    if (staffBadge) {
      badges.push(badgeTemplate(staffBadge.svg, staffBadge.description));
    }

    const currentChannel = getCurrentChannel();
    if (currentChannel && currentChannel.name === 'night' && subscribers.hasLegacySubscription(user.id)) {
      badges.push(badgeTemplate(cdn.url('tags/subscriber.png'), 'Subscriber'));
    }

    const subscriberBadge = subscribers.getSubscriptionBadge(user.id);
    if (subscriberBadge?.url != null) {
      badges.push(
        badgeTemplate(
          subscriberBadge.url,
          subscriberBadge.startedAt
            ? formatMessage(
                {defaultMessage: 'BetterTTV Pro since {date, date, medium}'},
                {date: new Date(subscriberBadge.startedAt)}
              )
            : formatMessage({defaultMessage: 'BetterTTV Pro Subscriber'})
        )
      );
    }

    return badges;
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

  messageReplacer(nodes, user, exact = false) {
    let tokens = [];
    if (
      NodeList.prototype.isPrototypeOf.call(NodeList.prototype, nodes) ||
      HTMLCollection.prototype.isPrototypeOf.call(HTMLCollection.prototype, nodes)
    ) {
      for (const node of nodes) {
        tokens.push(...node.childNodes);
      }
    } else {
      const node = nodes[0] ?? nodes;
      tokens = node.childNodes ?? [];
    }

    let cappedEmoteCount = 0;
    for (let i = 0; i < tokens.length; i++) {
      const node = tokens[i];

      let data;
      if (node.nodeType === window.Node.ELEMENT_NODE && node.nodeName === 'SPAN') {
        data = node.innerText;
      } else if (node.nodeType === window.Node.TEXT_NODE) {
        data = node.data;
      } else {
        continue;
      }

      const parts = data.split(' ');
      let modified = false;
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        if (part == null || typeof part !== 'string') {
          continue;
        }

        const steamJoinLink = part.match(STEAM_LOBBY_JOIN_REGEX);
        if (steamJoinLink) {
          parts[j] = steamLobbyJoinTemplate(steamJoinLink[0]);
          modified = true;
          continue;
        }

        const emote =
          emotes.getEligibleEmote(part, user) ||
          (!exact ? emotes.getEligibleEmote(part.replace(EMOTE_STRIP_SYMBOLS_REGEX, ''), user) : null);
        if (emote) {
          let modifier;
          const previousPart = parts[j - 1] ?? '';
          if (EMOTE_MODIFIERS_LIST.includes(previousPart)) {
            parts[j - 1] = null;
            modifier = previousPart;
          }
          parts[j] =
            EMOTES_TO_CAP.includes(emote.id) && ++cappedEmoteCount > MAX_EMOTES_WHEN_CAPPED
              ? null
              : emote.render(modifier, modifier != null ? EMOTE_MODIFIERS[modifier] : null);
          modified = true;
          continue;
        }
      }

      if (modified) {
        const fragment = document.createDocumentFragment();
        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
          let part = parts[partIndex];
          if (part == null) {
            continue;
          }
          if (part.nodeType == null) {
            part = document.createTextNode(part);
          }
          fragment.appendChild(part);
          if (partIndex < parts.length - 1) {
            fragment.appendChild(document.createTextNode(' '));
          }
        }
        node.parentNode.replaceChild(fragment, node);
      }
    }
  }

  messageParser(element, messageObj) {
    if (element.__bttvParsed) return;

    splitChat.render(element);

    const user = formatChatUser(messageObj);
    if (!user) return;

    const from = element.querySelector('.chat-author__display-name,.chat-author__intl-login');
    let color;
    if (hasFlag(settings.get(SettingIds.USERNAMES), UsernameFlags.READABLE)) {
      color = this.calculateColor(user.color);

      from.style.color = color;
      if (element.style.color) {
        element.style.color = color;
      }
    } else {
      color = from.style.color;
    }

    if (subscribers.hasGlow(user.id) && settings.get(SettingIds.DARKENED_MODE) === true) {
      const rgbColor = colors.getRgb(color);
      from.style.textShadow = `0 0 20px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.8)`;
    }

    if ((globalBots.includes(user.name) || channelBots.includes(user.name)) && user.mod) {
      element
        .querySelector('img.chat-badge[alt="Moderator"]')
        ?.replaceWith(badgeTemplate(cdn.url('tags/bot.png'), formatMessage({defaultMessage: 'Bot'})));
    }

    let badgesContainer = element.querySelector('.chat-badge')?.closest('span');
    if (badgesContainer == null) {
      badgesContainer = element.querySelector('span.chat-line__username').previousSibling;
      if (badgesContainer.nodeName !== 'SPAN') {
        badgesContainer = null;
      }
    }

    const customBadges = this.customBadges(user);
    if (badgesContainer != null && customBadges.length > 0) {
      for (const badge of customBadges) {
        badgesContainer.appendChild(badge);
      }
    }

    const nickname = nicknames.get(user.name);
    if (nickname) {
      from.innerText = nickname;
    }

    if (
      (modsOnly === true && !user.mod) ||
      (subsOnly === true && !user.subscriber) ||
      (asciiOnly === true &&
        (hasNonASCII(messageObj.messageBody) || messageObj.messageParts?.some((part) => part.type === 6)))
    ) {
      element.style.display = 'none';
    }

    this.messageReplacer(getMessagePartsFromMessageElement(element), user);

    element.__bttvParsed = true;
  }

  noticeMessageParser(element) {
    const chatterNames = [...element.querySelectorAll('.chatter-name span span, .chatter-name span')];
    for (const chatterName of chatterNames) {
      // skip non-text elements
      if (chatterName.childElementCount > 0) {
        continue;
      }
      // TODO: this doesn't handle apac names or display names with spaces. prob ok for now.
      const nickname = nicknames.get(chatterName.innerText.toLowerCase());
      if (nickname) {
        chatterName.innerText = nickname;
      }
    }
  }

  pinnedMessageParser(element) {
    this.messageReplacer(getMessagePartsFromMessageElement(element), null);
  }
}

export default new ChatModule();
