export function escapeRegExp(text) {
  return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
}
