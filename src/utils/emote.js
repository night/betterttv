/* eslint-disable import/prefer-default-export */
export function getCanonicalEmoteId(emoteId, emoteProvider) {
  return `${emoteProvider}-${emoteId}`;
}
