let currentChannel;

export function setCurrentChannel({provider, id, name, displayName}) {
  currentChannel = {
    provider,
    id: id.toString(),
    name,
    displayName,
  };
}

export function getCurrentChannel() {
  return currentChannel;
}
