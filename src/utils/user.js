import watcher from '@/watcher';

const PROFILE_PICTURE_SELECTOR = '[data-a-target="user-menu-toggle"] .tw-image-avatar';

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

export function getCurrentUserProfilePicture() {
  return document.querySelector(PROFILE_PICTURE_SELECTOR)?.getAttribute('src');
}
