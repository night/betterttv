export function hasFlag(flags, flag) {
  return (flags & flag) === flag;
}

export function setFlag(flags, flag, value) {
  if (value) {
    return flags | flag;
  }
  return flags & ~flag;
}

export function getChangedFlags(oldFlags, newFlags) {
  return (oldFlags & ~newFlags) | (newFlags & ~oldFlags);
}
