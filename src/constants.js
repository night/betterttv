export const SettingIds = {
  ANON_CHAT: 'anonChat',
  ANON_CHAT_WHITELISTED_CHANNELS: 'anonChatWhitelistedChannels',
  AUTO_THEATRE_MODE: 'autoTheatreMode',
  AUTO_JOIN_RAIDS: 'autoJoinRaids',
  AUTO_MOD_VIEW: 'autoModView',
  AUTO_CLAIM: 'autoClaim',
  CHANNEL_POINTS: 'channelPoints',
  SPLIT_CHAT: 'splitChat',
  SPLIT_CHAT_COLOR: 'splitChatColor',
  REVERSE_CHAT_DIRECTION: 'reverseChatDirection',
  PINNED_HIGHLIGHTS: 'pinnedHighlights',
  MAX_PINNED_HIGHLIGHTS: 'maxPinnedHighlights',
  TIMEOUT_HIGHLIGHTS: 'timeoutHighlights',
  HIGHLIGHT_FEEDBACK: 'highlightFeedback',
  CHAT_LAYOUT: 'chatLayout',
  TAB_COMPLETION_TOOLTIP: 'tabCompletionTooltip',
  TAB_COMPLETION_EMOTE_PRIORITY: 'tabCompletionEmotePriority',
  WHISPERS: 'whispers',
  SHOW_DIRECTORY_LIVE_TAB: 'showDirectoryLiveTab',
  CHANNEL_POINTS_MESSAGE_HIGHLIGHTS: 'channelPointsMessageHighlights',
  EMOTE_MENU: 'clickTwitchEmotes',
  AUTO_THEME_MODE: 'autoThemeMode',
  DARKENED_MODE: 'darkenedMode',
  PRIME_PROMOTIONS: 'primePromotions',
  // HOST_BUTTON: 'hostButton', REMOVED, FOR REFERENCE ONLY
  PLAYER_EXTENSIONS: 'playerExtensions',
  CLICK_TO_PLAY: 'clickToPlay',
  EMOTE_AUTOCOMPLETE: 'emoteAutocomplete',
  MUTE_INVISIBLE_PLAYER: 'muteInvisiblePlayer',
  SCROLL_PLAYER_CONTROLS: 'scrollVolumeControl',
  DELETED_MESSAGES: 'deletedMessages',
  BLACKLIST_KEYWORDS: 'blacklistKeywords',
  HIGHLIGHT_KEYWORDS: 'highlightKeywords',
  SIDEBAR: 'sidebar',
  EMOTES: 'emotes',
  CHAT: 'chat',
  AUTO_PLAY: 'autoPlay',
  USERNAMES: 'usernames',
  AUTO_LIVE_CHAT_VIEW: 'autoLiveChatView',
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
  HIGHLIGHT: 3,
};

export const SidebarFlags = {
  // 1 << 0: FRIENDS,
  FEATURED_CHANNELS: 1 << 1,
  // 1 << 2: RECOMMENDED_FRIENDS,
  OFFLINE_FOLLOWED_CHANNELS: 1 << 3,
  AUTO_EXPAND_CHANNELS: 1 << 4,
};

export const EmoteTypeFlags = {
  BTTV_EMOTES: 1 << 0,
  ANIMATED_EMOTES: 1 << 1,
  FFZ_EMOTES: 1 << 2,
  ANIMATED_PERSONAL_EMOTES: 1 << 3,
  SEVENTV_EMOTES: 1 << 4,
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
  // HOST_MODE: 1 << 1,
  VOD_RECOMMENDATION_AUTOPLAY: 1 << 2,
  OFFLINE_CHANNEL_VIDEO: 1 << 3,
};

export const UsernameFlags = {
  READABLE: 1 << 0,
  COLORS: 1 << 1,
  LOCALIZED: 1 << 2,
  BADGES: 1 << 3,
};

export const AutoClaimFlags = {
  DROPS: 1 << 0,
  MOMENTS: 1 << 1,
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

export const EmoteProviders = {
  BETTERTTV: 'bttv',
  FRANKERFACEZ: 'ffz',
  TWITCH: 'twitch',
  YOUTUBE: 'youtube',
  SEVENTV: 'seventv',
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
  YOUTUBE_GLOBAL: 'youtube-global',
  YOUTUBE_CHANNEL: (channelId) => `youtube-${channelId}`,
  SEVENTV_CHANNEL: 'seventv-channel',
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

export const SettingDefaultValues = {
  [SettingIds.ANON_CHAT]: false,
  [SettingIds.ANON_CHAT_WHITELISTED_CHANNELS]: [],
  [SettingIds.AUTO_THEATRE_MODE]: false,
  [SettingIds.AUTO_JOIN_RAIDS]: true,
  [SettingIds.AUTO_MOD_VIEW]: false,
  [SettingIds.SPLIT_CHAT]: false,
  [SettingIds.DELETED_MESSAGES]: DeletedMessageTypes.DEFAULT,
  [SettingIds.REVERSE_CHAT_DIRECTION]: false,
  [SettingIds.PINNED_HIGHLIGHTS]: false,
  [SettingIds.MAX_PINNED_HIGHLIGHTS]: 10,
  [SettingIds.TIMEOUT_HIGHLIGHTS]: true,
  [SettingIds.HIGHLIGHT_FEEDBACK]: false,
  [SettingIds.CHAT_LAYOUT]: ChatLayoutTypes.RIGHT,
  [SettingIds.TAB_COMPLETION_TOOLTIP]: false,
  [SettingIds.TAB_COMPLETION_EMOTE_PRIORITY]: false,
  [SettingIds.WHISPERS]: true,
  [SettingIds.SHOW_DIRECTORY_LIVE_TAB]: false,
  [SettingIds.CHANNEL_POINTS_MESSAGE_HIGHLIGHTS]: true,
  [SettingIds.EMOTE_MENU]: false,
  [SettingIds.AUTO_THEME_MODE]: false,
  [SettingIds.DARKENED_MODE]: false,
  [SettingIds.PRIME_PROMOTIONS]: true,
  [SettingIds.PLAYER_EXTENSIONS]: true,
  [SettingIds.CLICK_TO_PLAY]: false,
  [SettingIds.MUTE_INVISIBLE_PLAYER]: false,
  [SettingIds.SCROLL_PLAYER_CONTROLS]: false,
  [SettingIds.EMOTE_AUTOCOMPLETE]: true,
  [SettingIds.BLACKLIST_KEYWORDS]: {},
  [SettingIds.HIGHLIGHT_KEYWORDS]: null,
  [SettingIds.SIDEBAR]: [SidebarFlags.OFFLINE_FOLLOWED_CHANNELS | SidebarFlags.FEATURED_CHANNELS, 0],
  [SettingIds.EMOTES]: [EmoteTypeFlags.BTTV_EMOTES | EmoteTypeFlags.ANIMATED_EMOTES | EmoteTypeFlags.FFZ_EMOTES, 0],
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
    AutoPlayFlags.FP_VIDEO | AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY | AutoPlayFlags.OFFLINE_CHANNEL_VIDEO,
    0,
  ],
  [SettingIds.USERNAMES]: [
    UsernameFlags.COLORS | UsernameFlags.LOCALIZED | UsernameFlags.READABLE | UsernameFlags.BADGES,
    0,
  ],
  [SettingIds.CHANNEL_POINTS]: [ChannelPointsFlags.CHANNEL_POINTS | ChannelPointsFlags.MESSAGE_HIGHLIGHTS, 0],
  [SettingIds.AUTO_CLAIM]: [0, 0],
  [SettingIds.LIVE_CHAT_VIEW]: false,
};

export const FlagSettings = [
  SettingIds.SIDEBAR,
  SettingIds.EMOTES,
  SettingIds.CHAT,
  SettingIds.AUTO_PLAY,
  SettingIds.USERNAMES,
  SettingIds.CHANNEL_POINTS,
  SettingIds.AUTO_CLAIM,
];

export const PlatformTypes = {
  TWITCH: 1,
  TWITCH_CLIPS: 2,
  YOUTUBE: 3,
};

export const EMOTE_MENU_SIDEBAR_ROW_HEIGHT = 36;
export const EMOTE_MENU_GRID_ROW_HEIGHT = 36;
export const EMOTE_MENU_GRID_HEIGHT = 300;

export const EMOTE_CATEGORIES_ORDER_STORAGE_KEY = 'emote-categories-order';
