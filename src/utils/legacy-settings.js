/* eslint-disable import/prefer-default-export */

import {
  AutoPlayFlags,
  ChannelPointsFlags,
  ChatFlags,
  ChatLayoutTypes,
  SettingDefaultValues,
  DeletedMessageTypes,
  EmoteTypeFlags,
  SettingIds,
  SidebarFlags,
  UsernameFlags,
} from '../constants.js';
import {setFlag} from './flags.js';
import {serializeKeywords} from './keywords.js';

const LegacySettingIds = {
  ANON_CHAT: 'anonChat',
  AUTO_THEATRE_MODE: 'autoTheatreMode',
  AUTO_CLAIM_BONUS_CHANNEL_POINTS: 'autoClaimBonusChannelPoints',
  HIDE_CHANNEL_POINTS: 'hideChannelPoints',
  FFZ_EMOTES: 'ffzEmotes',
  BTTV_EMOTES: 'bttvEmotes',
  BTTV_GIF_EMOTES: 'bttvGIFEmotes',
  SPLIT_CHAT: 'splitChat',
  SHOW_DELETED_MESSAGES: 'showDeletedMessages',
  HIDE_DELETED_MESSAGES: 'hideDeletedMessages',
  REVERSE_CHAT_DIRECTION: 'reverseChatDirection',
  PINNED_HIGHLIGHTS: 'pinnedHighlights',
  TIMEOUT_HIGHLIGHTS: 'timeoutHighlights',
  HIGHLIGHT_FEEDBACK: 'highlightFeedback',
  LEFT_SIDE_CHAT: 'leftSideChat',
  HIDE_CHAT_REPLIES: 'hideChatReplies',
  TAB_COMPLETION_TOOLTIP: 'tabCompletionTooltip',
  TAB_COMPLETION_EMOTE_PRIORITY: 'tabCompletionEmotePriority',
  DISABLE_WHISPERS: 'disableWhispers',
  SHOW_DIRECTORY_LIVE_TAB: 'showDirectoryLiveTab',
  DISABLE_CHANNEL_POINTS_MESSAGE_HIGHLIGHTS: 'disableChannelPointsMessageHighlights',
  DISABLE_FP_VIDEO: 'disableFPVideo',
  DISABLE_HOST_MODE: 'disableHostMode',
  DISABLE_LOCALIZED_NAMES: 'disableLocalizedNames',
  DISABLE_USERNAME_COLORS: 'disableUsernameColors',
  READABLE_USERNAME_COLORS: 'readableUsernameColors',
  EMOTE_MENU: 'clickTwitchEmotes',
  DARKENED_MODE: 'darkenedMode',
  HIDE_BITS: 'hideBits',
  HIDE_CHAT_CLIPS: 'hideChatClips',
  HIDE_NEW_VIEWER_GREETING: 'hideNewViewerGreeting',
  HIDE_SUBSCRIPTION_NOTICES: 'hideSubscriptionNotices',
  HIDE_COMMUNITY_HIGHLIGHTS: 'hideCommunityHighlights',
  HIDE_PRIME_PROMOTIONS: 'hidePrimePromotions',
  HIDE_FEATURED_CHANNELS: 'hideFeaturedChannels',
  AUTO_EXPAND_CHANNELS: 'autoExpandChannels',
  HIDE_OFFLINE_FOLLOWED_CHANNELS: 'hideOfflineFollowedChannels',
  HOST_BUTTON: 'hostButton',
  HIDE_PLAYER_EXTENSIONS: 'hidePlayerExtensions',
  CLICK_TO_PLAY: 'clickToPlay',
  DISABLE_VOD_RECOMMENDATION_AUTOPLAY: 'disableVodRecommendationAutoplay',
  MUTE_INVISIBLE_PLAYER: 'muteInvisiblePlayer',
  SCROLL_VOLUME_CONTROL: 'scrollVolumeControl',
  DELETED_MESSAGES: 'deletedMessages',
  BLACKLIST_KEYWORDS: 'blacklistKeywords',
  HIGHLIGHT_KEYWORDS: 'highlightKeywords',
};

function deserializeSettingForLegacy(data, settingId) {
  switch (settingId) {
    case SettingIds.ANON_CHAT:
      return !!data[LegacySettingIds.ANON_CHAT];
    case SettingIds.AUTO_THEATRE_MODE:
      return !!data[LegacySettingIds.AUTO_THEATRE_MODE];
    case SettingIds.SPLIT_CHAT:
      return !!data[LegacySettingIds.SPLIT_CHAT];
    case SettingIds.REVERSE_CHAT_DIRECTION:
      return !!data[LegacySettingIds.REVERSE_CHAT_DIRECTION];
    case SettingIds.PINNED_HIGHLIGHTS:
      return !!data[LegacySettingIds.PINNED_HIGHLIGHTS];
    case SettingIds.TIMEOUT_HIGHLIGHTS:
      return !!data[LegacySettingIds.TIMEOUT_HIGHLIGHTS];
    case SettingIds.HIGHLIGHT_FEEDBACK:
      return !!data[LegacySettingIds.HIGHLIGHT_FEEDBACK];
    case SettingIds.TAB_COMPLETION_TOOLTIP:
      return !!data[LegacySettingIds.TAB_COMPLETION_TOOLTIP];
    case SettingIds.TAB_COMPLETION_EMOTE_PRIORITY:
      return !!data[LegacySettingIds.TAB_COMPLETION_EMOTE_PRIORITY];
    case SettingIds.SHOW_DIRECTORY_LIVE_TAB:
      return !!data[LegacySettingIds.SHOW_DIRECTORY_LIVE_TAB];
    case SettingIds.EMOTE_MENU:
      return !!data[LegacySettingIds.EMOTE_MENU];
    case SettingIds.DARKENED_MODE:
      return !!data[LegacySettingIds.DARKENED_MODE];
    case SettingIds.HOST_BUTTON:
      return !!data[LegacySettingIds.HOST_BUTTON];
    case SettingIds.CLICK_TO_PLAY:
      return !!data[LegacySettingIds.CLICK_TO_PLAY];
    case SettingIds.MUTE_INVISIBLE_PLAYER:
      return !!data[LegacySettingIds.MUTE_INVISIBLE_PLAYER];
    case SettingIds.SCROLL_VOLUME_CONTROL:
      return !!data[LegacySettingIds.SCROLL_VOLUME_CONTROL];
    case SettingIds.CHAT_REPLIES:
      return !data[LegacySettingIds.HIDE_CHAT_REPLIES];
    case SettingIds.WHISPERS:
      return !data[LegacySettingIds.DISABLE_WHISPERS];
    case SettingIds.CHANNEL_POINTS_MESSAGE_HIGHLIGHTS:
      return !data[LegacySettingIds.DISABLE_CHANNEL_POINTS_MESSAGE_HIGHLIGHTS];
    case SettingIds.FP_VIDEO:
      return !data[LegacySettingIds.DISABLE_FP_VIDEO];
    case SettingIds.HOST_MODE:
      return !data[LegacySettingIds.DISABLE_HOST_MODE];
    case SettingIds.LOCALIZED_NAMES:
      return !data[LegacySettingIds.DISABLE_LOCALIZED_NAMES];
    case SettingIds.USERNAME_COLORS:
      return !data[LegacySettingIds.DISABLE_USERNAME_COLORS];
    case SettingIds.BITS:
      return !data[LegacySettingIds.HIDE_BITS];
    case SettingIds.CHAT_CLIPS:
      return !data[LegacySettingIds.HIDE_CHAT_CLIPS];
    case SettingIds.NEW_VIEWER_GREETING:
      return !data[LegacySettingIds.HIDE_NEW_VIEWER_GREETING];
    case SettingIds.SUBSCRIPTION_NOTICES:
      return !data[LegacySettingIds.HIDE_SUBSCRIPTION_NOTICES];
    case SettingIds.COMMUNITY_HIGHLIGHTS:
      return !data[LegacySettingIds.HIDE_COMMUNITY_HIGHLIGHTS];
    case SettingIds.PRIME_PROMOTIONS:
      return !data[LegacySettingIds.HIDE_PRIME_PROMOTIONS];
    case SettingIds.PLAYER_EXTENSIONS:
      return !data[LegacySettingIds.HIDE_PLAYER_EXTENSIONS];
    case SettingIds.VOD_RECOMMENDATION_AUTOPLAY:
      return !data[LegacySettingIds.DISABLE_VOD_RECOMMENDATION_AUTOPLAY];
    case SettingIds.SIDEBAR: {
      const hideFeaturedChannels = data[LegacySettingIds.HIDE_FEATURED_CHANNELS] || false;
      const hideOfflineFollowedChannels = data[LegacySettingIds.HIDE_OFFLINE_FOLLOWED_CHANNELS] || false;
      const autoExpand = data[LegacySettingIds.AUTO_EXPAND_CHANNELS] || false;

      let flags = setFlag(0, SidebarFlags.FEATURED_CHANNELS, !hideFeaturedChannels);
      flags = setFlag(flags, SidebarFlags.OFFLINE_FOLLOWED_CHANNELS, !hideOfflineFollowedChannels);
      flags = setFlag(flags, SidebarFlags.AUTO_EXPAND_CHANNELS, autoExpand);
      return [
        flags,
        SidebarFlags.FEATURED_CHANNELS | SidebarFlags.OFFLINE_FOLLOWED_CHANNELS | SidebarFlags.AUTO_EXPAND_CHANNELS,
      ];
    }
    case SettingIds.EMOTES: {
      const bttvEmotes = data[LegacySettingIds.BTTV_EMOTES];
      const bttvGifEmotes = data[LegacySettingIds.BTTV_GIF_EMOTES];
      const ffzEmotes = data[LegacySettingIds.FFZ_EMOTES];

      let flags = setFlag(0, EmoteTypeFlags.BTTV_EMOTES, bttvEmotes != null ? bttvEmotes : true);
      flags = setFlag(flags, EmoteTypeFlags.BTTV_GIF_EMOTES, bttvGifEmotes != null ? bttvGifEmotes : true);
      flags = setFlag(flags, EmoteTypeFlags.FFZ_EMOTES, ffzEmotes != null ? ffzEmotes : true);
      return [flags, EmoteTypeFlags.BTTV_EMOTES | EmoteTypeFlags.BTTV_GIF_EMOTES | EmoteTypeFlags.FFZ_EMOTES];
    }
    case SettingIds.CHAT: {
      const hideChatReplies = data[LegacySettingIds.HIDE_CHAT_REPLIES] || false;
      const hideBits = data[LegacySettingIds.HIDE_BITS] || false;
      const hideChatClips = data[LegacySettingIds.HIDE_CHAT_CLIPS] || false;
      const hideNewViewerGreeting = data[LegacySettingIds.HIDE_NEW_VIEWER_GREETING] || false;
      const hideSubscriptionNotices = data[LegacySettingIds.HIDE_SUBSCRIPTION_NOTICES] || false;
      const hideCommunityHighlights = data[LegacySettingIds.HIDE_COMMUNITY_HIGHLIGHTS] || false;

      let flags = setFlag(0, ChatFlags.CHAT_REPLIES, !hideChatReplies);
      flags = setFlag(flags, ChatFlags.BITS, !hideBits);
      flags = setFlag(flags, ChatFlags.CHAT_CLIPS, !hideChatClips);
      flags = setFlag(flags, ChatFlags.VIEWER_GREETING, !hideNewViewerGreeting);
      flags = setFlag(flags, ChatFlags.SUB_NOTICE, !hideSubscriptionNotices);
      flags = setFlag(flags, ChatFlags.COMMUNITY_HIGHLIGHTS, !hideCommunityHighlights);
      return [
        flags,
        ChatFlags.CHAT_REPLIES |
          ChatFlags.BITS |
          ChatFlags.CHAT_CLIPS |
          ChatFlags.VIEWER_GREETING |
          ChatFlags.SUB_NOTICE |
          ChatFlags.COMMUNITY_HIGHLIGHTS,
      ];
    }
    case SettingIds.CHANNEL_POINTS: {
      const hideChannelPoints = data[LegacySettingIds.HIDE_CHANNEL_POINTS] || false;
      const autoClaimBonusChannelPoints = data[LegacySettingIds.AUTO_CLAIM_BONUS_CHANNEL_POINTS] || false;
      const disableChannelPointsMessageHighlights =
        data[LegacySettingIds.DISABLE_CHANNEL_POINTS_MESSAGE_HIGHLIGHTS] || false;

      let flags = setFlag(0, ChannelPointsFlags.CHANNEL_POINTS, !hideChannelPoints);
      flags = setFlag(flags, ChannelPointsFlags.AUTO_CLAIM, autoClaimBonusChannelPoints);
      flags = setFlag(flags, ChannelPointsFlags.MESSAGE_HIGHLIGHTS, !disableChannelPointsMessageHighlights);
      return [
        flags,
        ChannelPointsFlags.CHANNEL_POINTS | ChannelPointsFlags.AUTO_CLAIM | ChannelPointsFlags.MESSAGE_HIGHLIGHTS,
      ];
    }
    case SettingIds.AUTO_PLAY: {
      const disableFrontPageVideo = data[LegacySettingIds.DISABLE_FP_VIDEO] || false;
      const disableHostMode = data[LegacySettingIds.DISABLE_HOST_MODE] || false;
      const disableVodRecommendationAutoplay = data[LegacySettingIds.DISABLE_VOD_RECOMMENDATION_AUTOPLAY] || false;

      let flags = setFlag(0, AutoPlayFlags.FP_VIDEO, !disableFrontPageVideo);
      flags = setFlag(flags, AutoPlayFlags.HOST_MODE, !disableHostMode);
      flags = setFlag(flags, AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY, !disableVodRecommendationAutoplay);
      return [flags, AutoPlayFlags.FP_VIDEO | AutoPlayFlags.HOST_MODE | AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY];
    }
    case SettingIds.USERNAMES: {
      const disableUsernameColors = data[LegacySettingIds.DISABLE_USERNAME_COLORS] || false;
      const disableLocalizedNames = data[LegacySettingIds.DISABLE_LOCALIZED_NAMES] || false;
      const readableUsernameColors = data[LegacySettingIds.READABLE_USERNAME_COLORS];

      let flags = setFlag(0, UsernameFlags.COLORS, !disableUsernameColors);
      flags = setFlag(flags, UsernameFlags.LOCALIZED, !disableLocalizedNames);
      flags = setFlag(flags, UsernameFlags.READABLE, readableUsernameColors != null ? readableUsernameColors : true);
      return [flags, UsernameFlags.COLORS | UsernameFlags.LOCALIZED | UsernameFlags.READABLE];
    }
    case SettingIds.CHAT_LAYOUT: {
      return data[LegacySettingIds.LEFT_SIDE_CHAT] === true ? ChatLayoutTypes.LEFT : ChatLayoutTypes.RIGHT;
    }
    case SettingIds.DELETED_MESSAGES: {
      if (data[LegacySettingIds.HIDE_DELETED_MESSAGES] === true) {
        return DeletedMessageTypes.HIDE;
      }

      if (data[LegacySettingIds.SHOW_DELETED_MESSAGES] === true) {
        return DeletedMessageTypes.SHOW;
      }

      return DeletedMessageTypes.DEFAULT;
    }
    case SettingIds.BLACKLIST_KEYWORDS: {
      const keywords = data[LegacySettingIds.BLACKLIST_KEYWORDS];
      return keywords != null ? serializeKeywords(keywords) : null;
    }
    case SettingIds.HIGHLIGHT_KEYWORDS: {
      const keywords = data[LegacySettingIds.HIGHLIGHT_KEYWORDS];
      return keywords != null ? serializeKeywords(keywords) : null;
    }
    default:
      return null;
  }
}

export function loadLegacySettings(data) {
  const settings = {...SettingDefaultValues};

  for (const settingId of Object.values(SettingIds)) {
    const storedValue = deserializeSettingForLegacy(data, settingId);
    if (storedValue == null) {
      continue;
    }

    settings[settingId] = storedValue;
  }

  return settings;
}
