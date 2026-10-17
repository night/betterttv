import {create} from 'zustand';

export function searchableText(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(searchableText).join(' ');
  }

  if (value != null && typeof value === 'object' && value.props?.children != null) {
    return searchableText(value.props.children);
  }

  return '';
}

export function tokenize(value) {
  return (
    searchableText(value)
      .replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2')
      .toLocaleLowerCase()
      .match(/[\p{L}\d]+/gu) ?? []
  );
}

export function settingsSearchMatches(query, ...values) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return true;
  }

  const valueTokens = values.flatMap((value) => tokenize(value ?? ''));
  return queryTokens.every((queryToken) => valueTokens.some((valueToken) => valueToken.includes(queryToken)));
}

let pendingEntries = {};
let registrationScheduled = false;

const useSettingsSearchStore = create((set) => ({
  query: '',
  entries: {},
  setQuery: (query) => set({query}),
  registerEntry: (key, entry) => {
    pendingEntries[key] = entry;
    if (registrationScheduled) {
      return;
    }

    // SettingWrapper mounts many controls at once. Coalesce their effect-driven registrations into
    // one store update so subscribers are not notified once per control.
    registrationScheduled = true;
    queueMicrotask(() => {
      const entriesToRegister = pendingEntries;
      pendingEntries = {};
      registrationScheduled = false;

      set((state) => {
        let changed = false;
        const entries = {...state.entries};

        for (const [entryKey, nextEntry] of Object.entries(entriesToRegister)) {
          if (entries[entryKey] != null) {
            continue;
          }

          entries[entryKey] = nextEntry;
          changed = true;
        }

        return changed ? {entries} : state;
      });
    });
  },
}));

export function panelMatchesSearch(setting, query, entries) {
  if (settingsSearchMatches(query, setting.name)) {
    return true;
  }

  return Object.values(entries).some(
    (entry) =>
      entry.settingPanelId === setting.settingPanelId && settingsSearchMatches(query, entry.name, entry.description)
  );
}

export default useSettingsSearchStore;
