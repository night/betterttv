/* eslint-disable import/prefer-default-export */
export function createSrcSet(images) {
  return Object.entries(images)
    .filter(([, url]) => url != null)
    .map(([size, url]) => {
      switch (size) {
        case '3x':
          return `${url} 4x`;
        default:
          return `${url} ${size}`;
      }
    })
    .join(', ');
}
