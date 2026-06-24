import watcher from '@/watcher';

let currentUser;

export function setCurrentUser({provider, id, name, displayName, avatar}) {
  currentUser = {
    provider,
    id: id.toString(),
    name,
    displayName,
    avatar,
  };

  watcher.emit('user.updated', currentUser);
}

export function getCurrentUser() {
  return currentUser;
}
