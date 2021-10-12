let currentChannel;

export function setCurrentChannel({provider, id, name, displayName, avatar}) {
  currentChannel = {
    provider,
    id: id.toString(),
    name,
    displayName,
    avatar,
  };
}

export function getCurrentChannel() {
  return currentChannel;
}
