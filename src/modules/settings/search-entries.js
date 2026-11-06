import {flashSetting} from '@/modules/settings/stores/setting-flash';

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
//   onAccept: what accepting it does, given {setPage, goToCategory, goToSetting, flashSetting}; runs
//     before href. goToSetting opens a setting's page, and flashSetting scrolls to a row or group by
//     its name and marks it out
export function registerSearchEntry(entry) {
  entries.push({...entry, id: entries.length});
}

// higher is a better match, and 0 no match. every word of the search has to be found somewhere
function scoreEntry({query, description = '', keywords = []}, phrase, terms) {
  const title = query.toLowerCase();
  const searchable = `${title} ${description.toLowerCase()} ${keywords.join(' ')}`;

  if (!terms.every((term) => searchable.includes(term))) {
    return 0;
  }

  if (title === phrase) {
    return 4;
  }
  if (title.startsWith(phrase)) {
    return 3;
  }
  return title.includes(phrase) ? 2 : 1;
}

// the one match a result marks: its title before its description, and the whole search before a word
function findHighlight({query, description = ''}, phrase, terms) {
  const candidates = [phrase, ...terms];
  const title = query.toLowerCase();
  const body = description.toLowerCase();

  const titleTerm = candidates.find((term) => title.includes(term));
  if (titleTerm != null) {
    return {titleTerm};
  }

  return {descriptionTerm: candidates.find((term) => body.includes(term))};
}

// the entries matching the search, best first, with what to highlight in them
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
      descriptionMatches: terms.some((term) => entry.description?.toLowerCase().includes(term)),
      ...findHighlight(entry, phrase, terms),
    }))
    .filter(({score}) => score > 0)
    .sort((a, b) => b.score - a.score || (a.entry.href != null) - (b.entry.href != null));
}

export function acceptSearchEntry({query, categoryId, href, settingPanelId, onAccept}, navigation) {
  if (onAccept != null) {
    onAccept({...navigation, flashSetting});
  } else if (categoryId != null) {
    navigation.goToCategory(categoryId);
  } else if (href == null) {
    navigation.goToSetting(settingPanelId);
    flashSetting(query);
  }

  if (href != null) {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
}
