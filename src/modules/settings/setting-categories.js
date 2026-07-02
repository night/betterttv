import {
  faComment,
  faEllipsis,
  faFaceSmile,
  faPalette,
  faShieldHalved,
  faTowerBroadcast,
} from '@fortawesome/free-solid-svg-icons';
import formatMessage from '@/i18n/index';
import {SettingPanelIds} from './stores/setting-store';

// Ordered categories for the settings navigation. Each category has an icon (shown on the category
// row) and lists its panels in display order. This same ordering drives both the side navigation
// and the settings page, so the two always match.
const SETTING_CATEGORIES = [
  {
    id: 'emotes',
    label: formatMessage({defaultMessage: 'Emotes'}),
    icon: faFaceSmile,
    settingPanelIds: [
      SettingPanelIds.EMOTES,
      SettingPanelIds.EMOTE_MENU,
      SettingPanelIds.EMOTE_AUTOCOMPLETE,
      SettingPanelIds.TAB_COMPLETION,
    ],
  },
  {
    id: 'chat',
    label: formatMessage({defaultMessage: 'Chat'}),
    icon: faComment,
    settingPanelIds: [
      SettingPanelIds.CHAT,
      SettingPanelIds.USERNAMES,
      SettingPanelIds.HIGHLIGHTS,
      SettingPanelIds.DELETED_MESSAGES,
      SettingPanelIds.CHAT_LAYOUT,
      SettingPanelIds.CHAT_DIRECTION,
      SettingPanelIds.SPLIT_CHAT,
      SettingPanelIds.ANON_CHAT,
      SettingPanelIds.WHISPERS,
    ],
  },
  {
    id: 'moderation',
    label: formatMessage({defaultMessage: 'Moderation'}),
    icon: faShieldHalved,
    settingPanelIds: [
      SettingPanelIds.MODERATION,
      SettingPanelIds.BLACKLIST_KEYWORDS,
      SettingPanelIds.CHATBOTS,
      SettingPanelIds.SELF_BOT,
    ],
  },
  {
    id: 'channel',
    label: formatMessage({defaultMessage: 'Channel'}),
    icon: faTowerBroadcast,
    settingPanelIds: [
      SettingPanelIds.CHANNEL_POINTS,
      SettingPanelIds.RAIDS,
      SettingPanelIds.PRIME_GAMING,
      SettingPanelIds.AUTO_CLAIM,
      SettingPanelIds.AUTO_LIVE_CHAT_VIEW,
    ],
  },
  {
    id: 'interface',
    label: formatMessage({defaultMessage: 'Interface'}),
    icon: faPalette,
    settingPanelIds: [
      SettingPanelIds.THEME,
      SettingPanelIds.SIDEBAR,
      SettingPanelIds.DIRECTORY,
      SettingPanelIds.PLAYER,
      SettingPanelIds.AUTO_PLAY,
      SettingPanelIds.YOUTUBE,
    ],
  },
];

// The trailing "Other" group catches any panel not assigned to a category.
const OTHER_CATEGORY = {
  id: 'other',
  label: formatMessage({defaultMessage: 'Other'}),
  icon: faEllipsis,
};

// Group the given settings into their categories (in category-defined order). Panels not assigned
// to any category fall into a trailing "other" group so a newly added setting is never hidden.
export function groupSettingsByCategory(settings) {
  const byPanelId = new Map(settings.map((setting) => [setting.settingPanelId, setting]));
  const used = new Set();
  const groups = [];

  for (const category of SETTING_CATEGORIES) {
    const categorySettings = category.settingPanelIds
      .map((panelId) => byPanelId.get(panelId))
      .filter((setting) => setting != null);

    if (categorySettings.length === 0) {
      continue;
    }

    categorySettings.forEach((setting) => used.add(setting.settingPanelId));
    groups.push({id: category.id, label: category.label, icon: category.icon, settings: categorySettings});
  }

  const uncategorized = settings.filter((setting) => !used.has(setting.settingPanelId));
  if (uncategorized.length > 0) {
    groups.push({...OTHER_CATEGORY, settings: uncategorized});
  }

  return groups;
}

// Flat, category-ordered list of settings. The settings page renders in this order so its panels
// line up with the side navigation.
export function orderSettingsByCategory(settings) {
  return groupSettingsByCategory(settings).flatMap((group) => group.settings);
}
