// Firefox has Intl.Segmenter only from 125; splitting by code point still keeps most emoji whole
const segmenter =
  typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, {granularity: 'grapheme'}) : null;

// the first grapheme, so a flag or a joined emoji isn't cut in half
export function getInitial(name) {
  const first = segmenter != null ? segmenter.segment(name).containing(0)?.segment : Array.from(name)[0];
  return first?.toUpperCase() ?? '';
}
