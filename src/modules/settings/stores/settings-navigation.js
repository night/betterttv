import {create} from 'zustand';

// Tracks which setting panel is currently in view on the settings page so the
// side navigation can highlight the matching entry as the user scrolls.
const useSettingsNavigationStore = create((set) => ({
  activePanelId: null,
  setActivePanelId: (activePanelId) => set({activePanelId}),
}));

export default useSettingsNavigationStore;
