import React from 'react';
import {PageTypes} from '@/constants';
import {isStandaloneWindow} from '@/utils/window';

export const SettingPanelIds = {
  EMOTES: 'emotes',
  THEME: 'theme',
  EMOTE_MENU: 'emoteMenu',
  EMOTE_AUTOCOMPLETE: 'emoteAutocomplete',
  AUTO_LIVE_CHAT_VIEW: 'autoLiveChatView',
  YOUTUBE: 'youtube',
  WHISPERS: 'whispers',
  TAB_COMPLETION: 'tabCompletion',
  SPLIT_CHAT: 'splitChat',
  USERNAMES: 'usernames',
  CHAT: 'chat',
  SIDEBAR: 'sidebar',
  CHANNEL_POINTS: 'channelPoints',
  RAIDS: 'raids',
  PRIME_GAMING: 'primeGaming',
  DIRECTORY: 'directory',
  PLAYER: 'player',
  MODERATION: 'moderation',
  HIGHLIGHTS: 'highlights',
  DELETED_MESSAGES: 'deletedMessages',
  CHAT_LAYOUT: 'chatLayout',
  BLACKLIST_KEYWORDS: 'blacklistKeywords',
  CHAT_DIRECTION: 'chatDirection',
  ANON_CHAT: 'anonChat',
  AUTO_PLAY: 'autoPlay',
  AUTO_CLAIM: 'autoClaim',
  CHATBOTS: 'chatbots',
  SELF_BOT: 'selfBot',
  SUBSCRIPTION_BADGE: 'subscriptionBadge',
  USERNAME_EFFECT: 'usernameEffect',
};

export const SettingCategoryIds = {
  APPEARANCE: 'appearance',
  EMOTES: 'emotes',
  BOTS: 'bots',
  CHAT: 'chat',
  MODERATION: 'moderation',
  CHANNEL: 'channel',
  INTERFACE: 'interface',
  OTHER: 'other',
};

// Descendant pages belong to a setting panel; while one is open its panel's nav entry stays active.
export const PageSettingPanelIds = {
  [PageTypes.HIGHLIGHT_KEYWORDS]: SettingPanelIds.HIGHLIGHTS,
  [PageTypes.BLACKLIST_KEYWORDS]: SettingPanelIds.BLACKLIST_KEYWORDS,
  [PageTypes.SELF_BOT_COMMANDS]: SettingPanelIds.SELF_BOT,
};

class SettingStore {
  constructor() {
    this.settings = {};
  }

  registerSetting(Component, {name, settingPanelId, settingCategoryId, supportsStandaloneWindow = false}) {
    if (name == null || typeof name !== 'string') {
      throw new Error('Name is required');
    }

    if (!Object.values(SettingPanelIds).includes(settingPanelId)) {
      throw new Error('Setting panel ID is invalid');
    }

    if (settingCategoryId != null && !Object.values(SettingCategoryIds).includes(settingCategoryId)) {
      throw new Error('Setting category ID is invalid');
    }

    this.settings[settingPanelId] = {
      name,
      settingPanelId,
      // Panels registered without a category fall into the trailing "Other" group, so a newly
      // added setting is never hidden.
      settingCategoryId: settingCategoryId ?? SettingCategoryIds.OTHER,
      supportsStandaloneWindow,
      render: ({...props}) => React.createElement(Component, {key: settingPanelId, ...props}),
    };
  }

  getSupportedSettings() {
    const settings = Object.values(this.settings);

    if (isStandaloneWindow()) {
      return settings.filter((setting) => setting.supportsStandaloneWindow);
    }

    return settings;
  }
}

export default new SettingStore();
