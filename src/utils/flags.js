export function hasFlag(flags, flag) {
  if (!Number.isSafeInteger(flags)) {
    throw new Error('invalid flags');
  }
  if (!Number.isSafeInteger(flag)) {
    throw new Error('invalid flag');
  }
  return (flags & flag) === flag;
}

export function setFlag(flags, flag, value) {
  if (!Number.isSafeInteger(flags)) {
    throw new Error('invalid flags');
  }
  if (!Number.isSafeInteger(flag)) {
    throw new Error('invalid flag');
  }
  if (value) {
    return flags | flag;
  }
  return flags & ~flag;
}

export function getChangedFlags(oldFlags, newFlags) {
  if (!Number.isSafeInteger(oldFlags)) {
    throw new Error('invalid oldFlags');
  }
  if (!Number.isSafeInteger(newFlags)) {
    throw new Error('invalid newFlags');
  }
  return (oldFlags & ~newFlags) | (newFlags & ~oldFlags);
}
