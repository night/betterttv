export const SettingIds = {
  ANON_CHAT: 'anonChat',
  AUTO_THEATRE_MODE: 'autoTheatreMode',
  CHANNEL_POINTS: 'channelPoints',
  SPLIT_CHAT: 'splitChat',
  REVERSE_CHAT_DIRECTION: 'reverseChatDirection',
  PINNED_HIGHLIGHTS: 'pinnedHighlights',
  TIMEOUT_HIGHLIGHTS: 'timeoutHighlights',
  HIGHLIGHT_FEEDBACK: 'highlightFeedback',
  CHAT_LAYOUT: 'chatLayout',
  TAB_COMPLETION_TOOLTIP: 'tabCompletionTooltip',
  TAB_COMPLETION_EMOTE_PRIORITY: 'tabCompletionEmotePriority',
  WHISPERS: 'whispers',
  SHOW_DIRECTORY_LIVE_TAB: 'showDirectoryLiveTab',
  CHANNEL_POINTS_MESSAGE_HIGHLIGHTS: 'channelPointsMessageHighlights',
  EMOTE_MENU: 'clickTwitchEmotes',
  DARKENED_MODE: 'darkenedMode',
  FRIENDS: 'friends',
  PRIME_PROMOTIONS: 'primePromotions',
  HOST_BUTTON: 'hostButton',
  PLAYER_EXTENSIONS: 'playerExtensions',
  CLICK_TO_PLAY: 'clickToPlay',
  MUTE_INVISIBLE_PLAYER: 'muteInvisiblePlayer',
  SCROLL_VOLUME_CONTROL: 'scrollVolumeControl',
  DELETED_MESSAGES: 'deletedMessages',
  BLACKLIST_KEYWORDS: 'blacklistKeywords',
  HIGHLIGHT_KEYWORDS: 'highlightKeywords',
  SIDEBAR: 'sidebar',
  EMOTES: 'emotes',
  CHAT: 'chat',
  AUTO_PLAY: 'autoPlay',
  USERNAMES: 'usernames',
};

export const LegacySettingIds = {
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
  HIDE_FRIENDS: 'hideFriends',
  HIDE_PRIME_PROMOTIONS: 'hidePrimePromotions',
  HIDE_FEATURED_CHANNELS: 'hideFeaturedChannels',
  AUTO_EXPAND_CHANNELS: 'autoExpandChannels',
  HIDE_RECOMMENDED_FRIENDS: 'hideRecommendedFriends',
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

export const CategoryTypes = {
  CHAT: 1,
  DIRECTORY: 2,
  CHANNEL: 3,
};

export const ChatLayoutTypes = {
  LEFT: 1,
  RIGHT: 2,
};

export const DeletedMessageTypes = {
  DEFAULT: 0,
  SHOW: 1,
  HIDE: 2,
};

export const SidebarFlags = {
  FRIENDS: 1 << 0,
  FEATURED_CHANNELS: 1 << 1,
  RECOMMENDED_FRIENDS: 1 << 2,
  OFFLINE_FOLLOWED_CHANNELS: 1 << 3,
  AUTO_EXPAND_CHANNELS: 1 << 4,
};

export const EmoteTypeFlags = {
  BTTV_EMOTES: 1 << 0,
  BTTV_GIF_EMOTES: 1 << 1,
  FFZ_EMOTES: 1 << 2,
};

export const ChatFlags = {
  CHAT_REPLIES: 1 << 0,
  BITS: 1 << 1,
  CHAT_CLIPS: 1 << 2,
  VIEWER_GREETING: 1 << 3,
  SUB_NOTICE: 1 << 4,
  COMMUNITY_HIGHLIGHTS: 1 << 5,
  CHAT_MESSAGE_HISTORY: 1 << 6,
};

export const ChannelPointsFlags = {
  CHANNEL_POINTS: 1 << 0,
  AUTO_CLAIM: 1 << 1,
  MESSAGE_HIGHLIGHTS: 1 << 2,
};

export const AutoPlayFlags = {
  FP_VIDEO: 1 << 0,
  HOST_MODE: 1 << 1,
  VOD_RECOMMENDATION_AUTOPLAY: 1 << 2,
};

export const UsernameFlags = {
  READABLE: 1 << 0,
  COLORS: 1 << 1,
  LOCALIZED: 1 << 2,
};

export const PageTypes = {
  CHAT_SETTINGS: 1,
  DIRECTORY_SETTINGS: 2,
  CHANNEL_SETTINGS: 3,
  CHANGELOG: 4,
  ABOUT: 5,
};

export const NavigationModeTypes = {
  MOUSE: 0,
  ARROW_KEYS: 1,
};

export const RowHeight = 36;
export const WindowHeight = 300;

export const EmoteProviders = {
  BETTERTTV: 'bttv',
  FRANKERFACEZ: 'ffz',
  TWITCH: 'twitch',
};

export const EmoteCategories = {
  BETTERTTV_GLOBAL: 'bttv-global',
  BETTERTTV_CHANNEL: 'bttv-channel',
  BETTERTTV_PERSONAL: 'bttv-personal',
  BETTERTTV_EMOJI: 'bttv-emoji',
  FRANKERFACEZ_GLOBAL: 'ffz-global',
  FRANKERFACEZ_CHANNEL: 'ffz-channel',
  EMOJI_PEOPLE: 'emoji-people',
  EMOJI_NATURE: 'emoji-nature',
  EMOJI_FOODS: 'emoji-foods',
  EMOJI_ACTIVITIES: 'emoji-activities',
  EMOJI_TRAVEL: 'emoji-travel',
  EMOJI_OBJECTS: 'emoji-objects',
  EMOJI_SYMBOLS: 'emoji-symbols',
  EMOJI_FLAGS: 'emoji-flags',
  FAVORITES: 'favorites',
  FRECENTS: 'frecents',
  TWITCH_GLOBAL: 'twitch-global',
  TWITCH_GAMING: 'twitch-gaming',
  TWITCH_TURBO: 'twitch-turbo',
  TWITCH_UNLOCKED: 'twitch-unlocked',
  TWITCH_CHANNEL: (channelId) => `twitch-${channelId}`,
};

export const DEFAULT_FREQUENT_EMOTES = {
  'twitch-305954156': {recentUses: [Date.now()], totalUses: 1, score: 100}, // PogChamp
  'twitch-120232': {recentUses: [Date.now()], totalUses: 1, score: 100}, // TriHard
  'twitch-425618': {recentUses: [Date.now()], totalUses: 1, score: 100}, // LUL
  'bttv-566ca06065dbbdab32ec054e': {recentUses: [Date.now()], totalUses: 1, score: 100}, // NaM
  'bttv-566ca38765dbbdab32ec0560': {recentUses: [Date.now()], totalUses: 1, score: 100}, // SourPls
  'bttv-566c9fc265dbbdab32ec053b': {recentUses: [Date.now()], totalUses: 1, score: 100}, // FeelsBadMan
  'bttv-566c9fde65dbbdab32ec053e': {recentUses: [Date.now()], totalUses: 1, score: 100}, // FeelsGoodMan
  'bttv-56e9f494fff3cc5c35e5287e': {recentUses: [Date.now()], totalUses: 1, score: 100}, // monkaS
  'bttv-555981336ba1901877765555': {recentUses: [Date.now()], totalUses: 1, score: 100}, // haHAA
};

export const EmoteMenuTips = {
  EMOTE_MENU_FAVORITE_EMOTE: 'emoteMenuTipClosedFavoriteEmote',
  EMOTE_MENU_PREVENT_CLOSE: 'emoteMenuTipClosedPreventClose',
  EMOTE_MENU_HOTKEY: 'emoteMenuTipClosedHotkey',
};

export const DefaultValues = {
  [SettingIds.ANON_CHAT]: false,
  [SettingIds.AUTO_THEATRE_MODE]: false,
  [SettingIds.AUTO_CLAIM_BONUS_CHANNEL_POINTS]: false,
  [SettingIds.FFZ_EMOTES]: true,
  [SettingIds.BTTV_EMOTES]: true,
  [SettingIds.BTTV_GIF_EMOTES]: true,
  [SettingIds.SPLIT_CHAT]: false,
  [SettingIds.DELETED_MESSAGES]: DeletedMessageTypes.DEFAULT,
  [SettingIds.REVERSE_CHAT_DIRECTION]: false,
  [SettingIds.PINNED_HIGHLIGHTS]: false,
  [SettingIds.TIMEOUT_HIGHLIGHTS]: true,
  [SettingIds.HIGHLIGHT_FEEDBACK]: false,
  [SettingIds.CHAT_LAYOUT]: ChatLayoutTypes.RIGHT,
  [SettingIds.CHAT_REPLIES]: true,
  [SettingIds.TAB_COMPLETION_TOOLTIP]: false,
  [SettingIds.TAB_COMPLETION_EMOTE_PRIORITY]: false,
  [SettingIds.WHISPERS]: true,
  [SettingIds.SHOW_DIRECTORY_LIVE_TAB]: false,
  [SettingIds.CHANNEL_POINTS_MESSAGE_HIGHLIGHTS]: true,
  [SettingIds.FP_VIDEO]: true,
  [SettingIds.HOST_MODE]: true,
  [SettingIds.LOCALIZED_NAMES]: true,
  [SettingIds.USERNAME_COLORS]: true,
  [SettingIds.READABLE_USER_NAME_COLORS]: false,
  [SettingIds.EMOTE_MENU]: false,
  [SettingIds.DARKENED_MODE]: false,
  [SettingIds.BITS]: true,
  [SettingIds.CHAT_CLIPS]: true,
  [SettingIds.NEW_VIEWER_GREETING]: true,
  [SettingIds.SUBSCRIPTION_NOTICES]: true,
  [SettingIds.COMMUNITY_HIGHLIGHTS]: true,
  [SettingIds.FRIENDS]: true,
  [SettingIds.PRIME_PROMOTIONS]: true,
  [SettingIds.FEATURED_CHANNELS]: true,
  [SettingIds.AUTO_EXPAND_CHANNELS]: false,
  [SettingIds.RECOMMENDED_FRIENDS]: true,
  [SettingIds.OFFLINE_FOLLOWED_CHANNELS]: true,
  [SettingIds.HOST_BUTTON]: false,
  [SettingIds.PLAYER_EXTENSIONS]: true,
  [SettingIds.CLICK_TO_PLAY]: false,
  [SettingIds.VOD_RECOMMENDATION_AUTOPLAY]: true,
  [SettingIds.MUTE_INVISIBLE_PLAYER]: false,
  [SettingIds.SCROLL_VOLUME_CONTROL]: false,
  [SettingIds.BLACKLIST_KEYWORDS]: {},
  [SettingIds.HIGHLIGHT_KEYWORDS]: null,
  [SettingIds.SIDEBAR]: [
    SidebarFlags.FRIENDS |
      SidebarFlags.OFFLINE_FOLLOWED_CHANNELS |
      SidebarFlags.FEATURED_CHANNELS |
      SidebarFlags.RECOMMENDED_FRIENDS,
    0,
  ],
  [SettingIds.EMOTES]: [EmoteTypeFlags.BTTV_EMOTES | EmoteTypeFlags.BTTV_GIF_EMOTES | EmoteTypeFlags.FFZ_EMOTES, 0],
  [SettingIds.CHAT]: [
    ChatFlags.BITS |
      ChatFlags.CHAT_CLIPS |
      ChatFlags.CHAT_REPLIES |
      ChatFlags.COMMUNITY_HIGHLIGHTS |
      ChatFlags.SUB_NOTICE |
      ChatFlags.VIEWER_GREETING |
      ChatFlags.CHAT_MESSAGE_HISTORY,
    0,
  ],
  [SettingIds.AUTO_PLAY]: [
    AutoPlayFlags.FP_VIDEO | AutoPlayFlags.HOST_MODE | AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY,
    0,
  ],
  [SettingIds.USERNAMES]: [UsernameFlags.COLORS | UsernameFlags.LOCALIZED | UsernameFlags.READABLE, 0],
  [SettingIds.CHANNEL_POINTS]: [ChannelPointsFlags.CHANNEL_POINTS | ChannelPointsFlags.MESSAGE_HIGHLIGHTS, 0],
};

export const FlagSettings = [
  SettingIds.SIDEBAR,
  SettingIds.EMOTES,
  SettingIds.CHAT,
  SettingIds.AUTO_PLAY,
  SettingIds.USERNAMES,
  SettingIds.CHANNEL_POINTS,
];

export const PlatformTypes = {
  TWITCH: 1,
  TWITCH_CLIPS: 2,
  YOUTUBE: 3,
};
