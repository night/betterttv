import Emote from '../emotes/emote.js';
import {hasFlag} from '../../utils/flags.js';

function emoteUrl(id, version, static_ = false) {
  return `https://cdn.7tv.app/emote/${encodeURIComponent(id)}/${version}${static_ ? '_static' : ''}.webp`;
}

export function createEmote(id, code, animated, owner, category, overlay) {
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
      '1x': emoteUrl(id, '1x'),
      '2x': emoteUrl(id, '2x'),
      '4x': emoteUrl(id, '4x'),
      '1x_static': animated ? emoteUrl(id, '1x', true) : undefined,
      '2x_static': animated ? emoteUrl(id, '2x', true) : undefined,
      '4x_static': animated ? emoteUrl(id, '4x', true) : undefined,
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
