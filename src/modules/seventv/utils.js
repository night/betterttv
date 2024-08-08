import {hasFlag} from '../../utils/flags.js';
import Emote from '../emotes/emote.js';

function emoteUrl(url, version, static_ = false) {
  return `${url}/${version}${static_ ? '_static' : ''}.webp`;
}

export function createEmote(id, code, animated, owner, category, overlay, url) {
  return new Emote({
    id,
    category,
    channel: {
      id: owner?.id ?? '0',
      name: owner?.username ?? owner?.login ?? 'deleted_user',
      displayName: owner?.display_name ?? 'Deleted User',
    },
    code,
    animated,
    images: {
      '1x': emoteUrl(url, '1x'),
      '2x': emoteUrl(url, '2x'),
      '4x': emoteUrl(url, '4x'),
      '1x_static': animated ? emoteUrl(url, '1x', true) : undefined,
      '2x_static': animated ? emoteUrl(url, '2x', true) : undefined,
      '4x_static': animated ? emoteUrl(url, '4x', true) : undefined,
    },
    metadata: {
      isOverlay: overlay,
    },
  });
}

export function isOverlay(flags, isLegacy = false) {
  if (flags == null) {
    return false;
  }

  return hasFlag(flags, isLegacy ? 1 << 7 : 1 << 8);
}
