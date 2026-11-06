const entries = [];

// Adds a result to the settings search. Call it from the file that owns what the result leads to.
//   query: the title it's found by
//   description: optional, searched and shown under the title; a result under a category only shows
//     it when it matches
//   keywords: optional, other words it's found by
//   icon: optional, shown beside the title
//   settingPanelId: the setting it belongs to, which places it under that category and hides it
//     where the setting isn't supported. Accepting it goes to the setting unless onAccept says else
//   categoryId: a category's own result
//   href: a page it opens in a new tab, which the result marks with an icon
//   onAccept: what accepting it does, given {setPage, goToCategory, goToSetting}; runs before href
export function registerSearchEntry(entry) {
  entries.push({...entry, id: entries.length});
}

function findRanges(text, terms) {
  const lowerText = text.toLowerCase();
  const ranges = [];

  for (const term of terms) {
    let start = lowerText.indexOf(term);
    while (start !== -1) {
      ranges.push([start, start + term.length]);
      start = lowerText.indexOf(term, start + term.length);
    }
  }

  ranges.sort(([a], [b]) => a - b);

  return ranges.reduce((merged, [start, end]) => {
    const last = merged[merged.length - 1];
    if (last != null && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
    return merged;
  }, []);
}

// higher is a better match, and 0 no match. every word of the search has to be found somewhere
function scoreEntry({query, description = '', keywords = []}, phrase, terms) {
  const title = query.toLowerCase();
  const body = description.toLowerCase();
  const searchable = `${title} ${body} ${keywords.join(' ').toLowerCase()}`;

  if (!terms.every((term) => searchable.includes(term))) {
    return 0;
  }

  if (title === phrase) {
    return 100;
  }
  if (title.startsWith(phrase)) {
    return 80;
  }
  if (title.includes(` ${phrase}`)) {
    return 70;
  }
  if (title.includes(phrase)) {
    return 60;
  }
  if (terms.every((term) => title.includes(term))) {
    return 50;
  }
  if (keywords.some((keyword) => keyword.toLowerCase().startsWith(phrase))) {
    return 40;
  }
  return body.includes(phrase) ? 30 : 20;
}

// the entries matching the search, best first, with the ranges of their text to highlight
export function searchEntries(text, isAvailable) {
  const phrase = text.trim().toLowerCase();
  const terms = phrase.split(/\s+/).filter((term) => term.length > 0);

  if (terms.length === 0) {
    return [];
  }

  // a setting's name can repeat as one of its rows, which would list it twice
  const seen = new Set();

  return entries
    .filter(isAvailable)
    .filter(({query, settingPanelId}) => {
      const key = `${settingPanelId}:${query.toLowerCase()}`;
      if (settingPanelId != null && seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, phrase, terms),
      queryRanges: findRanges(entry.query, terms),
      descriptionRanges: findRanges(entry.description ?? '', terms),
    }))
    .filter(({score}) => score > 0)
    .sort((a, b) => b.score - a.score || (a.entry.href != null) - (b.entry.href != null));
}

export function acceptSearchEntry({query, categoryId, href, settingPanelId, onAccept}, navigation) {
  if (onAccept != null) {
    onAccept(navigation);
  } else if (categoryId != null) {
    navigation.goToCategory(categoryId);
  } else if (href == null) {
    navigation.goToSetting(settingPanelId, query);
  }

  if (href != null) {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
}
