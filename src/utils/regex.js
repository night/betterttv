/* eslint-disable-next-line import/prefer-default-export */
export function escapeRegExp(text) {
  return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
}
