import {create} from 'zustand';

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
}));

export default useSettingsNavigationStore;
