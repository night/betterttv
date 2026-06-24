import {createSrc} from '@/utils/image';

export function getCanonicalEmoteId(emoteId, emoteProvider) {
  return `${emoteProvider}-${emoteId}`;
}

// Returns the emote's image type label (e.g. 'PNG', 'WEBP'), preferring a provider-supplied
// imageType and otherwise inferring it from the image URL extension.
export function getEmoteImageType(emote) {
  const imageType = emote.metadata?.imageType;
  if (imageType != null) {
    return imageType.toUpperCase();
  }

  const url = emote.images != null ? createSrc(emote.images, false) : null;
  const match = url != null ? /\.([a-z0-9]+)(?:[?#]|$)/i.exec(url) : null;
  return match != null ? match[1].toUpperCase() : null;
}
