import {CommandProviders} from '../constants.js';
import api from '../utils/api.js';

const COMMAND_PROVIDER_ORDER = Object.values(CommandProviders);

export async function getAutocompleteSuggestions({provider, providerId, requestedBotProviders = []}) {
  const searchParams = new URLSearchParams();

  for (const botProvider of [...requestedBotProviders].sort(
    (a, b) => COMMAND_PROVIDER_ORDER.indexOf(a) - COMMAND_PROVIDER_ORDER.indexOf(b)
  )) {
    searchParams.append('botProviders', botProvider);
  }

  return api.get(`cached/users/${provider}/${providerId}/autocomplete`, {searchParams});
}
