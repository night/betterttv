/* eslint-disable import/prefer-default-export */
export function escapeRegExp(text) {
  return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
}
