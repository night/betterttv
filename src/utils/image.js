/* eslint-disable import/prefer-default-export */
export function createSrcSet(images) {
  return Object.entries(images)
    .filter(([, url]) => url != null)
    .map(([size, url]) => `${url} ${size}`)
    .join(', ');
}
