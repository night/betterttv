import {CommandProviders} from '@/constants';
import api from '@/utils/api';

const COMMAND_PROVIDER_ORDER = Object.values(CommandProviders);

let autocompleteSuggestionsCache = new Map();

export async function getAutocompleteSuggestions({provider, providerId, requestedBotProviders = []}) {
  const sortedRequestedBotProviders = [...requestedBotProviders].sort(
    (a, b) => COMMAND_PROVIDER_ORDER.indexOf(a) - COMMAND_PROVIDER_ORDER.indexOf(b)
  );

  const cacheKey = `${provider}:${providerId}:${sortedRequestedBotProviders.join(',')}`;
  if (autocompleteSuggestionsCache.has(cacheKey)) {
    return autocompleteSuggestionsCache.get(cacheKey);
  }

  const searchParams = new URLSearchParams();

  for (const botProvider of sortedRequestedBotProviders) {
    searchParams.append('botProviders', botProvider);
  }

  const suggestions = await api.get(`cached/users/${provider}/${providerId}/autocomplete`, {searchParams});
  autocompleteSuggestionsCache.set(cacheKey, suggestions);

  return suggestions;
}
