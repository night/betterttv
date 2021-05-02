import _settings from '../../../settings.js';
import storage from '../../../storage.js';
import {defaultHighlightKeywords, computeKeywords} from '../../../utils/keywords.js';

const listeners = [];

function radioBake({id, category, name, description, settings}) {
  if (!listeners.includes(id)) {
    listeners.push(id);
    _settings.on(`changed.${id}`, (value) => {
      for (const [index, setting] of settings.entries()) {
        if (setting.id === 'default') continue;
        _settings.set(setting.id, index === value);
      }
    });
  }

  const _defaultValue = settings
    .map((setting, index) => {
      return _settings.get(setting.id) || setting.id === 'default' ? index : false;
    })
    .filter((setting) => setting !== false);

  return {
    type: 5,
    id,
    name,
    category,
    description,
    options: {
      choices: settings.map((setting) => setting.name),
    },
    _defaultValue: _defaultValue[_defaultValue.length - 1],
  };
}

function checkboxBake({id, category, name, description, settings}) {
  if (!listeners.includes(id)) {
    listeners.push(id);
    _settings.on(`changed.${id}`, (values, prev) => {
      if (!values || !prev) return;
      for (const [index, setting] of settings.entries()) {
        if (prev.find((i) => i === index) === values.find((i) => i === index)) continue;
        const enabled = values.includes(index);
        const invert = setting.invert === true ? !enabled : enabled;
        _settings.set(setting.id, invert);
      }
    });
  }

  const _defaultValue = settings
    .map((setting, index) => {
      const enabled = _settings.get(setting.id);
      if (setting.invert) return enabled ? false : index;
      return enabled ? index : false;
    })
    .filter((index) => index !== false);

  return {
    type: 2,
    id,
    name,
    category,
    description,
    options: {
      choices: settings.map((setting) => setting.name),
    },
    _defaultValue,
  };
}

function keywordTableBake({id, name, category, description, options}) {
  let keywords = storage.get(id);
  if (id === 'highlightKeywords') defaultHighlightKeywords(keywords);
  if (typeof keywords !== 'string') keywords = '';

  if (!listeners.includes(id)) {
    listeners.push(id);
    _settings.on(`changed._${id}`, (values) => {
      storage.set(id, encrypt(values.filter((value) => value.status !== 'EDIT')));
    });
  }

  const encrypt = (values) => {
    return values
      .map(({keyword, type}) => {
        switch (type) {
          case 0:
            return `{${keyword}}`;
          case 1:
            return `{${keyword}*}`;
          case 2:
            return `{<${keyword}>}`;
          case 3:
            return `(${keyword})`;
        }
      })
      .join(' ');
  };

  const decrypt = (value) => {
    const {computedKeywords, computedUsers} = computeKeywords(value);
    let index = 0;

    const keywordString = computedKeywords
      .map((keyword) => {
        switch (true) {
          case keyword.length === 0:
            return false;
          case /\*/g.test(keyword):
            return {
              id: index++,
              type: 1,
              keyword: keyword.replace('*', ''),
            };
          case /^<(.*)>$/g.test(keyword):
            return {
              id: index++,
              type: 2,
              keyword: keyword.replace(/(<|>)/g, ''),
            };
          default:
            return {
              id: index++,
              keyword,
              type: 0,
            };
        }
      })
      .filter((string) => string !== false);

    const usersString = computedUsers.map((user) => {
      return {
        id: index++,
        keyword: user,
        type: 3,
      };
    });

    const data = keywordString.concat(usersString);
    _settings.set(`_${id}`, data);
    return data;
  };

  return {
    type: 3,
    id: `_${id}`,
    name,
    category,
    description,
    options,
    _defaultValue: decrypt(keywords),
  };
}

export default function (settings) {
  const visited = [];
  const newSettings = settings
    .map((setting) => {
      switch (setting.id) {
        case 'bttvEmotes':
        case 'bttvGIFEmotes':
        case 'ffzEmotes':
          if (visited.includes('emotes')) return false;
          visited.push('emotes');
          return checkboxBake({
            id: 'emotes',
            category: 'chat',
            name: 'Emotes',
            description: 'Add more emotes to chat.',
            settings: [
              {id: 'bttvEmotes', name: 'BetterTTV Emotes', invert: false},
              {id: 'bttvGIFEmotes', name: 'BetterTTV Animated Emotes', invert: false},
              {id: 'ffzEmotes', name: 'FrankerFaceZ Emotes', invert: false},
            ],
          });
        case 'hideRecommendedFriends':
        case 'hideOfflineFollowedChannels':
        case 'hideFriends':
        case 'autoExpandChannels':
        case 'hideFeaturedChannels':
          if (visited.includes('sidebar')) return false;
          visited.push('sidebar');
          return checkboxBake({
            id: 'sidebar',
            category: 'directory',
            name: 'Sidebar',
            description: 'Edit/modify the left sidebar.',
            settings: [
              {id: 'hideRecommendedFriends', name: 'Recommended Friends', invert: true},
              {id: 'hideFeaturedChannels', name: 'Recommended Channels', invert: true},
              {id: 'hideOfflineFollowedChannels', name: 'Offline Followed Channels', invert: true},
              {id: 'hideFriends', name: 'Friends List', invert: true},
              {id: 'autoExpandChannels', name: 'Auto-expand Channels', invert: false},
            ],
          });
        case 'hideBits':
        case 'hideSubscriptionNotices':
        case 'hideCommunityHighlights':
        case 'hideChatClips':
        case 'hideNewViewerGreeting':
        case 'hideChatReplies':
          if (visited.includes('chat')) return false;
          visited.push('chat');
          return checkboxBake({
            id: 'chat',
            category: 'chat',
            name: 'Chat',
            description: 'Edit/modify chat features.',
            settings: [
              {id: 'hideBits', name: 'Bits', invert: true},
              {id: 'hideSubscriptionNotices', name: 'Subscriptions', invert: true},
              {id: 'hideCommunityHighlights', name: 'Community Highlights', invert: true},
              {id: 'hideChatClips', name: 'Chat Clips', invert: true},
              {id: 'hideNewViewerGreeting', name: 'Greetings', invert: true},
              {id: 'hideChatReplies', name: 'Chat Reply Button', invert: true},
            ],
          });
        case 'disableLocalizedNames':
        case 'disableUsernameColors':
        case 'readableUsernameColors':
          if (visited.includes('usernames')) return false;
          visited.push('usernames');
          return checkboxBake({
            id: 'usernames',
            category: 'chat',
            name: 'Usernames',
            description: 'Edit/modify chat usernames.',
            settings: [
              {id: 'disableLocalizedNames', name: 'Localized Names', invert: true},
              {id: 'disableUsernameColors', name: 'Username Colors', invert: true},
              {id: 'readableUsernameColors', name: 'Readable Usernames', invert: false},
            ],
          });
        case 'autoClaimBonusChannelPoints':
        case 'hideChannelPoints':
        case 'disableChannelPointsMessageHighlights':
          if (visited.includes('channelPoints')) return false;
          visited.push('channelPoints');
          return checkboxBake({
            id: 'channelPoints',
            category: 'chat',
            name: 'Channel Points',
            description: 'Edit/modify channel point features.',
            settings: [
              {id: 'hideChannelPoints', name: 'Channel Points', invert: true},
              {id: 'autoClaimBonusChannelPoints', name: 'Auto-claim Channel Points', invert: false},
              {id: 'disableChannelPointsMessageHighlights', name: 'Highlighted Channel Point Messages', invert: true},
            ],
          });
        case 'disableFPVideo':
        case 'disableHostMode':
        case 'disableVodRecommendationAutoplay':
          if (visited.includes('autoplay')) return false;
          visited.push('autoplay');
          return checkboxBake({
            id: 'autoplay',
            category: 'directory',
            name: 'Autoplay',
            description: 'Disable players from autoplaying.',
            settings: [
              {id: 'disableFPVideo', name: 'Front-page', invert: true},
              {id: 'disableHostMode', name: 'Host-mode', invert: true},
              {id: 'disableVodRecommendationAutoplay', name: 'VOD Recommendations', invert: true},
            ],
          });
        case 'hideDeletedMessages':
        case 'showDeletedMessages':
          if (visited.includes('deletedMessages')) return false;
          visited.push('deletedMessages');
          return radioBake({
            id: 'deletedMessages',
            category: 'chat',
            name: 'Deleted Messages',
            description: 'How should deleted messages be handled.',
            settings: [
              {id: 'default', name: 'Default'},
              {id: 'hideDeletedMessages', name: 'Hide Deleted Messages'},
              {id: 'showDeletedMessages', name: 'Show Original Message'},
            ],
          });
        case 'leftSideChat':
          if (visited.includes('chatPosition')) return false;
          visited.push('chatPosition');
          return radioBake({
            id: 'chatPosition',
            category: 'chat',
            name: 'Chat Position',
            description: 'Change the chat placement.',
            settings: [
              {id: 'default', name: 'Right'},
              {id: 'leftSideChat', name: 'Left'},
            ],
          });
        default:
          return setting;
      }
    })
    .filter((setting) => setting !== false);

  if (!visited.includes('blacklistKeywords')) {
    visited.push('blacklistKeywords');
    newSettings.push(
      keywordTableBake({
        id: 'blacklistKeywords',
        category: 'chat',
        name: 'Blacklist Keywords',
        description: 'Blacklist users or words from your chat.',
        options: {
          headers: [
            {
              name: 'keyword',
              type: 'string',
            },
            {
              name: 'type',
              type: 'dropdown',
              options: ['Message', 'Wildcard', 'Exact', 'Username'],
              defaultOption: 0,
            },
          ],
        },
      })
    );
  }

  if (!visited.includes('highlightKeywords')) {
    visited.push('highlightKeywords');
    newSettings.push(
      keywordTableBake({
        id: 'highlightKeywords',
        category: 'chat',
        name: 'Highlight Keywords',
        description: 'Highlight words in your chat.',
        options: {
          headers: [
            {
              name: 'keyword',
              type: 'string',
            },
            {
              name: 'type',
              type: 'dropdown',
              options: ['Message', 'Wildcard', 'Exact', 'Username'],
              defaultOption: 0,
            },
          ],
        },
      })
    );
  }
  return newSettings;
}
