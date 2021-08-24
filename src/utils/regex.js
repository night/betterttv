export function escapeRegExp(text) {
  return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
}

export function getEmoteFromRegEx(regex) {
  if (typeof regex === 'string') {
    regex = new RegExp(regex);
  }

  return decodeURI(regex.source)
    .replace('&gt\\;', '>')
    .replace('&lt\\;', '<')
    .replace(/\(\?![^)]*\)/g, '')
    .replace(/\(([^|])*\|?[^)]*\)/g, '$1')
    .replace(/\[([^|\][])*\|?[^\][]*\]/g, '$1')
    .replace(/[^\\]\?/g, '')
    .replace(/^\\b|\\b$/g, '')
    .replace(/\\(?!\\)/g, '');
}
