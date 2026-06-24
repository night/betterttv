import isSafeRegex from 'safe-regex2';

export const REGEX_KEYWORD_REGEX = /^~\/(.*)\/([a-z]+)?$/;

export function extractRegex(keyword) {
  const matches = REGEX_KEYWORD_REGEX.exec(keyword);
  if (matches == null || !isSafeRegex(matches[1])) {
    return null;
  }

  try {
    return new RegExp(matches[1], matches[2]);
  } catch (_) {}

  return null;
}
