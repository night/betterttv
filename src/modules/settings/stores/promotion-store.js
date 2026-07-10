import {useState} from 'react';
import {SettingIds, SettingsPromotions} from '@/constants';
import {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import settings from '@/settings';
import storage from '@/storage';
import AuthStore from '@/stores/auth';
import {getProSettingValue} from '@/utils/pro';
import SafeEventEmitter from '@/utils/safe-event-emitter';

// A promotion marks its setting panel with a dot in the settings navigation until the user scrolls
// the panel into view. `settingId` is the local setting whose value gates the promotion, watched so
// availability stays in sync (an enabled feature no longer needs promoting); omit it for promotions
// gated on the authenticated user instead (see the auth subscription below).
const PROMOTION_SLOTS = [
  {
    storageKey: SettingsPromotions.CHATBOT_COMMAND_AUTOCOMPLETE,
    settingId: SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE,
    settingPanelId: SettingPanelIds.CHATBOTS,
    isAvailable: () => !getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false),
  },
  {
    storageKey: SettingsPromotions.SELF_BOT,
    settingId: SettingIds.SELF_BOT,
    settingPanelId: SettingPanelIds.SELF_BOT,
    isAvailable: () => settings.get(SettingIds.SELF_BOT) !== true,
  },
  {
    storageKey: SettingsPromotions.USERNAME_EFFECT,
    settingPanelId: SettingPanelIds.USERNAME_EFFECT,
    isAvailable: () => AuthStore.getState().user?.usernameEffect == null,
  },
  {
    storageKey: SettingsPromotions.SUBSCRIPTION_BADGE,
    settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
    isAvailable: () => AuthStore.getState().user?.subscriptionBadge !== true,
  },
];

function isPromotionSlotSeen(storageKey) {
  return storage.get(storageKey) === true;
}

class PromotionStore extends SafeEventEmitter {
  constructor() {
    super();

    // Availability depends on pro status and the settings each promotion gates on, so re-emit
    // whenever those change (e.g. the user toggles self bot or pro is toggled).
    for (const {settingId} of PROMOTION_SLOTS) {
      if (settingId == null) {
        continue;
      }
      settings.on(`changed.${settingId}`, () => this.emit('changed'));
    }
    AuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.emit('changed')
    );
    // The username-effect promotion clears once the user picks an effect (stored on their account).
    AuthStore.subscribe(
      (state) => state.user?.usernameEffect ?? null,
      () => this.emit('changed')
    );
    // The subscription-badge promotion clears once the user enables their badge (stored on their account).
    AuthStore.subscribe(
      (state) => state.user?.subscriptionBadge ?? false,
      () => this.emit('changed')
    );
  }

  // Panels whose dot hasn't been dismissed yet — promoted and not marked seen. Drives the red dots.
  getUnseenSettingPanelIds() {
    return PROMOTION_SLOTS.filter((slot) => slot.isAvailable() && !isPromotionSlotSeen(slot.storageKey)).map(
      (slot) => slot.settingPanelId
    );
  }

  hasAvailablePromotion() {
    return this.getUnseenSettingPanelIds().length > 0;
  }

  // Whether a panel's promotion applies (the feature isn't in use yet), regardless of whether its
  // dot has been dismissed. The "New" badge on the setting reads this, so it stays until the
  // feature is actually used rather than disappearing once the dot is seen.
  hasPromotion(settingPanelId) {
    return PROMOTION_SLOTS.some((slot) => slot.settingPanelId === settingPanelId && slot.isAvailable());
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
// dismissed, until the promoted feature is actually used.
export function useHasPromotion(settingPanelId) {
  const [hasPromotion] = useState(() => promotionStore.hasPromotion(settingPanelId));
  return hasPromotion;
}

export default promotionStore;
