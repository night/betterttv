let currentUser;

export function setCurrentUser({provider, id, name, displayName}) {
  currentUser = {
    provider,
    id: id.toString(),
    name,
    displayName,
  };
}

export function getCurrentUser() {
  return currentUser;
}
