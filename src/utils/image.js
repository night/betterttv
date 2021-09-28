/* eslint-disable import/prefer-default-export */
export function createSrcSet(images, sizes = ['1x', '2x', '4x']) {
  const srcSet = Object.entries(images)
    .filter(([size, url]) => url != null && sizes.includes(size))
    .map(([size, url]) => `${url} ${size}`);
  return srcSet.length > 0 ? srcSet.join(', ') : null;
}
