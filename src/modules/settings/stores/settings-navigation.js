import {create} from 'zustand';
import {PageTypes} from '@/constants';

// Navigation state for the settings modal. Lives in a store (rather than component state) so
// module-scope code — e.g. search entries' goto handlers — can navigate the modal.
const useSettingsNavigationStore = create((set, get) => ({
  // which setting panel is currently in view on the settings page (scroll spy)
  activePanelId: null,
  setActivePanelId(activePanelId) {
    if (get().activePanelId === activePanelId) {
      return;
    }
    set({activePanelId});
  },

  // current settings modal page
  page: PageTypes.SETTINGS,
  setPage(page) {
    set({page});
  },

  // pending scroll target, consumed by the settings modal once the panel is rendered
  pendingSettingPanelId: null,
  gotoSettingPanel(settingPanelId) {
    set({page: PageTypes.SETTINGS, pendingSettingPanelId: settingPanelId});
  },
  clearPendingSettingPanel() {
    set({pendingSettingPanelId: null});
  },
}));

export function gotoSettingPanel(settingPanelId) {
  useSettingsNavigationStore.getState().gotoSettingPanel(settingPanelId);
}

export default useSettingsNavigationStore;
