import {useEffect, useState} from 'react';
import debug from '@/utils/debug';
import twitch from '@/utils/twitch';

// escapes only true regex metacharacters, unlike escapeRegExp, so the
// keyword stays substring-matchable by mantine's built-in option filter
function badgeKeyword(title) {
  return `~/^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$/`;
}

function buildBadgeOptions(globalBadges) {
  const seenTitles = new Set();
  const badgeOptions = [];

  for (const {title, imageURL} of globalBadges) {
    if (seenTitles.has(title)) {
      continue;
    }

    seenTitles.add(title);
    const keyword = badgeKeyword(title);
    // label is required; mantine strips custom option props (title, imageURL) without it
    badgeOptions.push({value: keyword, label: keyword, title, imageURL});
  }

  return badgeOptions.sort((a, b) => a.title.localeCompare(b.title));
}

let cachedBadgeOptions = null;
let badgeOptionsPromise = null;

async function fetchBadgeOptions() {
  let globalBadges;
  try {
    globalBadges = await twitch.getGlobalBadges();
  } catch (e) {
    debug.log('failed to fetch twitch global badges', e);
    badgeOptionsPromise = null;
    return [];
  }

  cachedBadgeOptions = buildBadgeOptions(globalBadges);
  return cachedBadgeOptions;
}

function useBadgeOptions(enabled) {
  const [badgeOptions, setBadgeOptions] = useState([]);

  useEffect(() => {
    if (!enabled || cachedBadgeOptions != null) {
      return undefined;
    }

    if (badgeOptionsPromise == null) {
      badgeOptionsPromise = fetchBadgeOptions();
    }

    let mounted = true;
    badgeOptionsPromise.then((options) => {
      if (!mounted) {
        return;
      }

      setBadgeOptions(options);
    });

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return cachedBadgeOptions ?? badgeOptions;
}

export default useBadgeOptions;
