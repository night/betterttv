/* eslint-disable import/prefer-default-export */
export const DEFAULT_SIZES = ['1x', '2x', '4x'];
const STATIC_SIZES = {
  '1x': '1x_static',
  '2x': '2x_static',
  '4x': '4x_static',
};

export function createSrcSet(images, static_ = false, sizes = DEFAULT_SIZES) {
  const srcSet = [];

  for (const size of sizes) {
    let image;
    if (static_) {
      image = images[STATIC_SIZES[size]] ?? images[size];
    } else {
      image = images[size];
    }

    if (image == null) {
      continue;
    }

    srcSet.push(`${image} ${size}`);
  }

  if (srcSet.length === 0) {
    const image = images[STATIC_SIZES['1x']] ?? images['1x'];
    if (image != null) {
      srcSet.push(`${image} 1x`);
    }
  }

  return srcSet.length > 0 ? srcSet.join(', ') : null;
}

export function createSrc(images, static_ = false, size = '1x') {
  if (static_) {
    return images[STATIC_SIZES[size]] ?? images[STATIC_SIZES['1x']] ?? images[size] ?? images['1x'];
  }
  return images[size] ?? images['1x'];
}
