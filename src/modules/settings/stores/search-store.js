// Searchable index of every setting. Settings register one entry per user-facing option (a panel
// with multiple options, e.g. BetterTTV/FrankerFaceZ/7TV emotes, registers each one) with the
// name and description the option displays, plus a `goto` handler that navigates to it. Matches
// rank name prefixes first, then name substrings, then description substrings; an empty query
// returns every entry in registration order.
const entries = [];

class SearchStore {
  registerSearchEntry({name, description = null, goto, predicate = null}) {
    if (name == null || typeof name !== 'string') {
      throw new Error('Name is required');
    }

    if (typeof goto !== 'function') {
      throw new Error('Goto is required');
    }

    if (predicate != null && typeof predicate !== 'function') {
      throw new Error('Predicate must be a function');
    }

    entries.push({name, description, goto, predicate});
  }

  search(query) {
    // Predicates run at query time so results track live state (auth, standalone window, etc.).
    const isAvailable = (entry) => entry.predicate == null || entry.predicate();

    if (query == null || query.length === 0) {
      return entries.filter(isAvailable);
    }

    const normalizedQuery = query.toLowerCase();
    const nameStartsWith = [];
    const nameIncludes = [];
    const descriptionIncludes = [];

    for (const entry of entries) {
      if (!isAvailable(entry)) {
        continue;
      }

      const normalizedName = entry.name.toLowerCase();
      if (normalizedName.startsWith(normalizedQuery)) {
        nameStartsWith.push(entry);
      } else if (normalizedName.includes(normalizedQuery)) {
        nameIncludes.push(entry);
      } else if (entry.description != null && entry.description.toLowerCase().includes(normalizedQuery)) {
        descriptionIncludes.push(entry);
      }
    }

    return [...nameStartsWith, ...nameIncludes, ...descriptionIncludes];
  }
}

export default new SearchStore();
