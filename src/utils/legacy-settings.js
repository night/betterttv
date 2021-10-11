/* eslint-disable import/prefer-default-export */

import {
  AutoPlayFlags,
  ChannelPointsFlags,
  ChatFlags,
  ChatLayoutTypes,
  DefaultValues,
  DeletedMessageTypes,
  EmoteTypeFlags,
  LegacySettingIds,
  SettingIds,
  SidebarFlags,
  UsernameFlags,
} from '../constants.js';
import storage from '../storage.js';
import {hasFlag, setFlag} from './flags.js';
import {serializeKeywords} from './keywords.js';

export function deserializeLegacy(settingId) {
  let value = null;
  switch (settingId) {
    case SettingIds.CHAT_REPLIES:
      value = !storage.get(LegacySettingIds.HIDE_CHAT_REPLIES);
      break;
    case SettingIds.WHISPERS:
      value = !storage.get(LegacySettingIds.DISABLE_WHISPERS);
      break;
    case SettingIds.CHANNEL_POINTS_MESSAGE_HIGHLIGHTS:
      value = !storage.get(LegacySettingIds.DISABLE_CHANNEL_POINTS_MESSAGE_HIGHLIGHTS);
      break;
    case SettingIds.FP_VIDEO:
      value = !storage.get(LegacySettingIds.DISABLE_FP_VIDEO);
      break;
    case SettingIds.HOST_MODE:
      value = !storage.get(LegacySettingIds.DISABLE_HOST_MODE);
      break;
    case SettingIds.LOCALIZED_NAMES:
      value = !storage.get(LegacySettingIds.DISABLE_LOCALIZED_NAMES);
      break;
    case SettingIds.USERNAME_COLORS:
      value = !storage.get(LegacySettingIds.DISABLE_USERNAME_COLORS);
      break;
    case SettingIds.BITS:
      value = !storage.get(LegacySettingIds.HIDE_BITS);
      break;
    case SettingIds.CHAT_CLIPS:
      value = !storage.get(LegacySettingIds.HIDE_CHAT_CLIPS);
      break;
    case SettingIds.NEW_VIEWER_GREETING:
      value = !storage.get(LegacySettingIds.HIDE_NEW_VIEWER_GREETING);
      break;
    case SettingIds.SUBSCRIPTION_NOTICES:
      value = !storage.get(LegacySettingIds.HIDE_SUBSCRIPTION_NOTICES);
      break;
    case SettingIds.COMMUNITY_HIGHLIGHTS:
      value = !storage.get(LegacySettingIds.HIDE_COMMUNITY_HIGHLIGHTS);
      break;
    case SettingIds.PRIME_PROMOTIONS:
      value = !storage.get(LegacySettingIds.HIDE_PRIME_PROMOTIONS);
      break;
    case SettingIds.PLAYER_EXTENSIONS:
      value = !storage.get(LegacySettingIds.HIDE_PLAYER_EXTENSIONS);
      break;
    case SettingIds.VOD_RECOMMENDATION_AUTOPLAY:
      value = !storage.get(LegacySettingIds.DISABLE_VOD_RECOMMENDATION_AUTOPLAY);
      break;
    case SettingIds.SIDEBAR: {
      let friends = storage.get(LegacySettingIds.HIDE_FRIENDS);
      let featuredChannels = storage.get(LegacySettingIds.HIDE_FEATURED_CHANNELS);
      let recommendedFriends = storage.get(LegacySettingIds.HIDE_RECOMMENDED_FRIENDS);
      let offlineFollowedChannels = storage.get(LegacySettingIds.HIDE_OFFLINE_FOLLOWED_CHANNELS);
      let autoExpand = storage.get(LegacySettingIds.AUTO_EXPAND_CHANNELS);

      const defaultValue = DefaultValues[settingId];

      friends = friends == null ? hasFlag(defaultValue, SidebarFlags.FRIENDS) : !friends;

      featuredChannels =
        featuredChannels == null ? hasFlag(defaultValue, SidebarFlags.FEATURED_CHANNELS) : !featuredChannels;

      recommendedFriends =
        recommendedFriends == null ? hasFlag(defaultValue, SidebarFlags.RECOMMENDED_FRIENDS) : !recommendedFriends;

      offlineFollowedChannels =
        offlineFollowedChannels == null
          ? hasFlag(defaultValue, SidebarFlags.OFFLINE_FOLLOWED_CHANNELS)
          : !offlineFollowedChannels;

      autoExpand = autoExpand == null ? hasFlag(defaultValue, SidebarFlags.AUTO_EXPAND_CHANNELS) : autoExpand;

      let flags = 0;

      flags = setFlag(flags, SidebarFlags.FRIENDS, friends);
      flags = setFlag(flags, SidebarFlags.FEATURED_CHANNELS, featuredChannels);
      flags = setFlag(flags, SidebarFlags.RECOMMENDED_FRIENDS, recommendedFriends);
      flags = setFlag(flags, SidebarFlags.OFFLINE_FOLLOWED_CHANNELS, offlineFollowedChannels);
      flags = setFlag(flags, SidebarFlags.AUTO_EXPAND_CHANNELS, autoExpand);

      value = flags;
      break;
    }
    case SettingIds.EMOTES: {
      let bttvEmotes = storage.get(LegacySettingIds.BTTV_EMOTES);
      let bttvGif = storage.get(LegacySettingIds.BTTV_GIF_EMOTES);
      let ffzEmotes = storage.get(LegacySettingIds.FFZ_EMOTES);

      const defaultValue = DefaultValues[settingId];

      if (bttvEmotes == null) bttvEmotes = hasFlag(defaultValue, EmoteTypeFlags.BTTV_EMOTES);
      if (bttvGif == null) bttvGif = hasFlag(defaultValue, EmoteTypeFlags.BTTV_GIF_EMOTES);
      if (ffzEmotes == null) ffzEmotes = hasFlag(defaultValue, EmoteTypeFlags.FFZ_EMOTES);

      let flags = 0;

      flags = setFlag(flags, EmoteTypeFlags.BTTV_EMOTES, bttvEmotes);
      flags = setFlag(flags, EmoteTypeFlags.BTTV_GIF_EMOTES, bttvGif);
      flags = setFlag(flags, EmoteTypeFlags.FFZ_EMOTES, ffzEmotes);

      value = flags;
      break;
    }
    case SettingIds.CHAT: {
      let chatReplies = storage.get(LegacySettingIds.HIDE_CHAT_REPLIES);
      let bits = storage.get(LegacySettingIds.HIDE_BITS);
      let chatClips = storage.get(LegacySettingIds.HIDE_CHAT_CLIPS);
      let viewerGreeting = storage.get(LegacySettingIds.HIDE_NEW_VIEWER_GREETING);
      let subNotice = storage.get(LegacySettingIds.HIDE_SUBSCRIPTION_NOTICES);
      let communityHighlight = storage.get(LegacySettingIds.HIDE_COMMUNITY_HIGHLIGHTS);

      const defaultValue = DefaultValues[settingId];

      chatReplies = chatReplies == null ? hasFlag(defaultValue, ChatFlags.CHAT_REPLIES) : !chatReplies;
      bits = bits == null ? hasFlag(defaultValue, ChatFlags.BITS) : !bits;
      chatClips = chatClips == null ? hasFlag(defaultValue, ChatFlags.CHAT_CLIPS) : !chatClips;
      viewerGreeting = viewerGreeting == null ? hasFlag(defaultValue, ChatFlags.VIEWER_GREETING) : !viewerGreeting;
      subNotice = subNotice == null ? hasFlag(defaultValue, ChatFlags.SUB_NOTICE) : !subNotice;
      communityHighlight =
        communityHighlight == null ? hasFlag(defaultValue, ChatFlags.COMMUNITY_HIGHLIGHTS) : !communityHighlight;

      let flags = 0;

      flags = setFlag(flags, ChatFlags.CHAT_REPLIES, chatReplies);
      flags = setFlag(flags, ChatFlags.BITS, bits);
      flags = setFlag(flags, ChatFlags.CHAT_CLIPS, chatClips);
      flags = setFlag(flags, ChatFlags.VIEWER_GREETING, viewerGreeting);
      flags = setFlag(flags, ChatFlags.SUB_NOTICE, subNotice);
      flags = setFlag(flags, ChatFlags.COMMUNITY_HIGHLIGHTS, communityHighlight);

      value = flags;
      break;
    }
    case SettingIds.CHANNEL_POINTS: {
      let channelPoints = storage.get(LegacySettingIds.HIDE_CHANNEL_POINTS);
      let autoClaim = storage.get(LegacySettingIds.AUTO_CLAIM_BONUS_CHANNEL_POINTS);
      let messageHighlights = storage.get(LegacySettingIds.DISABLE_CHANNEL_POINTS_MESSAGE_HIGHLIGHTS);

      const defaultValue = DefaultValues[settingId];

      channelPoints = channelPoints == null ? hasFlag(defaultValue, ChannelPointsFlags.CHANNEL_POINTS) : !channelPoints;
      if (autoClaim == null) autoClaim = hasFlag(defaultValue, ChannelPointsFlags.AUTO_CLAIM);
      messageHighlights =
        messageHighlights == null ? hasFlag(defaultValue, ChannelPointsFlags.MESSAGE_HIGHLIGHTS) : !messageHighlights;

      let flags = 0;

      flags = setFlag(flags, ChannelPointsFlags.CHANNEL_POINTS, channelPoints);
      flags = setFlag(flags, ChannelPointsFlags.AUTO_CLAIM, autoClaim);
      flags = setFlag(flags, ChannelPointsFlags.MESSAGE_HIGHLIGHTS, messageHighlights);

      value = flags;
      break;
    }
    case SettingIds.AUTO_PLAY: {
      let fpVideo = storage.get(LegacySettingIds.DISABLE_FP_VIDEO);
      let hostMode = storage.get(LegacySettingIds.DISABLE_HOST_MODE);
      let vodAutoplay = storage.get(LegacySettingIds.DISABLE_VOD_RECOMMENDATION_AUTOPLAY);

      const defaultValue = DefaultValues[settingId];

      fpVideo = fpVideo == null ? hasFlag(defaultValue, AutoPlayFlags.FP_VIDEO) : !fpVideo;
      hostMode = hostMode == null ? hasFlag(defaultValue, AutoPlayFlags.HOST_MODE) : !hostMode;
      vodAutoplay =
        vodAutoplay == null ? hasFlag(defaultValue, AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY) : !vodAutoplay;

      let flags = 0;

      flags = setFlag(flags, AutoPlayFlags.FP_VIDEO, fpVideo);
      flags = setFlag(flags, AutoPlayFlags.HOST_MODE, hostMode);
      flags = setFlag(flags, AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY, vodAutoplay);

      value = flags;
      break;
    }
    case SettingIds.USERNAMES: {
      let usernameColors = storage.get(LegacySettingIds.DISABLE_USERNAME_COLORS);
      let localizedNames = storage.get(LegacySettingIds.DISABLE_LOCALIZED_NAMES);
      let readableColors = storage.get(LegacySettingIds.READABLE_USERNAME_COLORS);

      const defaultValue = DefaultValues[settingId];

      usernameColors = usernameColors == null ? hasFlag(defaultValue, UsernameFlags.COLORS) : !usernameColors;
      localizedNames = localizedNames == null ? hasFlag(defaultValue, UsernameFlags.LOCALIZED) : !localizedNames;
      if (readableColors == null) readableColors = hasFlag(defaultValue, UsernameFlags.READABLE);

      let flags = 0;

      flags = setFlag(flags, UsernameFlags.COLORS, usernameColors);
      flags = setFlag(flags, UsernameFlags.LOCALIZED, localizedNames);
      flags = setFlag(flags, UsernameFlags.READABLE, readableColors);

      value = flags;
      break;
    }
    case SettingIds.CHAT_LAYOUT: {
      const left = storage.get(LegacySettingIds.LEFT_SIDE_CHAT);
      value = (left == null) | (left === false) ? DefaultValues[settingId] : ChatLayoutTypes.LEFT;
      break;
    }
    case SettingIds.DELETED_MESSAGES: {
      const hide = storage.get(LegacySettingIds.HIDE_DELETED_MESSAGES);
      const show = storage.get(LegacySettingIds.SHOW_DELETED_MESSAGES);

      if (show === true) value = DeletedMessageTypes.SHOW;
      if (hide === true) value = DeletedMessageTypes.HIDE;
      if ([hide, show].every((v) => (v == null) | (v === false))) value = DefaultValues[settingId];
      break;
    }
    case SettingIds.BLACKLIST_KEYWORDS:
    case SettingIds.HIGHLIGHT_KEYWORDS: {
      const keywords = storage.get(settingId);
      value = keywords == null ? DefaultValues[settingId] : serializeKeywords(keywords);
      break;
    }
    default: {
      value = storage.get(settingId);
    }
  }

  return [settingId, value == null ? DefaultValues[settingId] : value];
}
