const PHRASE_REGEX = /\{.+?\}/g;
const USER_REGEX = /\(.+?\)/g;

export const KeywordTypes = {
  MESSAGE: 0,
  WILDCARD: 1, // legacy type
  EXACT: 2, // legacy type
  USER: 3,
};

export function computeKeywords(keywords) {
  const computedKeywords = [];
  const computedUsers = [];

  for (const {keyword, type} of Object.values(keywords)) {
    if (keyword.trim().length === 0) {
      continue;
    }

    switch (type) {
      case KeywordTypes.EXACT:
      case KeywordTypes.WILDCARD:
      case KeywordTypes.MESSAGE:
        computedKeywords.push(`${keyword}`);
        break;
      case KeywordTypes.USER:
        computedUsers.push(`${keyword}`);
        break;
      default:
        break;
    }
  }

  return {
    computedKeywords,
    computedUsers,
  };
}

export function deserializeKeywords(values) {
  return Object.values(values)
    .filter(({keyword}) => /\S/.test(keyword))
    .map(({keyword, type}) => {
      switch (type) {
        case KeywordTypes.EXACT:
        case KeywordTypes.WILDCARD:
        case KeywordTypes.MESSAGE:
          return `{${keyword}}`;
        case KeywordTypes.USER:
          return `(${keyword})`;
        default:
          return '';
      }
    })
    .join(' ');
}

export function serializeKeywords(keywords) {
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

  let index = 0;

  const keywordArray = computedKeywords
    .filter((keyword) => /\S/.test(keyword))
    .map((keyword) => ({id: index++, keyword, type: KeywordTypes.MESSAGE}));

  const usersArray = computedUsers
    .filter((user) => /\S/.test(user))
    .map((user) => ({id: index++, keyword: user, type: KeywordTypes.USER}));

  const data = {};

  for (const keyword of [...keywordArray, ...usersArray]) {
    data[keyword.id] = keyword;
  }

  return data;
}
