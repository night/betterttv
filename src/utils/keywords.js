const PHRASE_REGEX = /\{.+?\}/g;
const USER_REGEX = /\(.+?\)/g;

function defaultHighlightKeywords(value) {
  if (typeof value === 'string') return value;
  const currentUser = twitch.getCurrentUser();
  return currentUser ? currentUser.name : '';
}

function computeKeywords(keywords) {
  const computedKeywords = [];
  const computedUsers = [];

  const phrases = keywords.match(PHRASE_REGEX);
  if (phrases) {
    phrases.forEach((phrase) => {
      keywords = keywords.replace(phrase, '');
      computedKeywords.push(phrase.slice(1, -1).trim());
    });
  }

  const users = keywords.match(USER_REGEX);
  if (users) {
    users.forEach((user) => {
      keywords = keywords.replace(user, '');
      computedUsers.push(user.slice(1, -1).trim());
    });
  }

  keywords.split(' ').forEach((keyword) => {
    if (!keyword) return;
    computedKeywords.push(keyword);
  });

  return {
    computedKeywords,
    computedUsers,
  };
}

/* eslint-disable-next-line import/prefer-default-export */
export {defaultHighlightKeywords, computeKeywords};
