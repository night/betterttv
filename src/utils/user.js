let currentUser;

export function setCurrentUser({provider, id, name, displayName, avatar}) {
  currentUser = {
    provider,
    id: id.toString(),
    name,
    displayName,
    avatar,
  };
}

export function getCurrentUser() {
  return currentUser;
}
