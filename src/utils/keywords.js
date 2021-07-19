const PHRASE_REGEX = /\{.+?\}/g;
const USER_REGEX = /\(.+?\)/g;

export const Types = {
  MESSAGE: 0,
  WILDCARD: 1,
  EXACT: 2,
  USER: 3,
};

export function computeKeywords(keywords) {
  const computedKeywords = [];
  const computedUsers = [];

  for (const {keyword, type} of Object.values(keywords)) {
    switch (type) {
      case Types.MESSAGE:
        computedKeywords.push(`${keyword}`);
        break;
      case Types.WILDCARD:
        computedKeywords.push(`${keyword}*`);
        break;
      case Types.EXACT:
        computedKeywords.push(`<${keyword}>`);
        break;
      case Types.USER:
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
    .map(({keyword, type}) => {
      if (keyword.length === 0) return '';
      switch (type) {
        case Types.MESSAGE:
          return `{${keyword}}`;
        case Types.WILDCARD:
          return `{${keyword}*}`;
        case Types.EXACT:
          return `{<${keyword}>}`;
        case Types.USER:
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

  const keywordString = computedKeywords
    .map((keyword) => {
      switch (true) {
        case keyword.length === 0:
          return false;
        case /\*/g.test(keyword):
          return {
            id: index++,
            type: Types.WILDCARD,
            keyword: keyword.replace('*', ''),
          };
        case /^<(.*)>$/g.test(keyword):
          return {
            id: index++,
            type: Types.EXACT,
            keyword: keyword.replace(/(<|>)/g, ''),
          };
        default:
          return {
            id: index++,
            keyword,
            type: Types.MESSAGE,
          };
      }
    })
    .filter((string) => string !== false);

  const usersString = computedUsers.map((user) => ({
    id: index++,
    keyword: user,
    type: Types.USER,
  }));

  const data = {};

  for (const keyword of [...keywordString, ...usersString]) {
    data[keyword.id] = keyword;
  }

  return data;
}
