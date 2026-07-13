import {
  faComment,
  faDisplay,
  faEllipsis,
  faFaceSmile,
  faPalette,
  faRobot,
  faShieldHalved,
  faTowerBroadcast,
} from '@fortawesome/free-solid-svg-icons';
import formatMessage from '@/i18n/index';
import {SettingCategoryIds} from './stores/setting-store';

// Key order defines the display order of the categories in both the side navigation and on the
// settings page, so the two always match. Settings order within a category by registration order,
// and declare their category via registerSetting's settingCategoryId.
const CATEGORY_LABELS = {
  [SettingCategoryIds.APPEARANCE]: formatMessage({defaultMessage: 'Appearance'}),
  [SettingCategoryIds.EMOTES]: formatMessage({defaultMessage: 'Emotes'}),
  [SettingCategoryIds.BOTS]: formatMessage({defaultMessage: 'Bots'}),
  [SettingCategoryIds.CHAT]: formatMessage({defaultMessage: 'Chat'}),
  [SettingCategoryIds.CHANNEL]: formatMessage({defaultMessage: 'Channel'}),
  [SettingCategoryIds.MODERATION]: formatMessage({defaultMessage: 'Moderation'}),
  [SettingCategoryIds.INTERFACE]: formatMessage({defaultMessage: 'Interface'}),
  [SettingCategoryIds.OTHER]: formatMessage({defaultMessage: 'Other'}),
};

const CATEGORY_ICONS = {
  [SettingCategoryIds.APPEARANCE]: faPalette,
  [SettingCategoryIds.EMOTES]: faFaceSmile,
  [SettingCategoryIds.BOTS]: faRobot,
  [SettingCategoryIds.CHAT]: faComment,
  [SettingCategoryIds.CHANNEL]: faTowerBroadcast,
  [SettingCategoryIds.MODERATION]: faShieldHalved,
  [SettingCategoryIds.INTERFACE]: faDisplay,
  [SettingCategoryIds.OTHER]: faEllipsis,
};

// Group the given settings into their categories (in category-defined order), dropping categories
// with no settings on the current platform.
export function groupSettingsByCategory(settings) {
  const groups = [];

  for (const categoryId of Object.keys(CATEGORY_LABELS)) {
    const categorySettings = settings.filter((setting) => setting.settingCategoryId === categoryId);

    if (categorySettings.length === 0) {
      continue;
    }

    groups.push({
      id: categoryId,
      label: CATEGORY_LABELS[categoryId],
      icon: CATEGORY_ICONS[categoryId],
      settings: categorySettings,
    });
  }

  return groups;
}

// Flat, category-ordered list of settings. The settings page renders in this order so its panels
// line up with the side navigation.
export function orderSettingsByCategory(settings) {
  return groupSettingsByCategory(settings).flatMap((group) => group.settings);
}
