/* eslint-disable import/prefer-default-export */
export function createSrcSet(images, hash) {
  return Object.entries(images)
    .filter(([, url]) => url != null)
    .map(([size, url]) => `${url}?${hash} ${size}`)
    .join(', ');
}
