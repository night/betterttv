import {useState} from 'react';
import {SettingsPromotions} from '@/constants';
import {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import storage from '@/storage';
import SafeEventEmitter from '@/utils/safe-event-emitter';

// A promotion marks its setting panel with a dot in the settings navigation until the user scrolls
// the panel into view.
const PROMOTION_SLOTS = [
  {
    storageKey: SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE,
    settingPanelId: SettingPanelIds.CHATBOTS,
  },
  {
    storageKey: SettingsPromotions.SELF_BOT,
    settingPanelId: SettingPanelIds.SELF_BOT,
  },
  {
    storageKey: SettingsPromotions.USERNAME_EFFECT,
    settingPanelId: SettingPanelIds.USERNAME_EFFECT,
  },
  {
    storageKey: SettingsPromotions.SUBSCRIPTION_BADGE,
    settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
  },
];

function isPromotionSlotSeen(storageKey) {
  return storage.get(storageKey) === true;
}

class PromotionStore extends SafeEventEmitter {
  // Panels whose dot hasn't been dismissed yet — not marked seen. Drives the red dots.
  getUnseenSettingPanelIds() {
    return PROMOTION_SLOTS.filter((slot) => !isPromotionSlotSeen(slot.storageKey)).map((slot) => slot.settingPanelId);
  }

  hasAvailablePromotion() {
    return this.getUnseenSettingPanelIds().length > 0;
  }

  // Whether a panel has a promotion, regardless of whether its dot has been dismissed. The "New"
  // badge on the setting reads this, so it stays until the promotion slot is removed.
  hasPromotion(settingPanelId) {
    return PROMOTION_SLOTS.some((slot) => slot.settingPanelId === settingPanelId);
  }

  markSettingPanelPromotionSeen(settingPanelId) {
    const slot = PROMOTION_SLOTS.find((promotionSlot) => promotionSlot.settingPanelId === settingPanelId);

    if (slot == null || isPromotionSlotSeen(slot.storageKey)) {
      return;
    }

    storage.set(slot.storageKey, true);
    this.emit('changed');
  }
}

const promotionStore = new PromotionStore();

// The setting panels carrying a red dot for this run of the settings modal, as a Set. Snapshotted
// once at mount, so dismissing a dot (scrolling its panel into view) only takes effect the next
// time the modal is opened — the dot the user is looking at doesn't vanish out from under them.
export function useUnseenSettingPanelIds() {
  const [unseenSettingPanelIds] = useState(() => new Set(promotionStore.getUnseenSettingPanelIds()));
  return unseenSettingPanelIds;
}

// Whether a setting panel is promoted, for badging the setting it promotes. Read once at mount and
// independent of seen state, so the "New" badge is permanent — it stays even after the dot is
// dismissed, until the promotion slot is removed.
export function useHasPromotion(settingPanelId) {
  const [hasPromotion] = useState(() => promotionStore.hasPromotion(settingPanelId));
  return hasPromotion;
}

export default promotionStore;
