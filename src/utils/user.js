import formatMessage from '@/i18n/index';
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

// The settings menu works logged out, so effect previews need a fallback name.
export function getPreviewDisplayName(currentUser, authUser) {
  return currentUser?.displayName ?? authUser?.displayName ?? formatMessage({defaultMessage: 'Username'});
}
