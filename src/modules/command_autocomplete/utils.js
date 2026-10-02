import {UserLevelHierarchy, UserLevels} from '@/constants';

// Fossabot emits a separate broadcaster role alongside its owner role.
const UserLevelAliases = {broadcaster: UserLevels.OWNER};

// A command's userLevel is either a minimum level (string) or the set of levels its bot grants
// it to (array). Reduce both to the lowest level in the hierarchy — "the lowest level that can
// use this command" — skipping unknown levels. Returns null when no known level remains.
export function getMinimumUserLevel(userLevel) {
  const levels = Array.isArray(userLevel) ? userLevel : [userLevel];

  let minimumLevel = null;
  for (const level of levels) {
    if (typeof level !== 'string') {
      continue;
    }

    const normalizedLevel = level.toLowerCase();
    const resolvedLevel = UserLevelAliases[normalizedLevel] ?? normalizedLevel;
    if (UserLevelHierarchy[resolvedLevel] == null) {
      continue;
    }

    if (minimumLevel == null || UserLevelHierarchy[resolvedLevel] < UserLevelHierarchy[minimumLevel]) {
      minimumLevel = resolvedLevel;
    }
  }

  return minimumLevel;
}
