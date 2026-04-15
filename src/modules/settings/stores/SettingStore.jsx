import React from 'react';
import {isStandaloneWindow} from '../../../utils/window';

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
};

class SettingStore {
  constructor() {
    this.settings = {};
  }

  registerSetting(Component, {name, settingPanelId, keywords, supportsStandaloneWindow = false}) {
    if (name == null || typeof name !== 'string') {
      throw new Error('Name is required');
    }

    if (!Object.values(SettingPanelIds).includes(settingPanelId)) {
      throw new Error('Setting panel ID is invalid');
    }

    if (
      keywords == null ||
      keywords.length === 0 ||
      !Array.isArray(keywords) ||
      !keywords.every((keyword) => typeof keyword === 'string')
    ) {
      throw new Error('Keywords is invalid');
    }

    this.settings[settingPanelId] = {
      name,
      settingPanelId,
      keywords,
      supportsStandaloneWindow,
      render: ({...props}) => <Component {...props} key={settingPanelId} />,
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
