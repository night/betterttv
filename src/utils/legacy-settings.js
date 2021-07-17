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
import {deserializeKeywords, serializeKeywords} from './keywords.js';

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

export function updateLegacySetting(settingId, value) {
  switch (settingId) {
    case SettingIds.CHAT_REPLIES:
      return storage.set(LegacySettingIds.HIDE_CHAT_REPLIES, !value);
    case SettingIds.WHISPERS:
      return storage.set(LegacySettingIds.DISABLE_WHISPERS, !value);
    case SettingIds.CHANNEL_POINTS_MESSAGE_HIGHLIGHTS:
      return storage.set(LegacySettingIds.DISABLE_CHANNEL_POINTS_MESSAGE_HIGHLIGHTS, !value);
    case SettingIds.FP_VIDEO:
      return storage.set(LegacySettingIds.DISABLE_FP_VIDEO, !value);
    case SettingIds.HOST_MODE:
      return storage.set(LegacySettingIds.DISABLE_HOST_MODE, !value);
    case SettingIds.LOCALIZED_NAMES:
      return storage.set(LegacySettingIds.DISABLE_LOCALIZED_NAMES, !value);
    case SettingIds.USERNAME_COLORS:
      return storage.set(LegacySettingIds.DISABLE_USERNAME_COLORS, !value);
    case SettingIds.BITS:
      return storage.set(LegacySettingIds.HIDE_BITS, !value);
    case SettingIds.CHAT_CLIPS:
      return storage.set(LegacySettingIds.HIDE_CHAT_CLIPS, !value);
    case SettingIds.NEW_VIEWER_GREETING:
      return storage.set(LegacySettingIds.HIDE_NEW_VIEWER_GREETING, !value);
    case SettingIds.SUBSCRIPTION_NOTICES:
      return storage.set(LegacySettingIds.HIDE_SUBSCRIPTION_NOTICES, !value);
    case SettingIds.COMMUNITY_HIGHLIGHTS:
      return storage.set(LegacySettingIds.HIDE_COMMUNITY_HIGHLIGHTS, !value);
    case SettingIds.PRIME_PROMOTIONS:
      return storage.set(LegacySettingIds.HIDE_PRIME_PROMOTIONS, !value);
    case SettingIds.PLAYER_EXTENSIONS:
      return storage.set(LegacySettingIds.HIDE_PLAYER_EXTENSIONS, !value);
    case SettingIds.VOD_RECOMMENDATION_AUTOPLAY:
      return storage.set(LegacySettingIds.DISABLE_VOD_RECOMMENDATION_AUTOPLAY, !value);
    case SettingIds.BLACKLIST_KEYWORDS:
      return storage.set(LegacySettingIds.BLACKLIST_KEYWORDS, deserializeKeywords(value));
    case SettingIds.HIGHLIGHT_KEYWORDS:
      return storage.set(LegacySettingIds.HIGHLIGHT_KEYWORDS, deserializeKeywords(value));
    case SettingIds.CHAT_LAYOUT:
      return storage.set(LegacySettingIds.LEFT_SIDE_CHAT, value === ChatLayoutTypes.LEFT);
    case SettingIds.DELETED_MESSAGES:
      storage.set(LegacySettingIds.HIDE_DELETED_MESSAGES, value === DeletedMessageTypes.HIDE);
      storage.set(LegacySettingIds.SHOW_DELETED_MESSAGES, value === DeletedMessageTypes.SHOW);
      return null;
    case SettingIds.SIDEBAR:
      storage.set(LegacySettingIds.HIDE_FRIENDS, !hasFlag(value, SidebarFlags.FRIENDS));
      storage.set(LegacySettingIds.HIDE_FEATURED_CHANNELS, !hasFlag(value, SidebarFlags.FEATURED_CHANNELS));
      storage.set(LegacySettingIds.HIDE_RECOMMENDED_FRIENDS, !hasFlag(value, SidebarFlags.RECOMMENDED_FRIENDS));
      storage.set(
        LegacySettingIds.HIDE_OFFLINE_FOLLOWED_CHANNELS,
        !hasFlag(value, SidebarFlags.OFFLINE_FOLLOWED_CHANNELS)
      );
      storage.set(LegacySettingIds.AUTO_EXPAND_CHANNELS, hasFlag(value, SidebarFlags.AUTO_EXPAND_CHANNELS));
      return null;
    case SettingIds.EMOTES:
      storage.set(LegacySettingIds.BTTV_EMOTES, hasFlag(value, EmoteTypeFlags.BTTV_EMOTES));
      storage.set(LegacySettingIds.BTTV_GIF_EMOTES, hasFlag(value, EmoteTypeFlags.BTTV_GIF_EMOTES));
      storage.set(LegacySettingIds.FFZ_EMOTES, hasFlag(value, EmoteTypeFlags.FFZ_EMOTES) === EmoteTypeFlags.FFZ_EMOTES);
      return null;
    case SettingIds.CHAT:
      storage.set(LegacySettingIds.HIDE_BITS, !hasFlag(value, ChatFlags.BITS));
      storage.set(LegacySettingIds.HIDE_CHAT_CLIPS, !hasFlag(value, ChatFlags.CHAT_CLIPS));
      storage.set(LegacySettingIds.HIDE_CHAT_REPLIES, !hasFlag(value, ChatFlags.CHAT_REPLIES));
      storage.set(LegacySettingIds.HIDE_COMMUNITY_HIGHLIGHTS, !hasFlag(value, ChatFlags.COMMUNITY_HIGHLIGHTS));
      storage.set(LegacySettingIds.HIDE_SUBSCRIPTION_NOTICES, !hasFlag(value, ChatFlags.SUB_NOTICE));
      storage.set(LegacySettingIds.HIDE_NEW_VIEWER_GREETING, !hasFlag(value, ChatFlags.VIEWER_GREETING));
      return null;
    case SettingIds.CHANNEL_POINTS:
      storage.set(LegacySettingIds.HIDE_CHANNEL_POINTS, !hasFlag(value, ChannelPointsFlags.CHANNEL_POINTS));
      storage.set(LegacySettingIds.AUTO_CLAIM_BONUS_CHANNEL_POINTS, hasFlag(value, ChannelPointsFlags.AUTO_CLAIM));
      storage.set(
        LegacySettingIds.DISABLE_CHANNEL_POINTS_MESSAGE_HIGHLIGHTS,
        hasFlag(value, ChannelPointsFlags.MESSAGE_HIGHLIGHTS)
      );
      return null;
    case SettingIds.AUTO_PLAY:
      storage.set(LegacySettingIds.DISABLE_FP_VIDEO, !hasFlag(value, AutoPlayFlags.FP_VIDEO));
      storage.set(LegacySettingIds.DISABLE_HOST_MODE, !hasFlag(value, AutoPlayFlags.HOST_MODE));
      storage.set(
        LegacySettingIds.DISABLE_VOD_RECOMMENDATION_AUTOPLAY,
        !hasFlag(value, AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY)
      );
      return null;
    case SettingIds.USERNAMES:
      storage.set(LegacySettingIds.READABLE_USERNAME_COLORS, !hasFlag(value, UsernameFlags.COLORS));
      storage.set(LegacySettingIds.DISABLE_LOCALIZED_NAMES, !hasFlag(value, UsernameFlags.LOCALIZED));
      storage.set(LegacySettingIds.READABLE_USERNAME_COLORS, hasFlag(value, UsernameFlags.READABLE));
      return null;
    default:
      return storage.set(settingId, value);
  }
}
