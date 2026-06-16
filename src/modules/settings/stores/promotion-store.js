import {SettingIds, SettingsPromotions} from '../../../constants.js';
import storage from '../../../storage.js';
import {getProSettingValue} from '../../../utils/pro.js';
import SafeEventEmitter from '../../../utils/safe-event-emitter.js';

const PROMOTION_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const LAST_DISMISSED_ANY_AT_KEY = 'settingsPromotionLastDismissedAnyAt';

// Ordered by priority; the first available promotion is the one shown.
const PROMOTION_SLOTS = [
  {
    storageKey: SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE,
    isAvailable: () => !getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false),
  },
  {
    storageKey: SettingsPromotions.THEME_CUSTOMIZE,
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
