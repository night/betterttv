import {create} from 'zustand';
import {UserSettingsTabs} from '@/constants';

// Tracks which setting panel is currently in view on the settings page so the
// side navigation can highlight the matching entry as the user scrolls.
const useSettingsNavigationStore = create((set, get) => ({
  activePanelId: null,
  setActivePanelId(activePanelId) {
    if (get().activePanelId === activePanelId) {
      return;
    }
    set({activePanelId});
  },

  // active tab on the user settings page (controlled so navigation can land on a specific tab)
  userSettingsTab: UserSettingsTabs.EXTENSION,
  setUserSettingsTab(userSettingsTab) {
    set({userSettingsTab});
  },
}));

export default useSettingsNavigationStore;
