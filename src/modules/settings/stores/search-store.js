const entries = new Map();

function tokenize(value) {
  return (
    value
      .replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2')
      .toLocaleLowerCase()
      .match(/[\p{L}\d]+/gu) ?? []
  );
}

function differsByAtMostOneCharacter(left, right) {
  if (Math.abs(left.length - right.length) > 1) {
    return false;
  }

  let leftIndex = 0;
  let rightIndex = 0;
  let differences = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex++;
      rightIndex++;
      continue;
    }

    if (++differences > 1) {
      return false;
    }

    if (left.length > right.length) {
      leftIndex++;
    } else if (right.length > left.length) {
      rightIndex++;
    } else {
      leftIndex++;
      rightIndex++;
    }
  }

  return differences + (leftIndex < left.length || rightIndex < right.length ? 1 : 0) <= 1;
}

function fuzzyTokensMatch(query, ...values) {
  const queryTokens = tokenize(query);
  const valueTokens = values.flatMap((value) => tokenize(value ?? ''));

  return queryTokens.every((queryToken) =>
    valueTokens.some(
      (valueToken) =>
        valueToken.includes(queryToken) ||
        (queryToken.length >= 4 && differsByAtMostOneCharacter(queryToken, valueToken))
    )
  );
}

class SearchStore {
  registerSearchEntry({key, name, description = null, settingPanelId, predicate = null}) {
    if (typeof key !== 'string' || typeof name !== 'string' || typeof settingPanelId !== 'string') {
      return;
    }

    entries.set(key, {
      name,
      description: typeof description === 'string' ? description : null,
      settingPanelId,
      predicate,
    });
  }

  search(query) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (normalizedQuery.length === 0) {
      return [];
    }

    const nameStartsWith = [];
    const nameIncludes = [];
    const descriptionIncludes = [];
    const fuzzyMatches = [];

    for (const entry of entries.values()) {
      if (entry.predicate != null && !entry.predicate()) {
        continue;
      }

      const normalizedName = entry.name.toLocaleLowerCase();
      if (normalizedName.startsWith(normalizedQuery)) {
        nameStartsWith.push(entry);
      } else if (normalizedName.includes(normalizedQuery)) {
        nameIncludes.push(entry);
      } else if (entry.description?.toLocaleLowerCase().includes(normalizedQuery)) {
        descriptionIncludes.push(entry);
      } else if (fuzzyTokensMatch(query, entry.name, entry.description)) {
        fuzzyMatches.push(entry);
      }
    }

    return [...nameStartsWith, ...nameIncludes, ...descriptionIncludes, ...fuzzyMatches];
  }
}

export default new SearchStore();
