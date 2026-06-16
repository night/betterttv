import {SettingIds, SettingsPromotions} from '@/constants';
import settings from '@/settings';
import storage from '@/storage';
import AuthStore from '@/stores/auth';
import {getProSettingValue} from '@/utils/pro';
import SafeEventEmitter from '@/utils/safe-event-emitter';

const PROMOTION_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const LAST_DISMISSED_ANY_AT_KEY = 'settingsPromotionLastDismissedAnyAt';

// Ordered by priority; the first available promotion is the one shown. `settingId` is the pro
// setting whose value gates the promotion, watched so availability stays in sync.
const PROMOTION_SLOTS = [
  {
    storageKey: SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE,
    settingId: SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE,
    isAvailable: () => !getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false),
  },
  {
    storageKey: SettingsPromotions.THEME_CUSTOMIZE,
    settingId: SettingIds.PRIMARY_COLOR,
    isAvailable: () => getProSettingValue(SettingIds.PRIMARY_COLOR, null) == null,
  },
];

function isGlobalPromotionCooldown() {
  const lastDismissedAnyAt = storage.get(LAST_DISMISSED_ANY_AT_KEY);

  if (lastDismissedAnyAt == null || typeof lastDismissedAnyAt !== 'number') {
    return false;
  }

  return Date.now() - lastDismissedAnyAt < PROMOTION_COOLDOWN_MS;
}

function isPromotionSlotDismissed(storageKey) {
  return storage.get(storageKey) === true;
}

class PromotionStore extends SafeEventEmitter {
  constructor() {
    super();

    // Availability depends on pro status and the pro settings each promotion gates on, so
    // re-emit whenever those change (e.g. the user picks a primary color or pro is toggled).
    for (const {settingId} of PROMOTION_SLOTS) {
      settings.on(`changed.${settingId}`, () => this.emit('changed'));
    }
    AuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.emit('changed')
    );
  }

  getAvailablePromotionKey() {
    if (isGlobalPromotionCooldown()) {
      return null;
    }

    const slot = PROMOTION_SLOTS.find(
      (promotionSlot) => !isPromotionSlotDismissed(promotionSlot.storageKey) && promotionSlot.isAvailable()
    );
    return slot?.storageKey ?? null;
  }

  hasAvailablePromotion() {
    return this.getAvailablePromotionKey() != null;
  }

  markPromotionSeen(storageKey) {
    storage.set(storageKey, true);
    storage.set(LAST_DISMISSED_ANY_AT_KEY, Date.now());
    this.emit('changed');
  }
}

export default new PromotionStore();
