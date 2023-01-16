import $ from 'jquery';
import {DateTime} from 'luxon';
import gql from 'graphql-tag';
import nicknames from '../chat_nicknames/index.js';
import twitch from '../../utils/twitch.js';
import html from '../../utils/html.js';
import keyCodes from '../../utils/keycodes.js';
import {getCurrentUser} from '../../utils/user.js';
import {getCurrentChannel} from '../../utils/channel.js';
import formatMessage from '../../i18n/index.js';

const Commands = {
  BAN: '/ban',
  UNBAN: '/unban',
  MOD: '/mod',
  UNMOD: '/unmod',
  TIMEOUT: '/timeout',
  PERMIT: '!permit',
  IGNORE: '/block',
  WHISPER: '/w',
};

const Icons = {
  EYE: '<svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" fill="white"><path clip-rule="evenodd" d="M11,13H5L1,9V8V7l4-4h6l4,4v1v1L11,13z M8,5C6.344,5,5,6.343,5,8c0,1.656,1.344,3,3,3c1.657,0,3-1.344,3-3C11,6.343,9.657,5,8,5z M8,9C7.447,9,7,8.552,7,8s0.447-1,1-1s1,0.448,1,1S8.553,9,8,9z" fill-rule="evenodd"></path></svg>',
  HEART:
    '<svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" fill="white"><path clip-rule="evenodd" d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z" fill-rule="evenodd"></path></svg></figure>',
  PENCIL:
    '<svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px" fill="white"><path clip-rule="evenodd" d="M6.414,12.414L3.586,9.586l8-8l2.828,2.828L6.414,12.414z M4.829,14H2l0,0v-2.828l0.586-0.586l2.828,2.828L4.829,14z" fill-rule="evenodd"></path></svg></figure>',
  BIRTHDAY_CAKE:
    '<svg width="16px" height="16px" viewBox="0 0 1792 1792" fill="white"><path d="M1792 1408v384h-1792v-384q45 0 85-14t59-27.5 47-37.5q30-27 51.5-38t56.5-11q24 0 44 7t31 15 33 27q29 25 47 38t58 27 86 14q45 0 85-14.5t58-27 48-37.5q21-19 32.5-27t31-15 43.5-7q35 0 56.5 11t51.5 38q28 24 47 37.5t59 27.5 85 14 85-14 59-27.5 47-37.5q30-27 51.5-38t56.5-11q34 0 55.5 11t51.5 38q28 24 47 37.5t59 27.5 85 14zm0-320v192q-24 0-44-7t-31-15-33-27q-29-25-47-38t-58-27-85-14q-46 0-86 14t-58 27-47 38q-22 19-33 27t-31 15-44 7q-35 0-56.5-11t-51.5-38q-29-25-47-38t-58-27-86-14q-45 0-85 14.5t-58 27-48 37.5q-21 19-32.5 27t-31 15-43.5 7q-35 0-56.5-11t-51.5-38q-28-24-47-37.5t-59-27.5-85-14q-46 0-86 14t-58 27-47 38q-30 27-51.5 38t-56.5 11v-192q0-80 56-136t136-56h64v-448h256v448h256v-448h256v448h256v-448h256v448h64q80 0 136 56t56 136zm-1280-864q0 77-36 118.5t-92 41.5q-53 0-90.5-37.5t-37.5-90.5q0-29 9.5-51t23.5-34 31-28 31-31.5 23.5-44.5 9.5-67q38 0 83 74t45 150zm512 0q0 77-36 118.5t-92 41.5q-53 0-90.5-37.5t-37.5-90.5q0-29 9.5-51t23.5-34 31-28 31-31.5 23.5-44.5 9.5-67q38 0 83 74t45 150zm512 0q0 77-36 118.5t-92 41.5q-53 0-90.5-37.5t-37.5-90.5q0-29 9.5-51t23.5-34 31-28 31-31.5 23.5-44.5 9.5-67q38 0 83 74t45 150z" /></svg></figure>',
  GIFT: '<svg width="16px" height="16px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><path fill-rule="evenodd" d="M16 6h2v6h-1v6H3v-6H2V6h2V4.793c0-2.507 3.03-3.762 4.803-1.99.131.131.249.275.352.429L10 4.5l.845-1.268a2.81 2.81 0 01.352-.429C12.969 1.031 16 2.286 16 4.793V6zM6 4.793V6h2.596L7.49 4.341A.814.814 0 006 4.793zm8 0V6h-2.596l1.106-1.659a.814.814 0 011.49.451zM16 8v2h-5V8h5zm-1 8v-4h-4v4h4zM9 8v2H4V8h5zm0 4H5v4h4v-4z" clip-rule="evenodd" fill="white"></path></svg>',
};

const MODERATOR_CARD_DISPLAY_NAME_SELECTOR = '.viewer-card-header__display-name h4';
const MODERATOR_CARD_OVERLAY_SELECTOR = '.viewer-card-header__overlay';
const MODERATOR_CARD_ACTIONS_SELECTOR =
  'button svg path[d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8 6a6 6 0 01-4.904-9.458l8.362 8.362A5.972 5.972 0 0110 16zm4.878-2.505a6 6 0 00-8.372-8.372l8.372 8.372z"]';

const moderatorActionButtonTemplate = (command, duration, tooltipText, buttonText) => `
  <div class="bttv-tooltip-wrapper">
    <div class="bttv-moderator-card-action" data-command="${html.escape(command)}" data-duration="${
  html.escape(duration) || ''
}">
      <button class="actionText">${html.escape(buttonText)}</button>
    </div>
    <div class="bttv-tooltip bttv-tooltip--up bttv-tooltip--align-center">${html.escape(tooltipText)}</div>
  </div>
`;

const MODERATOR_ACTIONS_TEMPLATE = `
  <span class="bttv-moderator-card-actions">
    ${moderatorActionButtonTemplate(Commands.PERMIT, null, '!permit User', '!permit')}
    ${moderatorActionButtonTemplate(Commands.TIMEOUT, 1, 'Purge', '1s')}
    ${moderatorActionButtonTemplate(Commands.TIMEOUT, 600, 'Timeout 10m', '10m')}
    ${moderatorActionButtonTemplate(Commands.TIMEOUT, 3600, 'Timeout 1hr', '1h')}
    ${moderatorActionButtonTemplate(Commands.TIMEOUT, 8 * 3600, 'Timeout 8hr', '8h')}
    ${moderatorActionButtonTemplate(Commands.TIMEOUT, 24 * 3600, 'Timeout 24hr', '24h')}
  </span>
`;

const userStatsItemTemplate = (icon, iconTitle, value, valueTitle) => `
  <div class="userStat">
    <div class="statIcon" title="${html.escape(iconTitle)}">${icon}</div>
    <div${valueTitle != null ? ` title="${html.escape(valueTitle)}"` : ''}>${html.escape(value)}</div>
  </div>
`;

const userStatsTemplate = (follows, createdAt, giftedBy, giftedAt) => `
  <div class="bttv-moderator-card-user-stats">
    ${userStatsItemTemplate(Icons.HEART, formatMessage({defaultMessage: 'Followers'}), follows.toLocaleString())}
    ${userStatsItemTemplate(
      Icons.BIRTHDAY_CAKE,
      formatMessage({defaultMessage: 'Account Creation Date'}),
      DateTime.fromJSDate(new Date(createdAt)).toFormat('LLL dd, yyyy')
    )}
    ${
      giftedAt != null
        ? userStatsItemTemplate(
            Icons.GIFT,
            formatMessage({defaultMessage: 'Subscription Gifted By'}),
            giftedBy,
            DateTime.fromJSDate(new Date(giftedAt)).toFormat('LLL dd, yyyy')
          )
        : ''
    }
  </div>
`;

const userMessagesTemplate = (messagesHTML) => `
  <div class="bttv-moderator-card-messages">
    <div class="label">
      <span>${formatMessage({defaultMessage: 'Chat Messages'})}</span>
      <div class="triangle"></div>
    </div>
    <div class="message-list">
      ${messagesHTML.join('\n')}
    </div>
  </div>
`;

const NICKNAME_CHANGE_BUTTON_TEMPLATE = `
  <button class="bttv-moderator-card-nickname-change-button">
    <span class="buttonIcon">${Icons.PENCIL}</span>
  </button>
`;

class ModeratorCard {
  constructor(element, user, messages, onClose) {
    this.$element = $(element);
    this.user = user;
    this.messages = messages;
    this.onClose = onClose;
  }

  close() {
    $('button[data-test-selector="close-viewer-card-button"]').click();
    this.cleanup();
    this.onClose();
  }

  cleanup() {
    $('.bttv-moderator-card-nickname-change-button').remove();
    $('.bttv-moderator-card-user-stats').remove();
    $('.bttv-moderator-card-actions').remove();
    $('.bttv-moderator-card-messages').remove();
  }

  render() {
    this.renderNicknameChangeButton();
    this.renderUserStats();
    this.renderModeratorActions();
    this.renderUserMessages();
  }

  renderNicknameChangeButton() {
    const $displayName = this.$element.find(MODERATOR_CARD_DISPLAY_NAME_SELECTOR);
    if ($displayName.find('.bttv-moderator-card-nickname-change-button').length) return;

    const $nicknameChangeButton = $(NICKNAME_CHANGE_BUTTON_TEMPLATE);
    $nicknameChangeButton.appendTo($displayName);
    $nicknameChangeButton.on('click', () => nicknames.set(this.user.name));
  }

  renderUserStats() {
    const $overlay = this.$element.find(MODERATOR_CARD_OVERLAY_SELECTOR);
    if ($overlay.find('.bttv-moderator-card-user-stats').length) return;

    const query = gql`
      query BTTVGetChannel($userId: ID!, $channelId: ID!) {
        user(id: $userId) {
          id
          createdAt
          followers(first: 1) {
            totalCount
          }
          relationship(targetUserID: $channelId) {
            subscriptionBenefit {
              gift {
                giftDate
                gifter {
                  id
                  displayName
                }
              }
            }
          }
        }
      }
    `;

    twitch
      .graphqlQuery(query, {userId: this.user.id, channelId: getCurrentChannel().id})
      .then(
        ({
          data: {
            user: {followers, createdAt, relationship},
          },
        }) => {
          const giftedSubscriptionBenefit = relationship.subscriptionBenefit?.gift;
          const giftedBy = giftedSubscriptionBenefit?.gifter?.displayName || 'Anonymous';
          const giftedAt = giftedSubscriptionBenefit?.giftDate;
          return userStatsTemplate(followers.totalCount, createdAt, giftedBy, giftedAt);
        }
      )
      .then((statsHTML) => $(statsHTML).appendTo($overlay));
  }

  renderModeratorActions() {
    const $moderatorActions = this.$element.find(MODERATOR_CARD_ACTIONS_SELECTOR).closest('.viewer-card-drag-cancel');
    if ($moderatorActions.find('.bttv-moderator-card-actions').length) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const currentUserIsOwner = twitch.getCurrentUserIsOwner();
    const currentUserIsModerator = twitch.getCurrentUserIsModerator();

    const isCurrentUser = currentUser.name === this.user.name;
    const isModerator = this.user.isOwner || this.user.isModerator;

    const currentUserCanModerate = !isCurrentUser && (currentUserIsOwner || (currentUserIsModerator && !isModerator));
    if (!currentUserCanModerate) return;

    const $modCards = $(MODERATOR_ACTIONS_TEMPLATE);
    $modCards.appendTo($moderatorActions);
    $modCards.find('.bttv-moderator-card-action').on('click', ({currentTarget, shiftKey}) => {
      const $element = $(currentTarget);
      const command = $element.data('command');
      const duration = $element.data('duration');
      const commandText = `${command} ${this.user.name}${duration ? ` ${duration}` : ''}`;
      if (shiftKey) {
        twitch.setChatInputValue(`${commandText} `);
      } else {
        twitch.sendChatMessage(commandText);
      }
    });
  }

  renderUserMessages() {
    if (this.$element.find('.bttv-moderator-card-messages').length) return;

    // twitch has a built-in tool now for mods, so prefer that one.
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const currentUserIsOwner = twitch.getCurrentUserIsOwner();
    const currentUserIsModerator = twitch.getCurrentUserIsModerator();
    const isCurrentUser = currentUser.name === this.user.name;
    const isModerator = this.user.isOwner || this.user.isModerator;
    const currentUserCanModerate = !isCurrentUser && (currentUserIsOwner || (currentUserIsModerator && !isModerator));
    if (currentUserCanModerate) return;

    const $moderatorActions = this.$element.closest('div.viewer-card');
    const $messages = $(userMessagesTemplate(this.messages.map(({outerHTML}) => outerHTML)));
    $moderatorActions.after($messages);

    $messages.find('.label').on('click', () => {
      $messages.find('.triangle').toggleClass('open');
      $messages.find('.message-list').toggle();
    });
  }

  onKeyDown(e) {
    if (e.ctrlKey || e.metaKey) return false;
    if ($('input, textarea, select, div[data-a-target="chat-input"]').is(':focus')) return false;

    const keyCode = e.key;
    if (keyCode === keyCodes.Escape) {
      return this.close();
    }

    if (twitch.getCurrentUserIsModerator()) {
      let command;
      let duration;
      switch (keyCode.toLowerCase()) {
        case keyCodes.T:
          command = Commands.TIMEOUT;
          break;
        case keyCodes.P:
          command = Commands.TIMEOUT;
          duration = 1;
          break;
        case keyCodes.A:
          command = Commands.PERMIT;
          break;
        case keyCodes.U:
          command = Commands.UNBAN;
          break;
        case keyCodes.B:
          command = Commands.BAN;
          break;
        default:
          break;
      }
      if (command) {
        const commandText = `${command} ${this.user.name}${duration ? ` ${duration}` : ''}`;
        if (e.shiftKey) {
          e.preventDefault();
          twitch.setChatInputValue(`${commandText} `);
        } else {
          twitch.sendChatMessage(commandText);
        }
        this.close();
        return false;
      }
    }

    if (e.shiftKey) {
      return false;
    }

    if (keyCode === keyCodes.I) {
      twitch.sendChatMessage(`${Commands.IGNORE} ${this.user.name}`);
      this.close();
    } else if (keyCode === keyCodes.W) {
      e.preventDefault();
      twitch.setChatInputValue(`${Commands.WHISPER} ${this.user.name} `);
      this.close();
    }
    return true;
  }
}

export default ModeratorCard;
