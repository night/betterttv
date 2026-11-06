import {Bot, Ellipsis, MessageSquare, Monitor, PaintbrushVertical, RadioTower, ShieldHalf, Smile} from 'lucide-react';
import formatMessage from '@/i18n/index';
import {registerSearchEntry} from './search-entries';
import {SettingCategoryIds} from './stores/setting-store';

// Key order defines the display order of the categories in the side navigation, where each one
// opens its own page. Settings order within a category by registration order, and declare their
// category via registerSetting's settingCategoryId.
const CATEGORY_LABELS = {
  [SettingCategoryIds.USERNAME]: formatMessage({defaultMessage: 'Username'}),
  [SettingCategoryIds.EMOTES]: formatMessage({defaultMessage: 'Emotes'}),
  [SettingCategoryIds.BOTS]: formatMessage({defaultMessage: 'Bots'}),
  [SettingCategoryIds.CHAT]: formatMessage({defaultMessage: 'Chat'}),
  [SettingCategoryIds.CHANNEL]: formatMessage({defaultMessage: 'Channel'}),
  [SettingCategoryIds.MODERATION]: formatMessage({defaultMessage: 'Moderation'}),
  [SettingCategoryIds.INTERFACE]: formatMessage({defaultMessage: 'Interface'}),
  [SettingCategoryIds.OTHER]: formatMessage({defaultMessage: 'Other'}),
};

const CATEGORY_ICONS = {
  [SettingCategoryIds.USERNAME]: PaintbrushVertical,
  [SettingCategoryIds.EMOTES]: Smile,
  [SettingCategoryIds.BOTS]: Bot,
  [SettingCategoryIds.CHAT]: MessageSquare,
  [SettingCategoryIds.CHANNEL]: RadioTower,
  [SettingCategoryIds.MODERATION]: ShieldHalf,
  [SettingCategoryIds.INTERFACE]: Monitor,
  [SettingCategoryIds.OTHER]: Ellipsis,
};

for (const [categoryId, label] of Object.entries(CATEGORY_LABELS)) {
  registerSearchEntry({query: label, categoryId});
}

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
