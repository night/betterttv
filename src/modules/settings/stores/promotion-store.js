import {useState} from 'react';
import storage from '@/storage';
import SafeEventEmitter from '@/utils/safe-event-emitter';

// A promotion marks its setting panel with a dot in the settings navigation until the user scrolls
// the panel into view. Each slot is {storageKey: SettingsPromotions..., settingPanelId: SettingPanelIds...};
// empty when nothing is currently promoted.
const PROMOTION_SLOTS = [];

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
    // a panel can carry multiple promotion slots; seeing the panel dismisses them all
    let changed = false;

    for (const slot of PROMOTION_SLOTS) {
      if (slot.settingPanelId !== settingPanelId || isPromotionSlotSeen(slot.storageKey)) {
        continue;
      }

      storage.set(slot.storageKey, true);
      changed = true;
    }

    if (changed) {
      this.emit('changed');
    }
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
